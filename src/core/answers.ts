import answersData from './answers.json';
import { evaluate } from './calculations';

const ANSWERS: string[] = answersData.answers;

export function getAnswer(number: number): string {
  if (number < 0 || number >= ANSWERS.length) {
    return '';
  }
  return ANSWERS[number];
}

export function removeUnnecessaryBrackets(input: string) {
  const startIndexes = [];
  const brackets = [];
  for(let i = 0; i<input.length; i++) {
    const c = input[i];
    if (c === '(') {
      startIndexes.push(i);
    }
    if (c === ')') {
      const startIndex = startIndexes.pop() || 0;
      const bracket = {from: startIndex, to: i};
      brackets.push(bracket);
    }
  }

  const oldResult = evaluate(input);
  for (const bracket of brackets) {
    try {
      const bracketRemoved = input.slice(0, bracket.from) + input.slice(bracket.from + 1, bracket.to) + input.slice(bracket.to + 1);
      const newResult = evaluate(bracketRemoved);
      if (newResult === oldResult) {
        return removeUnnecessaryBrackets(bracketRemoved);
      }
    } catch {
      // pass
    }
  }
  return input;
}