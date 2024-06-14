import {
  classesImp,
  classesRep,
  cnvClassGenderConditions,
  cnvCndConstants,
  cnvCndOperators,
} from '../lut';

function prettyConditionString(str: string) {
  return (
    cnvCndConstants.get(str) ||
    cnvClassGenderConditions.get(str) ||
    str.replace(/🔗︎/g, '').split('.').at(-1) ||
    '???'
  );
}

type Condition = {
  operator: string;
  operands: string[];
};

const conditions = new Map<string, Condition>([
  ...Array.from(cnvClassGenderConditions.values()).map<[string, Condition]>(
    (cg) => [cg, { operator: 'value', operands: [cg] }]
  ),
  ['class_imp', { operator: '||', operands: classesImp }],
  ['class_rep', { operator: '||', operands: classesRep }],
]);

const cndCmpSame = { isSubset: true, isSuperset: true };
const cndCmpSubset = { isSubset: true, isSuperset: false };
const cndCmpSuperset = { isSubset: false, isSuperset: true };
const cndCmpFalse = { isSubset: false, isSuperset: false };

//conservative estimate
export function compareChildCnd(
  parentStr: string,
  childStr: string
): { isSubset: boolean; isSuperset: boolean } {
  if (parentStr === childStr) return cndCmpSame;

  const parent = conditions.get(parentStr);
  const child = conditions.get(childStr);
  if (!parent || !child) return cndCmpFalse;
  if (parent === child) return cndCmpSame;

  if (
    (child.operator === '&&' || child.operator === '||') &&
    child.operands.includes(parentStr)
  ) {
    return child.operator === '||' ? cndCmpSuperset : cndCmpSubset;
  }

  if (parent.operator === '&&' || parent.operator === '||') {
    if (parent.operands.includes(childStr)) {
      return parent.operator === '||' ? cndCmpSubset : cndCmpSuperset;
    }

    if (parent.operator === child.operator) {
      if (child.operands.every((o) => parent.operands.includes(o))) {
        return parent.operator === '||' ? cndCmpSubset : cndCmpSuperset;
      }
      if (parent.operands.every((o) => child.operands.includes(o))) {
        return parent.operator === '||' ? cndCmpSuperset : cndCmpSubset;
      }
    }
  }

  return cndCmpFalse;
}

function createCondition(
  conditionStr: string,
  operator: string,
  operands: string[]
) {
  if (!conditions.has(conditionStr)) {
    conditions.set(conditionStr, { operator, operands });
  }

  return conditionStr;
}

function conditionValue(value: string) {
  return createCondition(value, 'value', [value]);
}

function conditionNegate(conditionStr: string) {
  return createCondition(`!${conditionStr}`, '!', [conditionStr]);
}

function conditionInt(intString: string) {
  return createCondition(`INT(${intString})`, 'INT', [intString]);
}

function readableCndInner(
  conditionsRaw: string[],
  idx: number
): [number, string] {
  const valueRaw = conditionsRaw.at(idx) || 'ERROR';
  const operator =
    cnvCndConstants.get(valueRaw.match(/^.*\((\d+)\)$/)?.[1] || '') || '';

  if (!cnvCndOperators.has(operator)) {
    return [
      idx - 1,
      conditionValue(operator || prettyConditionString(valueRaw)),
    ];
  }

  const [operand1idx, operand2str] = readableCndInner(conditionsRaw, idx - 1);

  if (operator === '!') {
    return [operand1idx, conditionNegate(operand2str)];
  }
  if (operator === 'INT') {
    return [operand1idx, conditionInt(operand2str)];
  }

  const [returnIdx, operand1str] = readableCndInner(conditionsRaw, operand1idx);
  const operand1 = conditions.get(operand1str);
  const operand2 = conditions.get(operand2str);
  if (!operand1 || !operand2) {
    console.error('operand not found');
    return [-1, 'ERROR']
  }

  //compress x ==/&& true and x ==/&& false to x and !x
  if (operator === '&&' || operator === '==b') {
    if (operand1str === '1') {
      return [returnIdx, operand2str];
    }
    if (operand1str === '0') {
      return [returnIdx, conditionNegate(operand2str)];
    }

    if (operand2str === '1') {
      return [returnIdx, operand1str];
    }
    if (operand2str === '0') {
      return [returnIdx, conditionNegate(operand1str)];
    }
  }

  let operands = [operand1str, operand2str];

  if (operator === '&&' || operator === '||') {
    //get rid of (some) unnecessary brackets
    operands = [
      ...(operand1.operator === operator ? operand1.operands : [operand1str]),
      ...(operand2.operator === operator ? operand2.operands : [operand2str]),
    ];

    //shorten class conditions when it's just imp or rep
    if (operator === '||') {
      if (
        operands.length === classesImp.length &&
        classesImp.every((c) => operands.includes(c))
      ) {
        return [returnIdx, 'class_imp'];
      }
      if (
        operands.length === classesRep.length &&
        classesRep.every((c) => operands.includes(c))
      ) {
        return [returnIdx, 'class_rep'];
      }
    }
  }

  return [
    returnIdx,
    createCondition(
      '(' + operands.reduce((s, c) => `${s} ${operator} ${c}`) + ')',
      operator,
      operands
    ),
  ];
}

export function readableCondition(conditionArray: string[]): string {
  if (!conditionArray.length) return '';
  const result = readableCndInner(conditionArray, conditionArray.length - 1)[1];

  return result === '1' ? '' : result;
}
