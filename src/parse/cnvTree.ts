import { getCurrentPage } from '../elementFinders';
import { extractCurrentPage } from '../extract/cnvDataTable';
import { Conversations, TableRow } from '../types';
import { getCnvNodes } from './cnvNodes';
import { parseArrayUnorder } from './utils';

function parseCnvTree(data: TableRow): Conversations {
  const cnvNodeData = data.children.get('cnvTreeDialogNodes_Prototype');
  if (!cnvNodeData) {
    alert('no conversation found');
    throw new Error('no conversation data found');
  }

  const cnvNodes = getCnvNodes(cnvNodeData);

  const cnvLinkData = data.children.get('cnvTreeLinkNodes_Prototype');
  const cnvLinks = new Map(
    cnvLinkData
      ? parseArrayUnorder(cnvLinkData).map((row): [string, string] => {
          const source = row.children.get('cnvNodeNumber')?.value;
          const target = row.children.get('cnvLinkTarget')?.value;
          if (!source || !target) {
            console.warn('undefined link source or target');
            return ['-1', '-1'];
          }

          return [source, target];
        })
      : []
  );

  //set parents and resolve links
  //children is a set after this
  cnvNodes.forEach((node) => {
    node.children = new Set(
      Array.from(node.children.values()).map((childId) => {
        let id = childId;
        let child = cnvNodes.get(id);

        if (!child) {
          id = cnvLinks.get(childId) || '';
          child = cnvNodes.get(id);

          if (!child) {
            console.warn(`node ${childId} not found`);
            return 'unresolved';
          }
        }

        child.parents.add(node.id);
        return id;
      })
    );
  });

  const parentlessNodeIds: string[] = [];

  //prune useless nodes
  //and find parentless nodes
  cnvNodes.forEach((cnvNode) => {
    if (cnvNode.parents.size === 0) {
      parentlessNodeIds.push(cnvNode.id);
    }

    if (
      !cnvNode.text &&
      !cnvNode.force &&
      !cnvNode.reactions.length &&
      cnvNode.parents.size !== 0 &&
      cnvNode.children.size !== 0 &&
      !(cnvNode.parents.size > 1 && cnvNode.children.size > 1)
    ) {
      cnvNode.parents.forEach((parentId) => {
        const parent = cnvNodes.get(parentId);
        if (!parent) return;

        parent.children.delete(cnvNode.id);

        cnvNode.children.forEach((childId) => {
          parent.children.add(childId);
          cnvNodes.get(childId)?.parents.add(parentId);
        });
      });

      cnvNode.children.forEach((childId) => {
        cnvNodes.get(childId)?.parents.delete(cnvNode.id);
      });
    }
  });

  return [cnvNodes, parentlessNodeIds];
}

export function parseCurrentCnvTree() {
  if (
    (<HTMLElement | undefined>(
      getCurrentPage()[0]?.children[2]?.children[0]?.children[1]
    ))?.innerText !== 'cnvTree_Prototype'
  ) {
    if (
      !confirm(
        'Base class is not cnvTree_Prototype, try parsing as one anyway? ' +
          'This will probably not work.'
      )
    ) {
      throw new Error('baseclass not cnvTree_Prototype');
    }
  }

  return parseCnvTree(extractCurrentPage());
}
