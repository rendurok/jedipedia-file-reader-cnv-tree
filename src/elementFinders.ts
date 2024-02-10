export function getCurrentPage(): [Element, string] {
  const page = document.querySelector('#pages>div:not(.hidden):not(#page-0)');
  if (!page) throw new Error('current page not found');

  const pageId = page.id.split('-')[1];
  if (!pageId) throw new Error('page has no id');

  //[page, page id]
  return [page, pageId];
}

export function getCurrentCnvContainer() {
  const [page, id] = getCurrentPage();
  let container = document.querySelector(`#cnv-container-${id}`);

  if (!container) {
    container = page.querySelector('.dialogue.text');
    if (!container) throw new Error('cannot retrieve container');

    container.id = `cnv-container-${id}`;
  }

  return container;
}

export function getCurrentCnvTree() {
  const container =
    getCurrentCnvContainer().children[0].shadowRoot?.lastElementChild;
  if (!container) throw new Error('cannot retrieve cnv tree');

  return container;
}

export function getIdNode(id: string) {
  return document.evaluate(
    `//span[text()='${id}']`,
    getCurrentCnvTree(),
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}
