import { cnvTreeCSS } from "../cnvTreeStyles";
import { getCurrentCnvContainer } from "../elementFinders";
import { parseCurrentCnvTree } from "../parse/cnvTree";
import { genericLines } from "../parse/genericLines";
import { CnvNode, Conversations } from "../types";
import {
  appendSpanWithText,
  clearChildren,
  getName,
  jumpToId,
  parseReaction,
} from "./utils";

function renderCnvNodeCheckbox(parent: Element) {
  const checkbox = document.createElement("input");
  checkbox.setAttribute("type", "checkbox");
  parent.appendChild(checkbox);
}

function renderCnvNodeId(parent: Element, id?: string) {
  if (!id) return false;

  appendSpanWithText(parent, id, "cnv-id");

  return true;
}

function renderCnvNodeCondition(parent: Element, condition: string) {
  appendSpanWithText(
    parent,
    condition.replace("==i", "==").replace("==b", "=="),
    "cnv-cnd"
  );
}

function renderCnvNodeForce(parent: Element, force?: string | number) {
  if (!force) return false;

  const isDark =
    typeof force === "number"
      ? force < 0
      : force.toLowerCase().includes("dark");

  appendSpanWithText(
    parent,
    `${isDark || !Number(force) ? "" : "+"}${force}`,
    isDark ? "cnv-force-dark" : "cnv-force-light"
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

  const textParts = text.split("\n");

  if (isPlayer && (textParts.length > 1 || generic)) {
    appendSpanWithText(
      parent,
      `Option: ${textParts[1] || textParts[0]}`.replace("💬︎", ""),
      "cnv-option"
    );
  }

  appendSpanWithText(
    parent,
    isPlayer ? "Player" : getName(speaker),
    `cnv-speaker ${isPlayer ? "cnv-player" : "cnv-npc"}`
  );

  appendSpanWithText(
    parent,
    `- ${
      generic ? genericLines.get(generic) || `generic ${generic}` : textParts[0]
    }`.replace("💬︎", ""),
    generic ? "cnv-generic" : "cnv-text"
  );

  return true;
}

function renderCnvLink(parent: HTMLElement, link?: string) {
  if (!link) return false;

  appendSpanWithText(parent, `Link to ${link}`, "cnv-link");

  parent.onclick = () => jumpToId(link);

  return true;
}

function createReactionRow(reactor: string, reaction: string) {
  const [parsedReactor, parsedReaction] = parseReaction(
    getName(reactor),
    reaction
  );

  const trow = document.createElement("tr");

  const companionTd = document.createElement("td");
  companionTd.appendChild(document.createTextNode(parsedReactor));
  trow.appendChild(companionTd);

  const reactionTd = document.createElement("td");
  reactionTd.appendChild(document.createTextNode(parsedReaction));
  trow.appendChild(reactionTd);

  return trow;
}

function renderCnvNodeReactions(
  parent: Element,
  reactions: [string, string][],
  actionString: string
) {
  if (!reactions.length && !actionString) return false;

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  table.className = "cnv-reactions";

  reactions.forEach(([reactor, reaction]) => {
    tbody.appendChild(createReactionRow(reactor, reaction));
  });

  if (actionString) {
    const trow = createReactionRow(
      "SET VARIABLE",
      actionString.replace("==i", "=").replace("==b", "=")
    );
    trow.classList.add("cnv-cnd");
    tbody.appendChild(trow);
  }

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
    actionString,
    conditionString,
    conditionMatters,
  }: CnvNode,
  hasChildren?: boolean
) {
  const newElement = document.createElement("li");
  const span = document.createElement("span");

  if (hasChildren) {
    renderCnvNodeCheckbox(newElement);
  } else {
    span.classList.add("cnv-childless");
  }

  newElement.appendChild(span);

  const hasId = renderCnvNodeId(span, id);
  if (conditionMatters && conditionString) {
    renderCnvNodeCondition(span, conditionString);
    if (text) {
      span.appendChild(document.createElement("br"));
    }
  }
  if (hasId) {
    span.classList.add("cnv-node");

    renderCnvNodeForce(span, force);
    renderCnvNodeLine(span, text, speaker, generic, isPlayer);

    if (!hasChildren) {
      appendSpanWithText(span, "conversation end", "cnv-end");
    }
  } else {
    span.classList.add("cnv-util");
    span.appendChild(document.createTextNode(text ? text : "node"));
  }

  renderCnvNodeReactions(span, reactions, actionString);

  return newElement;
}

function renderChildList(parent: Element) {
  const childList = document.createElement("ul");
  parent.appendChild(childList);

  return childList;
}

function createLinkNode(link: string) {
  const newElement = document.createElement("li");
  const span = document.createElement("span");
  span.classList.add("cnv-childless");
  newElement.appendChild(span);
  span.classList.add("cnv-util");
  renderCnvLink(span, link);

  return newElement;
}

function renderCnvNodes(
  [cnvNodes, topLevelIds]: Conversations,
  listElement: Element
) {
  const renderQueue: [string, Element][] = topLevelIds
    .slice()
    .reverse()
    .map((id) => [id, listElement]);
  const rendered = new Set<string>();

  function renderLinkNode(toId: string, parentElement: Element) {
    parentElement.prepend(createLinkNode(toId));
  }

  function renderCnvNode(id: string, cnvNode: CnvNode, parentElement: Element) {
    rendered.add(id);

    const hasChildren = cnvNode.children.length > 0;

    const cnvNodeElement = createCnvNode(cnvNode, hasChildren);
    parentElement.prepend(cnvNodeElement);

    if (hasChildren) {
      const childList = renderChildList(cnvNodeElement);
      cnvNode.children.forEach((id) => renderQueue.push([id, childList]));
    }
  }

  while (true) {
    const nextNode = renderQueue.pop();
    if (!nextNode) break;
    const [id, parentElement] = nextNode;
    const cnvNode = cnvNodes.get(id);

    if (!rendered.has(id) && cnvNode) {
      renderCnvNode(id, cnvNode, parentElement);
    } else {
      renderLinkNode(id, parentElement);
    }
  }
}

export function renderConversations(
  conversations: Conversations,
  reverse: boolean
) {
  const container = getCurrentCnvContainer();
  clearChildren(container);
  const shadowContainer = document.createElement("div");
  container.appendChild(shadowContainer);

  //doing this instead of using CSSStyleSheet
  //due to a bug/oversight in Firefox
  const style = document.createElement("style");
  style.textContent = cnvTreeCSS;

  const shadow = shadowContainer.attachShadow({ mode: "open" });
  shadow.appendChild(style);

  const conversationDiv = document.createElement("div");
  shadow.appendChild(conversationDiv);

  const tree = document.createElement("ul");
  tree.className = "tree";
  conversationDiv.appendChild(tree);

  //bubblegum-bandaid feature because I'm annoyed
  //at the formatting of some conversation data
  if (reverse) conversations[1].push(...conversations[1].splice(0, 1));

  renderCnvNodes(conversations, tree);
}

export function renderCurrentConversations(e: Event) {
  renderConversations(parseCurrentCnvTree(), (<any>e).shiftKey);
}
