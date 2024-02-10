import { getCurrentPage } from '../elementFinders';
import { extractCurrentPage } from '../extract/cnvDataTable';
import { cnvReactionTypes, miscLUT } from '../lut';
import { CnvNode, Conversations, TableRow } from '../types';
import { parseArrayUnorder, parseToValues } from './utils';

function getCnvNodeId(cnvNodeRow: TableRow) {
  const id = cnvNodeRow.children.get('cnvNodeNumber')?.value;
  if (!id) throw new Error('cnv node row has no id');

  return id;
}

function getCnvNodeText(cnvNodeRow: TableRow, id: string) {
  return (
    cnvNodeRow.children
      .get('locTextRetrieverMap')
      ?.children.get(id)
      ?.children.get('strLocalizedTextRetrieverStringID')?.value || ''
  );
}

function getCnvNodeGeneric(cnvNodeRow: TableRow) {
  return cnvNodeRow.children.get('cnvGenericNodeNumber')?.value;
}

function getCnvNodeIsPlayer(cnvNodeRow: TableRow) {
  return cnvNodeRow.children.get('cnvIsPcNode')?.value === 'true';
}

function getCnvNodeSpeaker(cnvNodeRow: TableRow) {
  return cnvNodeRow.children.get('cnvSpeaker')?.value || '';
}

function getCnvNodeForce(cnvNodeRow: TableRow) {
  const forceTypeData =
    cnvNodeRow.children.get('cnvRewardForceType')?.value || '';
  const forceAmountData =
    cnvNodeRow.children.get('cnvRewardForceAmount')?.value || '';
  const forceAmountNumber = Number(miscLUT.get(forceAmountData));

  const forceNumber = Number(miscLUT.get(forceTypeData)) * forceAmountNumber;
  return forceAmountData || forceTypeData
    ? forceNumber || `${forceTypeData}~${forceAmountNumber || forceAmountData}`
    : 0;
}

function getCnvNodeReactions(cnvNodeRow: TableRow) {
  const reactionsRow = cnvNodeRow.children.get('cnvNodeCompanionReactions');
  if (!reactionsRow) return [];

  return (
    parseArrayUnorder(reactionsRow)?.map((reaction): [string, string] => {
      const reactionType = String(
        reaction.children.get('cnvNodeReactionType')?.value
      );

      return [
        String(reaction.children.get('cnvNodeReactionCompanion')?.value),
        cnvReactionTypes.get(reactionType) || reactionType,
      ];
    }) || []
  );
}

function getCnvNodeChildren(cnvNodeRow: TableRow) {
  const childrenRow = cnvNodeRow.children.get('cnvChildNodes');
  if (!childrenRow) return [];

  return parseToValues(parseArrayUnorder(childrenRow));
}

function parseCnvTree(data: TableRow): Conversations {
  const cnvData = data.children.get('cnvTreeDialogNodes_Prototype');
  if (!cnvData) {
    alert('no conversation found');
    throw new Error('no conversation data found');
  }

  const cnvNodes = new Map<string, CnvNode>(
    parseArrayUnorder(cnvData).map((cnvNodeRow) => {
      const id = getCnvNodeId(cnvNodeRow);
      return [
        id,
        {
          id,
          children: new Set(getCnvNodeChildren(cnvNodeRow)),
          parents: new Set<string>(),
          text: getCnvNodeText(cnvNodeRow, id),
          force: getCnvNodeForce(cnvNodeRow),
          isPlayer: getCnvNodeIsPlayer(cnvNodeRow),
          speaker: getCnvNodeSpeaker(cnvNodeRow),
          generic: getCnvNodeGeneric(cnvNodeRow),
          reactions: getCnvNodeReactions(cnvNodeRow),
        },
      ];
    })
  );

  const linkRows = data.children.get('cnvTreeLinkNodes_Prototype');
  const cnvLinks = new Map(
    linkRows
      ? parseArrayUnorder(linkRows).map((row): [string, string] => {
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
      throw new Error('baseclass not cnvTree_Prototype')
    }
  }

  return parseCnvTree(extractCurrentPage());
}
