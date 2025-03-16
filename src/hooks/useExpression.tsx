import { useState } from "react";
import { evaluateExpression } from "../core/calculations";
import { truncate } from "../core/utils";

export const useExpression = (question?: number) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>('Input something above');
  
  const handleInputChange = (value: string) => {
    if(value.length === 0) {
      setExpression('');
      setResult(null);
      setError(null);
      setWarning('Input something above');
    }

    const replacedValue = value.replace(/[^0-9+\-*/()!^.SsRr ]/g, '').toLocaleUpperCase();
    let result = "";
    
    setExpression(replacedValue);
    
    if (replacedValue !== '') {
      try {
        result = evaluateExpression(replacedValue);
        if (result.includes('.')) {
          setResult(truncate(result, 16));
          setError('Result is not an integer');
        } else if (result.length > 16) {
          setResult(truncate(result, 16));
          setError('Result is too long');
        } else {
          setResult(result);
          setError(null);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          console.error(error);
          setError('Something went wrong');
        }
      }
    } else {
      setResult(null);
      setError(null);
    }
    
    if (replacedValue.length === 0) {
      setWarning('Input something above');
    } else if (replacedValue.match(/[012356789]/)) {
      setWarning('Only the number 4 is allowed in the expression');
    } else if (replacedValue.match(/4/g)?.length !== 4) {
      setWarning('You must use exactly four 4s in the expression');
    } else {
      if (question != undefined && result && result !== question.toString()) {
        setWarning('Not match');
      } else {
        setWarning(null);
      }
    }
  }

  return [
    expression,
    result,
    error,
    warning,
    handleInputChange,
  ] as const;
}
