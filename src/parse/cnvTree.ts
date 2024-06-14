import { getCurrentPage } from '../elementFinders';
import { extractCurrentPage } from '../extract/cnvDataTable';
import { Conversations, TableRow } from '../types';
import { getCnvNodes } from './cnvNodes';
import { compareChildCnd } from './conditions';
import { parseArrayUnorder, parseToValues } from './utils';

function transferChildren(nodeId: string, children: string[], to: string[]) {
  let idx = to.findIndex((v) => v === nodeId);
  if (idx < 0 || !children.length || !to.length) return false;
  to.splice(idx, 1);

  children.forEach((childId) => {
    const childIdx = to.findIndex((id) => id === childId);
    if (childIdx < 0) {
      to.splice(idx, 0, childId);
      idx++;
    } else if (childIdx === idx) {
      idx++;
    } else if (childIdx > idx) {
      to.splice(childIdx, 1);
      to.splice(idx, 0, childId);
      idx++;
    }
  });

  return true;
}

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
  cnvNodes.forEach((node) => {
    node.children = node.children.map((childId) => {
      let id = childId;
      let child = cnvNodes.get(id);

      if (!child) {
        while (id && !child) {
          id = cnvLinks.get(id) || '';
          child = cnvNodes.get(id);
        }

        if (!child) {
          console.warn(`node ${childId} not found`);
          return 'unresolved';
        }
      }

      child.parents.add(node.id);
      return id;
    });
  });

  const rootNodeData = data.children
    .get('cnvTreeRootNode_Prototype')
    ?.children.get('cnvChildNodes');
  const topLevelNodeIds = rootNodeData
    ? parseToValues(parseArrayUnorder(rootNodeData))
    : [];

  topLevelNodeIds.forEach((id) => cnvNodes.get(id)?.parents.add('root'));

  //find parentless nodes
  //prune useless nodes
  cnvNodes.forEach((cnvNode) => {
    if (!cnvNode.parents.size) {
      cnvNode.parents.add('root');
      if (!topLevelNodeIds.includes(cnvNode.id)) {
        topLevelNodeIds.splice(0, 0, cnvNode.id);
      }
    }

    if (
      !cnvNode.text &&
      !cnvNode.force &&
      !cnvNode.reactions.length &&
      cnvNode.children.length !== 0 &&
      !cnvNode.actionString &&
      (cnvNode.children.every((childId) => {
        const child = cnvNodes.get(childId);
        if (!child) return false;

        return cnvNode.conditionString === child.conditionString;
      }) ||
        Array.from(cnvNode.parents).every((parentId) => {
          const parent = cnvNodes.get(parentId);
          if (!parent) return false;

          return compareChildCnd(
            parent.conditionString,
            cnvNode.conditionString
          ).isSuperset;
        }))
    ) {
      if (transferChildren(cnvNode.id, cnvNode.children, topLevelNodeIds)) {
        cnvNode.children.forEach((childId) =>
          cnvNodes.get(childId)?.parents.add('root')
        );
      }

      cnvNode.children.forEach((childId) => {
        const childNode = cnvNodes.get(childId);
        if (!childNode) return;

        childNode.parents.delete(cnvNode.id);
        cnvNode.parents.forEach((parentId) => {
          childNode.parents.add(parentId);
        });
      });

      cnvNode.parents.forEach((parentId) => {
        const parentNode = cnvNodes.get(parentId);
        if (!parentNode) return;

        transferChildren(cnvNode.id, cnvNode.children, parentNode.children);
      });
    }
  });

  //set displayed conditions
  cnvNodes.forEach((cnvNode) => {
    if (cnvNode.parents.has('root')) {
      cnvNode.conditionMatters = true;
      return;
    }

    cnvNode.parents.forEach((parentId) => {
      const parent = cnvNodes.get(parentId);
      if (!parent) return;

      const { isSuperset } = compareChildCnd(
        parent.conditionString,
        cnvNode.conditionString
      );

      if (!isSuperset) {
        cnvNode.conditionMatters = true;
      }
    });
  });

  return [cnvNodes, topLevelNodeIds];
}

export function parseCurrentCnvTree() {
  if (
    (<HTMLElement | undefined>(
      getCurrentPage()[0]?.children[2]?.children[0]?.children[1]
    ))?.innerText !== 'cnvTree_Prototype'
  ) {
    if (
      !confirm(
        'Base class does not appear to be cnvTree_Prototype, try parsing as one anyway? ' +
          'This will probably not work.'
      )
    ) {
      throw new Error('baseclass not cnvTree_Prototype');
    }
  }

  return parseCnvTree(extractCurrentPage());
}
