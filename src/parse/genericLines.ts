import { getCurrentPage } from '../elementFinders';
import { extractCurrentPage } from '../extract/cnvDataTable';
import { cnvClassGenderConditions } from '../lut';
import { TableRow } from '../types';
import { getCnvNodeChildren, getCnvNodeId, getCnvNodeText } from './cnvNodes';
import { parseArrayUnorder, parseToValues } from './utils';

export let genericLines = new Map<string, string>();

//not universal, only works because the conditions
//in generic_lines are all written in a certain way
function getCnvNodeConditionsBad(cnvNodeRow: TableRow): string[] {
  const conditionRow = cnvNodeRow.children.get('cnvConditionCompiled');
  if (!conditionRow) return [];

  return parseToValues(parseArrayUnorder(conditionRow)).flatMap(
    (v) => cnvClassGenderConditions.get(v) || []
  );
}

function parseGenericLines(
  data: TableRow,
  playerConditions: Set<string>
): Map<string, string> {
  const cnvNodeData = data.children.get('cnvTreeDialogNodes_Prototype');
  if (!cnvNodeData) {
    alert('no conversation nodes found');
    throw new Error('no conversation data found');
  }

  const cnvNodes = new Map(
    parseArrayUnorder(cnvNodeData).map((cnvNodeRow) => {
      const id = getCnvNodeId(cnvNodeRow);
      return [
        id,
        {
          id,
          children: new Set(getCnvNodeChildren(cnvNodeRow)),
          parents: new Set<string>(),
          text: getCnvNodeText(cnvNodeRow, id),
          conditions: getCnvNodeConditionsBad(cnvNodeRow),
        },
      ];
    })
  );

  cnvNodes.forEach((node) => {
    Array.from(node.children).forEach((childId) => {
      const child = cnvNodes.get(childId);

      if (!child) {
        console.warn(`node ${childId} not found`);
        return;
      }

      child.parents.add(node.id);
    });
  });

  cnvNodes.forEach((cnvNode) => {
    if (!cnvNode.conditions.length) return;
    if (!cnvNode.conditions.every((cnd) => playerConditions.has(cnd))) {
      cnvNodes.delete(cnvNode.id);
      return;
    }

    cnvNode.parents.forEach((parentId) => {
      const parent = cnvNodes.get(parentId);
      if (!parent) {
        console.warn(`parent not found: ${parentId}`);
        return;
      }

      parent.text = cnvNode.text;
    });
  });

  return new Map(
    Array.from(cnvNodes.values()).flatMap(({ id, text }) =>
      text ? [[id, text]] : []
    )
  );
}

export function setGenericLines(playerConditions: Set<string>) {
  const [page, _] = getCurrentPage();
  if (
    page.querySelector(':nth-child(2 of p) :first-child mark')?.textContent !==
    'cnv.misc.generic_lines'
  ) {
    if (
      !confirm(
        'Current page is not cnv.misc.generic_lines, try opening anyway? ' +
          '(This will probably not work)'
      )
    ) {
      return;
    }
  }

  genericLines = parseGenericLines(extractCurrentPage(), playerConditions);
}
