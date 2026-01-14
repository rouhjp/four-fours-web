import nerdamer from "nerdamer";

type Expression = Constant | BinaryOperation | UnaryOperation;
type BinaryOperation = {
  type: "Add" | "Subtract" | "Multiply" | "Divide" | "Power";
  operands: Expression[];
};
type UnaryOperation = {
  type: "Sum" | "Root" | "Factorial" | "Negate";
  operand: Expression;
};
type Constant = {
  value: string;
}

function isConstant(expression: Expression): expression is Constant {
  return "value" in expression;
}
function isUnaryOperation(expression: Expression): expression is UnaryOperation {
  return "operand" in expression;
}
function isBinaryOperation(expression: Expression): expression is BinaryOperation {
  return "operands" in expression;
}

function isInteger(value: string): boolean {
  return /^[+-]?[0-9]+$/.test(value);
}

function requireInteger(value: string, message: string) {
  if (!isInteger(value)) {
    throw new Error(message);
  }
}

function requirePositiveOrZero(value: string, message: string) {
  if (BigInt(value) < 0n) {
    throw new Error(message);
  }
}

function requireMaxDigit(value: string, maxDigits: number, message: string) {
  if (value.length > maxDigits) {
    throw new Error(message);
  }
}

/**
 * 独自記法の式を評価し、計算結果を返します。
 */
export function evaluate(input: string) {
  const parsed = parse(input);
  const evaluated = doEvaluate(parsed);
  if (!isInteger(evaluated)) {
    return nerdamer(evaluated).evaluate().text('decimals');
  }
  return evaluated;
}

/**
 * 計算用オブジェクトを評価し、計算結果を返します。
 */
function doEvaluate(input: Expression): string {
  if(isUnaryOperation(input)) {
    const operand = doEvaluate(input.operand);
    switch(input.type) {
      case "Sum":
        requireInteger(operand, "the operand of sum operator must be an integer");
        requirePositiveOrZero(operand, `the operand of sum operator must be a positive integer: ${operand}`);
        requireMaxDigit(operand, 12, `the operand of sum operator is too big`);
        return sum(operand);
      case "Factorial":
        requireInteger(operand, "the operand of factorial operator must be an integer");
        requirePositiveOrZero(operand, `the operand of factorial operator must be a positive integer: ${operand}`);
        requireMaxDigit(operand, 2, `the operand of factorial operator is too big`);
        return evaluateNerdamer(`factorial(${operand})`);
      case "Root":
        requirePositiveOrZero(operand, `the operand of root operator must be a positive integer: ${operand}`);
        return evaluateNerdamer(`sqrt(${operand})`);
      case "Negate":
        return evaluateNerdamer(`(-1*(${operand}))`);
    }
  }
  if(isBinaryOperation(input)) {
    const operands = input.operands.map(operand => doEvaluate(operand));
    switch(input.type) {
      case "Add":
        return evaluateNerdamer(`${operands.map(o=>'(' + o + ')').join('+')}`);
      case "Subtract":
        return evaluateNerdamer(`${operands.map(o=>'(' + o + ')').join('-')}`);
      case "Multiply":
        return evaluateNerdamer(`${operands.map(o=>'(' + o + ')').join('*')}`);
      case "Divide":
        return evaluateNerdamer(`${operands.map(o=>'(' + o + ')').join('/')}`);
      case "Power":
        requireMaxDigit(operands[1], 4, `the exponent of power operator is too big`);
        return evaluateNerdamer(`${operands[0]}^${operands[1]}`);
    }
  }
  if(isConstant(input)) {
    requireInteger(input.value, `invalid constant: ${input.value}`);
    return input.value;
  }
  console.error(`unexpected evaluation type: ${input}`);
  throw new Error('internal error');
}

/**
 * nerdamer を利用して式を評価します。
 * nerdamer による評価後が整数であれば評価した値を、
 * そうでない場合は nerdamer の式を返します。
 */
function evaluateNerdamer(input: string): string {
  try {
    const evaluated = nerdamer(input).evaluate().text('fractions');
    if (isInteger(evaluated)) {
      return evaluated;
    }
    return nerdamer(input).text('fractions');
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes('Division by zero')) {
        throw new Error(`division by zero not allowed`);
      }
      if (e.message.includes('0^0 is undefined')) {
        throw new Error(`zero to the power of zero not allowed`);
      }
    }
    console.error(e);
    throw new Error(`internal error`);
  }
}

/**
 * 独自記法の式を解析し、計算用オブジェクトに変換します。
 */
function parse(input: string): Expression {
  const normalized = input.replace(/\s/g, '')
    .replace('√', 'R')
    .replace('∑', 'S')
    .replace('Σ', 'S')
    .replace('×', '*')
    .replace('÷', '/');
  if (!/^[0-9-+/*^SR4!.()]*$/.test(normalized)) {
    const invalidCharacter = normalized.match(/[^0-9-+/*^SR4!.()]/)?.[0];
    throw new Error(`invalid character in expression: ${invalidCharacter}`);
  }
  if (normalized.length === 0) {
    throw new Error('empty expression');
  }
  return parseAddition(normalized);
}

function parseAddition(input: string): Expression {
  const addingOperands: string[] = [];
  const subtractingOperands: string[] = [];
  let nest = 0;
  let startIndex = 0;
  let operation = '+';
  for (let i = startIndex; i < input.length; i++) {
    const c = input[i];
    if (c === '(') {
      nest++;
      continue;
    }
    if (c === ')') {
      nest--;
      if (nest < 0) {
        throw new Error('unmatched bracket');
      }
      continue;
    }
    if (nest > 0) {
      continue;
    }
    if (c === '+' || c === '-') {
      const left = input.substring(startIndex, i);
      if (left.length === 0) {
        if (i === 0) {
          continue;
        }
        throw new Error(`missing left operand of ${c} operator`);
      }
      switch(operation) {
        case '+':
          addingOperands.push(left);
          break;
        case '-':
          subtractingOperands.push(left);
          break;
      }
      operation = c;
      startIndex = i + 1;
    }
  }
  if (nest > 0) {
    throw new Error('unmatched bracket');
  }
  if (addingOperands.length > 0 || subtractingOperands.length > 0) {
    const right = input.substring(startIndex);
    if (right.length === 0) {
      throw new Error(`missing right operand of ${operation} operator`);
    }
    switch(operation) {
      case '+':
        addingOperands.push(right);
        break;
      case '-':
        subtractingOperands.push(right);
        break;
    }
    const operands: Expression[] = [];
    for (const addingOperand of addingOperands) {
      operands.push(parseAddition(addingOperand));
    }
    for (const subtractingOperand of subtractingOperands) {
      operands.push({
        type: 'Negate',
        operand: parseAddition(subtractingOperand),
      });
    }
    return {
      type: 'Add',
      operands: operands,
    };
  }
  return parseMultiplication(input);
}

function parseMultiplication(input: string): Expression {
  const multiplyingOperands: string[] = [];
  const dividingOperands: string[] = [];
  let nest = 0;
  let startIndex = 0;
  let operation = '*';
  for (let i = startIndex; i < input.length; i++) {
    const c = input[i];
    if (c === '(') {
      nest++;
      continue;
    }
    if (c === ')') {
      nest--;
      if (nest < 0) {
        throw new Error('unmatched bracket');
      }
      continue;
    }
    if (nest > 0) {
      continue;
    }
    if (c === '*' || c === '/') {
      const left = input.substring(startIndex, i);
      if (left.length === 0) {
        throw new Error(`missing left operand of ${c} operator`);
      }
      switch(operation) {
        case '*':
          multiplyingOperands.push(left);
          break;
        case '/':
          dividingOperands.push(left);
          break;
      }
      operation = c;
      startIndex = i + 1;
    }
  }
  if (nest > 0) {
    throw new Error('unmatched bracket');
  }
  if (multiplyingOperands.length > 0 || dividingOperands.length > 0) {
    const right = input.substring(startIndex);
    if (right.length === 0) {
      throw new Error(`missing right operand of ${operation} operator`);
    }
    switch(operation) {
      case '*':
        multiplyingOperands.push(right);
        break;
      case '/':
        dividingOperands.push(right);
        break;
    }
    const numerators: Expression[] = [];
    const denominators: Expression[] = [];

    for (const multiplyingOperand of multiplyingOperands) {
      numerators.push(parseAddition(multiplyingOperand));
    }
    for (const dividingOperand of dividingOperands) {
      denominators.push(parseAddition(dividingOperand));
    }
    if (denominators.length === 0) {
      return {
        type: 'Multiply',
        operands: numerators,
      }
    }
    return {
      type: 'Divide',
      operands: [
        {
          type: 'Multiply',
          operands: numerators,
        },
        {
          type: 'Multiply',
          operands: denominators,
        },
      ]
    };
  }
  return parsePower(input);
}

function parsePower(input: string): Expression {
  let nest = 0;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '(') {
      nest++;
      continue;
    }
    if (c === ')') {
      nest--;
      if (nest < 0) {
        throw new Error('unmatched bracket');
      }
      continue;
    }
    if (nest > 0) {
      continue;
    }
    if (c === '^') {
      const left = input.substring(0, i);
      const right = input.substring(i + 1);
      if (left.length === 0 || right.length === 0) {
        throw new Error('missing left operand of ^ operator');
      }
      return {
        type: 'Power',
        operands: [
          parseAddition(left),
          parseAddition(right),
        ],
      };
    }
  }
  if (nest > 0) {
    throw new Error('unmatched bracket');
  }
  return parseUnaryOperation(input);
}

function parseUnaryOperation(input: string): Expression {
  const first = input[0];
  const right = input.substring(1);
  const last = input[input.length - 1];
  const left = input.substring(0, input.length - 1);
  if (first === '-') {
    if (right.length === 0) {
      throw new Error('missing right operand of - operator');
    }
    return {
      type: 'Negate',
      operand: parseAddition(right),
    };
  }
  if (first === 'S') {
    if (right.length === 0) {
      throw new Error('missing operand of S operator');
    }
    return {
      type: 'Sum',
      operand: parseAddition(right),
    };
  }
  if (first === 'R') {
    if (right.length === 0) {
      throw new Error('missing operand of R operator');
    }
    return {
      type: 'Root',
      operand: parseAddition(right),
    };
  }
  if (first === '(' && last === ')') {
    if (input.length === 2) {
      throw new Error('empty bracket');
    }
    return parseAddition(input.substring(1, input.length - 1));
  }
  if (last === '!') {
    if (left.length === 0) {
      throw new Error('missing left operand of ! operator');
    }
    return {
      type: 'Factorial',
      operand: parseAddition(left),
    };
  }
  if (isInteger(input)) {
    return {
      value: input.replace('+', '')
    };
  }
  if (/^[0-9]*\.[0-9]+$/.test(input)) {
    const integer = input.split('.')[0];
    const decimal = input.split('.')[1];
    const division: Expression = {
      type: 'Divide',
      operands: [
        {
          value: decimal,
        },
        {
          value: (10n ** BigInt(decimal.length)).toString(),
        }
      ]
    }
    if (integer.length === 0) {
      return division;
    } else {
      return {
        type: 'Add',
        operands: [
          {
            value: integer,
          },
          division
        ]
      }
    }
  }
  if (/^[0-9]*\.\([0-9]+\)$/.test(input)) {
    const integer = input.split('.')[0];
    const repeated = input.split('.')[1].replace('(', '').replace(')', '');
    const division = parseRepeatingDecimal(repeated);
    if (integer.length === 0) {
      return division;
    } else {
      return {
        type: 'Add',
        operands: [
          {
            value: integer,
          },
          division
        ]
      }
    }
  }

  throw new Error(`invalid expression: ${input}`);
}

function parseRepeatingDecimal(input: string): Expression {
  const repeating = BigInt(input);
  const factor = BigInt(10) ** BigInt(input.length);

  const denominator = factor - BigInt(1);
  const numerator = repeating;
  const divisor = gcd(numerator, denominator);
  return {
    type: 'Divide',
    operands: [
      { value: (numerator / divisor).toString() },
      { value: (denominator / divisor).toString() },
    ]
  }
}

function gcd(a: bigint, b: bigint): bigint {
  return b === BigInt(0) ? a : gcd(b, a % b);
}

function sum(num: string): string {
  const numBigInt = BigInt(num);
  return (numBigInt * (numBigInt + 1n)) / 2n + '';
}
