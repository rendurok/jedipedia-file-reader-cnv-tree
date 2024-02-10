import { getCurrentCnvTree, getIdNode } from '../elementFinders';

export function clearChildren(element: Element) {
  Array.from(element.children).forEach((c) => element.removeChild(c));
}

//returns only what is after the last '.'
export function getName(longString?: string) {
  return (
    longString?.match(/^(?:.*\.)*([^🔗︎\.]+).*$/)?.[1] ||
    longString ||
    'unknown'
  );
}

export function expandAll() {
  Array.from(getCurrentCnvTree().getElementsByTagName('input')).forEach(
    (input) => (input.checked = false)
  );
}

export function expandTo(node: Element) {
  let listElement = node.parentElement;

  while (listElement && !listElement.offsetParent) {
    listElement = listElement?.parentElement?.parentElement || null;

    const checkbox = listElement?.querySelector<HTMLInputElement>('input');
    if (checkbox) checkbox.checked = false;
    else return;
  }
}

export function jumpToId(id: string) {
  const element = getIdNode(id)?.parentElement;
  if (!element) return alert(`node ${id} not found`);

  expandTo(element);
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  element.classList.add('cnv-highlight');
  setTimeout(() => element.classList.remove('cnv-highlight'), 5000);
}

export function appendSpanWithText(
  parent: Element,
  text: string,
  className: string
) {
  const newSpan = document.createElement('span');
  newSpan.appendChild(document.createTextNode(text));
  newSpan.className = className;
  parent.appendChild(newSpan);

  return newSpan;
}

export function parseReaction(
  reactor: string,
  reaction: string
): [string, string] {
  const parsedReaction = reaction
    .replace('<<1>>', (_, offset) => (offset ? reactor : ''))
    .trim();

  return [reactor, parsedReaction];
}
