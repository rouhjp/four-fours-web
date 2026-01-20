import nerdamer from "nerdamer";

type Expression = Constant | BinaryOperation | UnaryOperation | DecimalConstant;
type BinaryOperation = {
  type: "Add" | "Subtract" | "Multiply" | "Divide" | "Power";
  operands: Expression[];
};
type UnaryOperation = {
  type: "Sum" | "Root" | "Factorial" | "Negate";
  operand: Expression;
};
type DecimalConstant = {
  repeating: boolean;
  integerPart: string;
  decimalPart: string;
}
type Constant = {
  value: string;
}

function isConstant(expression: Expression): expression is Constant {
  return "value" in expression;
}
function isDecimalConstant(expression: Expression): expression is DecimalConstant {
  return "integerPart" in expression;
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
function isDecimal(value: string): boolean {
  return /^[0-9]*\.[0-9]+$/.test(value) || /^[0-9]*\.\([0-9]+\)$/.test(value);
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
  const nerdamerString = toNerdamerString(parsed);
  try {
    return nerdamer(nerdamerString).evaluate().text('decimals');
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes('Division by zero')) {
        throw new Error(`Division by zero is not allowed`);
      }
      if (e.message.includes('0^0 is undefined')) {
        throw new Error(`Zero to the power of zero is undefined`);
      }
    }
    console.error(e);
    throw new Error(`Internal error`);
  }
}

function toNerdamerString(expression: Expression): string {
  if (isUnaryOperation(expression)) {
    const operand = toNerdamerString(expression.operand);
    const operandValue = nerdamer(operand).evaluate().text('fractions');
    switch (expression.type) {
      case "Sum":
        requireInteger(operandValue, "The operand of sum operator must be an integer");
        requirePositiveOrZero(operandValue, `The operand of sum operator must be a positive integer: ${operandValue}`);
        requireMaxDigit(operandValue, 12, `The operand of sum operator is too big`);
        return `(${operand})*(${operand}+1)/2`;
      case "Factorial":
        requireInteger(operandValue, "The operand of factorial operator must be an integer");
        requirePositiveOrZero(operandValue, `The operand of factorial operator must be a positive integer: ${operandValue}`);
        requireMaxDigit(operandValue, 2, `The operand of factorial operator is too big`);
        return `factorial(${operand})`;
      case "Root":
        requirePositiveOrZero(operandValue, `The operand of root operator must be a positive integer: ${operandValue}`);
        return `sqrt(${operand})`;
      case "Negate":
        return `(-1*(${operand}))`;
    }
  }
  if (isBinaryOperation(expression)) {
    const [a, b] = expression.operands.map(toNerdamerString);
    const bValue = nerdamer(b).evaluate().text('fractions');
    switch (expression.type) {
      case "Add":
        return `(${a})+(${b})`;
      case "Subtract":
        return `(${a})-(${b})`;
      case "Multiply":
        return `(${a})*(${b})`;
      case "Divide":
        return `(${a})/(${b})`;
      case "Power":
        requireMaxDigit(bValue, 4, `The exponent of power operator is too big`);
        return `(${a})^(${b})`;
    }
  }
  if (isConstant(expression)) {
    return expression.value;
  }
  if (isDecimalConstant(expression)) {
    const converted = convertDecimalToDivision(expression);
    return toNerdamerString(converted);
  }
  throw new Error('Internal error');
}

function convertDecimalToDivision(expression: DecimalConstant): Expression {
  const division: Expression = expression.repeating ? parseRepeatingDecimal(expression.decimalPart) : {
    type: "Divide",
    operands: [
      { value: expression.decimalPart },
      { value: (10n ** BigInt(expression.decimalPart.length)).toString() },
    ]
  };
  if (expression.integerPart.length > 0) {
    const addition: BinaryOperation = {
      type: "Add",
      operands: [
        { value: expression.integerPart },
        division
      ]
    }
    return addition;
  }
  return division;
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
    throw new Error(`Invalid character in expression: ${invalidCharacter}`);
  }
  if (normalized.length === 0) {
    throw new Error('Empty expression');
  }
  return doParse(normalized);
}

function doParse(input: string): Expression {
  for (const operators of [['+', '-'], ['*', '/'], ['^']]) {
    let nest = 0;
    for (let i = input.length - 1; i >= 0; i--) {
      const c = input[i];
      if (c === ')') {
        nest++;
        continue;
      }
      if (c === '(') {
        nest--;
        if (nest < 0) {
          throw new Error('Unmatched bracket');
        }
        continue;
      }
      if (nest > 0) {
        continue;
      }
      if (i > 0 && operators.includes(c)) {
        const left = input.substring(0, i);
        const right = input.substring(i + 1);
        if (left.length === 0 || right.length === 0) {
          throw new Error(`Missing operand for ${c} operator`);
        }
        return {
          type: c === '+' ? 'Add' :
                c === '-' ? 'Subtract' :
                c === '*' ? 'Multiply' :
                c === '/' ? 'Divide' : 'Power',
          operands: [
            doParse(left),
            doParse(right),
          ],
        }
      }
    }
  }
  const first = input[0];
  const right = input.substring(1);
  const last = input[input.length - 1];
  const left = input.substring(0, input.length - 1);
  if (first === '(' && last === ')') {
    if (input.length === 2) {
      throw new Error('Empty bracket');
    }
    return doParse(input.substring(1, input.length - 1));
  }
  if (['S', 'R', '-'].includes(first)) {
    if (right.length === 0) {
      throw new Error(`Missing operand for ${first} operator`);
    }
    return {
      type: first === 'S' ? 'Sum' :
            first === 'R' ? 'Root' : 'Negate',
      operand: doParse(right),
    }
  }
  if (last === '!') {
    if (left.length === 0) {
      throw new Error('Missing operand for ! operator');
    }
    return {
      type: 'Factorial',
      operand: doParse(left),
    };
  }
  if (isInteger(input)) {
    return {
      value: input.replace('+', '')
    };
  }
  if (isDecimal(input)) {
    return {
      repeating: input.includes('('),
      integerPart: input.split('.')[0],
      decimalPart: input.split('.')[1].replace('(', '').replace(')', ''),
    }
  }
  throw new Error(`Invalid expression: ${input}`);
}


/**
 * 独自記法の式をKaTeX形式の文字列に変換します。
 */
export function convertToKaTeX(input: string): string {
  try {
    return toKaTeX(parse(input));
  } catch {
    return '';
  }
}

type ParenthesesPolicy = 'wrapBinaryOps' | 'wrapAddSub' | 'wrapBinaryAndNegate';

function needsParentheses(expression: Expression, policy: ParenthesesPolicy = 'wrapBinaryOps'): boolean {
  if (isBinaryOperation(expression)) {
    if (policy === 'wrapAddSub') {
      return expression.type === "Add" || expression.type === "Subtract";
    }
    return true;
  }
  if (policy === 'wrapBinaryAndNegate' && isUnaryOperation(expression)) {
    return expression.type === "Negate";
  }
  return false;
}

function wrapIfNeeded(expression: Expression, katex: string, policy: ParenthesesPolicy = 'wrapBinaryOps'): string {
  return needsParentheses(expression, policy) ? `(${katex})` : katex;
}

function toKaTeX(expr: Expression): string {
  if (isConstant(expr)) {
    return expr.value;
  }
  if (isDecimalConstant(expr)) {
    const intPart = expr.integerPart || '0';
    return expr.repeating
      ? `${intPart}.\\overline{${expr.decimalPart}}`
      : `${intPart}.${expr.decimalPart}`;
  }
  if (isUnaryOperation(expr)) {
    const operand = toKaTeX(expr.operand);
    switch (expr.type) {
      case "Sum":
        return `\\textstyle \\sum ${wrapIfNeeded(expr.operand, operand)}`;
      case "Root":
        return `\\sqrt{${operand}}`;
      case "Factorial":
        return `${wrapIfNeeded(expr.operand, operand)}!`;
      case "Negate":
        return `-(${operand})`;
    }
  }
  if (isBinaryOperation(expr)) {
    const [left, right] = expr.operands.map(toKaTeX);
    switch (expr.type) {
      case "Add":
        return expr.operands.map((op, i) => {
          const katex = toKaTeX(op);
          if (isUnaryOperation(op) && op.type === "Negate") return katex;
          return i === 0 ? katex : `+${katex}`;
        }).join('');
      case "Subtract":
        return `${left}-${right}`;
      case "Multiply":
        return expr.operands.map(op =>
          wrapIfNeeded(op, toKaTeX(op), 'wrapAddSub')
        ).join(' \\times ');
      case "Divide":
        return `\\frac{${left}}{${right}}`;
      case "Power":
        return `${wrapIfNeeded(expr.operands[0], left, 'wrapBinaryAndNegate')}^{${right}}`;
    }
  }
  return '';
}
