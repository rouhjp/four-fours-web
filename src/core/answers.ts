import answersData from './answers.json';
import { evaluateExpression } from './calculations';

const ANSWERS: string[] = answersData.answers;

export function getAnswer(number: number): string {
  if (number < 0 || number >= ANSWERS.length) {
    return '';
  }
  return ANSWERS[number];
}

export function removeUnnecessaryBrackets(expression: string) {
  const startIndexes = [];
  const brackets = [];
  for(let i = 0; i<expression.length; i++) {
    const c = expression[i];
    if (c === '(') {
      startIndexes.push(i);
    }
    if (c === ')') {
      const startIndex = startIndexes.pop() || 0;
      const bracket = {from: startIndex, to: i};
      brackets.push(bracket);
    }
  }

  const oldResult = evaluateExpression(expression);
  for (const bracket of brackets) {
    try {
      const bracketRemoved = expression.slice(0, bracket.from) + expression.slice(bracket.from + 1, bracket.to) + expression.slice(bracket.to + 1);
      const newResult = evaluateExpression(bracketRemoved);
      if (newResult === oldResult) {
        return removeUnnecessaryBrackets(bracketRemoved);
      }
    } catch {
      // pass
    }
  }
  return expression;
}