import nerdamer from "nerdamer";

type Evaluable = Constant | BinaryOperation | UnaryOperation;
type BinaryOperation = {
  type: "Add" | "Subtract" | "Multiply" | "Divide" | "Power";
  operands: Evaluable[];
};
type UnaryOperation = {
  type: "Sum" | "Root" | "Factorial" | "Negate";
  operand: Evaluable;
};
type Constant = {
  value: string;
}

function isConstant(evaluable: Evaluable): evaluable is Constant {
  return "value" in evaluable;
}
function isUnaryOperation(evaluable: Evaluable): evaluable is UnaryOperation {
  return "operand" in evaluable;
}
function isBinaryOperation(evaluable: Evaluable): evaluable is BinaryOperation {
  return "operands" in evaluable;
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
export function evaluateExpression(expression: string) {
  const parsed = parse(expression);
  const evaluated = evaluate(parsed);
  if (!isInteger(evaluated)) {
    return nerdamer(evaluated).evaluate().text('decimals');
  }
  return evaluated;
}

/**
 * 計算用オブジェクトを評価し、計算結果を返します。
 */
function evaluate(evaluable: Evaluable): string {
  if(isUnaryOperation(evaluable)) {
    const operand = evaluate(evaluable.operand);
    switch(evaluable.type) {
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
  if(isBinaryOperation(evaluable)) {
    const operands = evaluable.operands.map(operand => evaluate(operand));
    switch(evaluable.type) {
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
  if(isConstant(evaluable)) {
    requireInteger(evaluable.value, `invalid constant: ${evaluable.value}`);
    return evaluable.value;
  }
  console.error(`unexpected evaluation type: ${evaluable}`);
  throw new Error('internal error');
}

/**
 * nerdamer を利用して式を評価します。
 * nerdamer による評価後が整数であれば評価した値を、
 * そうでない場合は nerdamer の式を返します。
 */
function evaluateNerdamer(expression: string): string {
  try {
    const evaluated = nerdamer(expression).evaluate().text('fractions');
    if (isInteger(evaluated)) {
      return evaluated;
    }
    return nerdamer(expression).text('fractions');
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
function parse(expression: string): Evaluable {
  const normalized = expression.replace(/\s/g, '')
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

function parseAddition(expression: string): Evaluable {
  const addingOperands: string[] = [];
  const subtractingOperands: string[] = [];
  let nest = 0;
  let startIndex = 0;
  let operation = '+';
  for (let i = startIndex; i < expression.length; i++) {
    const c = expression[i];
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
      const left = expression.substring(startIndex, i);
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
    const right = expression.substring(startIndex);
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
    const operands: Evaluable[] = [];
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
  return parseMultiplication(expression);
}

function parseMultiplication(expression: string): Evaluable {
  const multiplyingOperands: string[] = [];
  const dividingOperands: string[] = [];
  let nest = 0;
  let startIndex = 0;
  let operation = '*';
  for (let i = startIndex; i < expression.length; i++) {
    const c = expression[i];
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
      const left = expression.substring(startIndex, i);
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
    const right = expression.substring(startIndex);
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
    const numerators: Evaluable[] = [];
    const denominators: Evaluable[] = [];

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
  return parsePower(expression);
}

function parsePower(expression: string): Evaluable {
  let nest = 0;
  for (let i = 0; i < expression.length; i++) {
    const c = expression[i];
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
      const left = expression.substring(0, i);
      const right = expression.substring(i + 1);
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
  return parseUnaryOperation(expression);
}

function parseUnaryOperation(expression: string): Evaluable {
  const first = expression[0];
  const right = expression.substring(1);
  const last = expression[expression.length - 1];
  const left = expression.substring(0, expression.length - 1);
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
    if (expression.length === 2) {
      throw new Error('empty bracket');
    }
    return parseAddition(expression.substring(1, expression.length - 1));
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
  if (isInteger(expression)) {
    return {
      value: expression.replace('+', '')
    };
  }
  if (/^[0-9]*\.[0-9]+$/.test(expression)) {
    const integer = expression.split('.')[0];
    const decimal = expression.split('.')[1];
    const division: Evaluable = {
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
  if (/^[0-9]*\.\([0-9]+\)$/.test(expression)) {
    const integer = expression.split('.')[0];
    const repeated = expression.split('.')[1].replace('(', '').replace(')', '');
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

  throw new Error(`invalid expression: ${expression}`);
}

function parseRepeatingDecimal(repeatingExpression: string): Evaluable {
  const repeating = BigInt(repeatingExpression);
  const factor = BigInt(10) ** BigInt(repeatingExpression.length);

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
