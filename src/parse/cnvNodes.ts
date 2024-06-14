import { cnvReactionTypes, miscLUT } from '../lut';
import { CnvNode, TableRow } from '../types';
import { readableCondition } from './conditions';
import { parseArrayUnorder, parseToValues } from './utils';

export function getCnvNodeId(cnvNodeRow: TableRow) {
  const id = cnvNodeRow.children.get('cnvNodeNumber')?.value;
  if (!id) throw new Error('cnv node row has no id');

  return id;
}

export function getCnvNodeText(cnvNodeRow: TableRow, id: string) {
  return (
    cnvNodeRow.children
      .get('locTextRetrieverMap')
      ?.children.get(id)
      ?.children.get('strLocalizedTextRetrieverStringID')?.value || ''
  );
}

export function getCnvNodeGeneric(cnvNodeRow: TableRow) {
  return cnvNodeRow.children.get('cnvGenericNodeNumber')?.value;
}

export function getCnvNodeIsPlayer(cnvNodeRow: TableRow) {
  return cnvNodeRow.children.get('cnvIsPcNode')?.value === 'true';
}

export function getCnvNodeSpeaker(cnvNodeRow: TableRow) {
  return cnvNodeRow.children.get('cnvSpeaker')?.value || '';
}

export function getCnvNodeForce(cnvNodeRow: TableRow) {
  const forceTypeData =
    cnvNodeRow.children.get('cnvRewardForceType')?.value || '';
  const forceAmountData =
    cnvNodeRow.children.get('cnvRewardForceAmount')?.value || '';
  const forceAmountNumber = Number(miscLUT.get(forceAmountData));

  const forceNumber = Number(miscLUT.get(forceTypeData)) * forceAmountNumber;
  return forceAmountData || forceTypeData
    ? forceNumber ||
        `${forceTypeData || 'unknown'}~${forceAmountNumber || forceAmountData}`
    : 0;
}

export function getCnvNodeReactions(cnvNodeRow: TableRow) {
  const reactionsRow = cnvNodeRow.children.get('cnvNodeCompanionReactions');
  if (!reactionsRow) return [];

  return (
    parseArrayUnorder(reactionsRow)?.map((reaction): [string, string] => {
      const reactionType = String(
        reaction.children.get('cnvNodeReactionType')?.value
      ).split(' = ')[0];

      return [
        String(reaction.children.get('cnvNodeReactionCompanion')?.value),
        cnvReactionTypes.get(reactionType) || reactionType,
      ];
    }) || []
  );
}

export function getCnvNodeChildren(cnvNodeRow: TableRow) {
  const childrenRow = cnvNodeRow.children.get('cnvChildNodes');
  if (!childrenRow) return [];

  return parseToValues(parseArrayUnorder(childrenRow));
}

export function getCnvNodeConditions(cnvNodeRow: TableRow) {
  const cndCompiledRow = cnvNodeRow.children.get('cnvConditionCompiled');
  const conditions = cndCompiledRow
    ? parseToValues(parseArrayUnorder(cndCompiledRow))
    : [];

  const actionRow = cnvNodeRow.children.get('cnvActionExpressionCompiled');
  const actionExpression = actionRow
    ? parseToValues(parseArrayUnorder(actionRow))
    : [];

  if (
    cnvNodeRow.children.get('cnvNodeConditionType')?.value ===
    'cnvConditionType_Conditional#'
  ) {
    const conditional = cnvNodeRow.children.get(
      'cnvNodeRequiredConditional'
    )?.value;

    if (conditional) {
      const compiledLength = conditions.length;
      conditions.push(conditional);

      if (
        cnvNodeRow.children.get('cnvNodeIsConditionNegated')?.value === 'true'
      ) {
        conditions.push('(10)'); // !
      }
      if (compiledLength) {
        conditions.push('(8)'); // &&
      }
    }
  }

  return {
    actionString: readableCondition(actionExpression),
    conditionString: readableCondition(conditions),
  };
}

export function getCnvNodes(cnvData: TableRow) {
  return new Map<string, CnvNode>(
    parseArrayUnorder(cnvData).map((cnvNodeRow) => {
      const id = getCnvNodeId(cnvNodeRow);
      return [
        id,
        {
          id,
          children: getCnvNodeChildren(cnvNodeRow),
          parents: new Set<string>(),
          text: getCnvNodeText(cnvNodeRow, id),
          force: getCnvNodeForce(cnvNodeRow),
          isPlayer: getCnvNodeIsPlayer(cnvNodeRow),
          speaker: getCnvNodeSpeaker(cnvNodeRow),
          generic: getCnvNodeGeneric(cnvNodeRow),
          reactions: getCnvNodeReactions(cnvNodeRow),
          ...getCnvNodeConditions(cnvNodeRow),
          conditionMatters: false,
        },
      ];
    })
  );
}
