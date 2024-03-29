import { cnvTreeCSS } from '../cnvTreeStyles';
import { getCurrentCnvContainer } from '../elementFinders';
import { parseCurrentCnvTree } from '../parse/cnvTree';
import { genericLines } from '../parse/genericLines';
import { CnvNode, Conversations } from '../types';
import {
  appendSpanWithText,
  clearChildren,
  getName,
  jumpToId,
  parseReaction,
} from './utils';

function renderCnvNodeCheckbox(parent: Element) {
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  parent.appendChild(checkbox);
}

function renderCnvNodeId(parent: Element, id?: string) {
  if (!id) return false;

  appendSpanWithText(parent, id, 'cnv-id');

  return true;
}

function renderCnvNodeForce(parent: Element, force?: string | number) {
  if (!force) return false;

  const isDark =
    typeof force === 'number'
      ? force < 0
      : force.toLowerCase().includes('dark');

  appendSpanWithText(
    parent,
    `${isDark || !Number(force) ? '' : '+'}${force}`,
    isDark ? 'cnv-force-dark' : 'cnv-force-light'
  );

  return true;
}

function renderCnvNodeLine(
  parent: Element,
  text?: string,
  speaker?: string,
  generic?: string | undefined,
  isPlayer?: boolean
) {
  if (!text) return false;

  const textParts = text.split('\n');

  if (isPlayer && (textParts.length > 1 || generic)) {
    appendSpanWithText(
      parent,
      `Option: ${textParts[1] || textParts[0]}`.replace('💬︎', ''),
      'cnv-option'
    );
  }

  appendSpanWithText(
    parent,
    isPlayer ? 'Player' : getName(speaker),
    `cnv-speaker ${isPlayer ? 'cnv-player' : 'cnv-npc'}`
  );

  appendSpanWithText(
    parent,
    `- ${
      generic ? genericLines.get(generic) || `generic ${generic}` : textParts[0]
    }`.replace('💬︎', ''),
    generic ? 'cnv-generic' : 'cnv-text'
  );

  return true;
}

function renderCnvLink(parent: HTMLElement, link?: string) {
  if (!link) return false;

  appendSpanWithText(parent, `Link to ${link}`, 'cnv-link');

  parent.onclick = () => jumpToId(link);

  return true;
}

function renderCnvNodeReactions(
  parent: Element,
  reactions?: [string, string][]
) {
  if (!reactions || !reactions.length) return false;

  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  table.className = 'cnv-reactions';

  reactions.forEach(([reactor, reaction]) => {
    const [parsedReactor, parsedReaction] = parseReaction(
      getName(reactor),
      reaction
    );

    const trow = document.createElement('tr');

    const companionTd = document.createElement('td');
    companionTd.appendChild(document.createTextNode(parsedReactor));
    trow.appendChild(companionTd);

    const reactionTd = document.createElement('td');
    reactionTd.appendChild(document.createTextNode(parsedReaction));
    trow.appendChild(reactionTd);

    tbody.appendChild(trow);
  });

  table.appendChild(tbody);
  parent.appendChild(table);

  return true;
}

function createCnvNode(
  {
    id,
    text,
    force,
    speaker,
    isPlayer,
    generic,
    reactions,
    link,
  }: {
    id?: string;
    text?: string;
    force?: string | number;
    speaker?: string;
    isPlayer?: boolean;
    generic?: string;
    reactions?: [string, string][];
    link?: string;
  },
  hasChildren?: boolean
) {
  const newElement = document.createElement('li');
  const span = document.createElement('span');

  if (hasChildren) {
    renderCnvNodeCheckbox(newElement);
  } else {
    span.classList.add('cnv-childless');
  }

  newElement.appendChild(span);

  const hasId = renderCnvNodeId(span, id);
  if (hasId) {
    span.classList.add('cnv-node');

    renderCnvNodeForce(span, force);
    renderCnvNodeLine(span, text, speaker, generic, isPlayer);

    if (!hasChildren) {
      appendSpanWithText(span, 'conversation end', 'cnv-end');
    }
  } else {
    span.classList.add('cnv-util');

    const isLink = renderCnvLink(span, link);
    if (!isLink) {
      span.appendChild(document.createTextNode(text ? text : 'node'));
    }
  }

  renderCnvNodeReactions(span, reactions);

  return newElement;
}

function renderChildList(parent: Element) {
  const childList = document.createElement('ul');
  parent.appendChild(childList);

  return childList;
}

function renderCnvNodes(
  [cnvNodes, topLevelIds]: Conversations,
  listElement: Element
) {
  const renderQueue: [string, Element][] = topLevelIds.map((id) => [
    id,
    listElement,
  ]);
  const timesLinked = new Map<string, number>();
  const linkResolved = new Map<string, Element | true>();

  function renderLinkNode(toId: string, parentElement: Element) {
    const linkElement = createCnvNode({ link: toId });
    parentElement.appendChild(linkElement);

    timesLinked.set(toId, (timesLinked.get(toId) || 0) + 1);
    if (linkResolved.get(toId) !== true) linkResolved.set(toId, linkElement);
  }

  function renderCnvNode(id: string, cnvNode: CnvNode, parentElement: Element) {
    linkResolved.set(id, true);
    const hasChildren = cnvNode.children.size > 0;

    const cnvNodeElement = createCnvNode(cnvNode, hasChildren);
    parentElement.appendChild(cnvNodeElement);

    if (hasChildren) {
      const childList = renderChildList(cnvNodeElement);
      Array.from(cnvNode.children)
        .reverse()
        .forEach((id) => renderQueue.push([id, childList]));
    }
  }

  function renderLoop() {
    while (true) {
      const nextNode = renderQueue.pop();
      if (!nextNode) break;
      const [id, parentElement] = nextNode;
      const cnvNode = cnvNodes.get(id);

      if (cnvNode && cnvNode.parents.size - (timesLinked.get(id) || 0) === 1) {
        renderCnvNode(id, cnvNode, parentElement);
      } else {
        renderLinkNode(id, parentElement);
      }
    }
  }

  renderLoop();

  // deal with possible cycles
  while (true) {
    const nextNode = <[string, Element] | undefined>(
      Array.from(linkResolved).find(([_, resolved]) => resolved !== true)
    );
    if (!nextNode) break;
    const [id, linkElement] = nextNode;
    const cnvNode = cnvNodes.get(id);
    if (!cnvNode) {
      linkResolved.delete(id);
      continue;
    }

    const parentElement = linkElement.parentElement;
    if (!parentElement) continue;
    linkElement.remove();

    renderCnvNode(id, cnvNode, parentElement);
    timesLinked.set(id, Infinity);
    renderLoop();
  }
}

export function renderConversations(conversations: Conversations) {
  const container = getCurrentCnvContainer();
  clearChildren(container);
  const shadowContainer = document.createElement('div');
  container.appendChild(shadowContainer);

  //doing this instead of using CSSStyleSheet
  //due to a bug/oversight in Firefox
  const style = document.createElement('style');
  style.textContent = cnvTreeCSS;

  const shadow = shadowContainer.attachShadow({ mode: 'open' });
  shadow.appendChild(style);

  const conversationDiv = document.createElement('div');
  shadow.appendChild(conversationDiv);

  const tree = document.createElement('ul');
  tree.className = 'tree';
  conversationDiv.appendChild(tree);

  renderCnvNodes(conversations, tree);
}

export function renderCurrentConversations() {
  renderConversations(parseCurrentCnvTree());
}
