import { getCurrentPage } from '../elementFinders';
import { extractCurrentPage } from '../extract/cnvDataTable';
import { Conversations, TableRow } from '../types';
import { getCnvNodes } from './cnvNodes';
import { parseArrayUnorder, parseToValues } from './utils';

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
    node.children = new Set(
      Array.from(node.children).map((childId) => {
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
      })
    );
  });

  const rootNodeData = data.children
    .get('cnvTreeRootNode_Prototype')
    ?.children.get('cnvChildNodes');
  const topLevelNodeIds = new Set<string>(
    rootNodeData ? parseToValues(parseArrayUnorder(rootNodeData)) : []
  );
  topLevelNodeIds.forEach((id) => cnvNodes.get(id)?.parents.add('root'));

  //find parentless nodes
  //prune useless nodes
  cnvNodes.forEach((cnvNode) => {
    if (!cnvNode.parents.size) {
      cnvNode.parents.add('root');
      topLevelNodeIds.add(cnvNode.id);
    }

    /*
    TODO:
    Instead of not pruning root and "cross" nodes, 
    maybe look at child conditions to find otherwise 
    useless nodes that nonetheless are sensible to keep,
    as they function as a kind of logical aggregator
    */

    if (
      !cnvNode.text &&
      !cnvNode.force &&
      !cnvNode.reactions.length &&
      !cnvNode.parents.has('root') &&
      cnvNode.children.size !== 0 &&
      !(cnvNode.parents.size > 1 && cnvNode.children.size > 1)
    ) {
      topLevelNodeIds.delete(cnvNode.id);

      cnvNode.children.forEach((childId) => {
        const childNode = cnvNodes.get(childId);
        if (!childNode) return;

        childNode.parents.delete(cnvNode.id);
        cnvNode.parents.forEach((parentId) => {
          childNode.parents.add(parentId);

          if (parentId === 'root') {
            topLevelNodeIds.add(childId);
          }
        });
      });

      cnvNode.parents.forEach((parentId) => {
        const parentNode = cnvNodes.get(parentId);
        if (!parentNode) return;

        parentNode.children.delete(cnvNode.id);
        cnvNode.children.forEach((childId) => {
          parentNode.children.add(childId);
        });
      });
    }
  });

  return [cnvNodes, Array.from(topLevelNodeIds)];
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
