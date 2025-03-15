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
    console.error(e);
    throw new Error(`internal error`);
  }
}

function isInteger(value: string): boolean {
  return /^[+-]?[0-9]+$/.test(value);
}

/**
 * 値が整数かどうかチェックし、そのまま値を返します。
 * 整数でない場合は、エラーをスローします。
 */
function requireInteger(value: string, orElseThrow?: Error): string {
  if (!isInteger(value)) {
    throw orElseThrow || new Error(`operand must be an integer: ${value}`);
  }
  return value;
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
        return requireInteger(sum(requireInteger(operand)));
      case "Factorial":
        return requireInteger(evaluateNerdamer(`factorial(${requireInteger(operand)})`));
      case "Root":
        return evaluateNerdamer(`sqrt(${operand})`);
      case "Negate":
        return evaluateNerdamer(`(-1*(${operand}))`);
    }
  }
  if(isBinaryOperation(evaluable)) {
    const operands = evaluable.operands.map(operand => evaluate(operand));
    switch(evaluable.type) {
      case "Add":
        return evaluateNerdamer(`${operands.join('+')}`);
      case "Subtract":
        return evaluateNerdamer(`${operands.join('-')}`);
      case "Multiply":
        return evaluateNerdamer(`${operands.join('*')}`);
      case "Divide":
        return evaluateNerdamer(`${operands.join('/')}`);
      case "Power":
        return evaluateNerdamer(`${operands[0]}^${operands[1]}`);
    }
  }
  if(isConstant(evaluable)) {
    return requireInteger(evaluable.value);
  }
  throw new Error(`internal error: unexpected evaluable type: ${evaluable}`);
}

/**
 * 独自記法の式を解析し、計算用オブジェクトに変換します。
 */
function parse(expression: string): Evaluable {
  const normalized = expression.replace(/\s/g, '');
  if (!/^[0-9-+/*^SR4!.()]*$/.test(normalized)) {
    throw new Error(`invalid character in expression: ${normalized}`);
  }
  if (normalized.length === 0) {
    throw new Error('empty expression');
  }
  return parseAddition(normalized);
}

function parseAddition(expression: string): Evaluable {
  const addingevaluables: string[] = [];
  const subtractingevaluables: string[] = [];
  let found = false;
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
          addingevaluables.push(left);
          break;
        case '-':
          subtractingevaluables.push(left);
          break;
      }
      found = true;
      operation = c;
      startIndex = i + 1;
    }
  }
  if (nest > 0) {
    throw new Error('unmatched bracket');
  }
  if (found) {
    const right = expression.substring(startIndex);
    if (right.length === 0) {
      throw new Error(`missing right operand of ${operation} operator`);
    }
    switch(operation) {
      case '+':
        addingevaluables.push(right);
        break;
      case '-':
        subtractingevaluables.push(right);
        break;
    }
    const operands: Evaluable[] = [];
    for (const addingevaluable of addingevaluables) {
      operands.push(parseAddition(addingevaluable));
    }
    for (const subtractingevaluable of subtractingevaluables) {
      operands.push({
        type: 'Negate',
        operand: parseAddition(subtractingevaluable),
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
  const multiplyingevaluables: string[] = [];
  const dividingevaluables: string[] = [];
  let found = false;
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
          multiplyingevaluables.push(left);
          break;
        case '/':
          dividingevaluables.push(left);
          break;
      }
      found = true;
      operation = c;
      startIndex = i + 1;
    }
  }
  if (nest > 0) {
    throw new Error('unmatched bracket');
  }
  if (found) {
    const right = expression.substring(startIndex);
    if (right.length === 0) {
      throw new Error(`missing right operand of ${operation} operator`);
    }
    switch(operation) {
      case '*':
        multiplyingevaluables.push(right);
        break;
      case '/':
        dividingevaluables.push(right);
        break;
    }
    const numerators: Evaluable[] = [];
    const denominators: Evaluable[] = [];

    for (const multiplyingevaluable of multiplyingevaluables) {
      numerators.push(parseAddition(multiplyingevaluable));
    }
    for (const dividingevaluable of dividingevaluables) {
      denominators.push(parseAddition(dividingevaluable));
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
  const last = expression[expression.length - 1];
  const left = expression.substring(0, expression.length - 1);
  if (last === '!') {
    if (left.length === 0) {
      throw new Error('missing left operand of ! operator');
    }
    return {
      type: 'Factorial',
      operand: parseAddition(left),
    };
  }
  if (first === '(' && last === ')') {
    if (expression.length === 2) {
      throw new Error('empty bracket');
    }
    return parseAddition(expression.substring(1, expression.length - 1));
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
  throw new Error(`invalid expression: ${expression}`);
}

function sum(num: string): string {
  const numBigInt = BigInt(num);
  return (numBigInt * (numBigInt + 1n)) / 2n + '';
}
