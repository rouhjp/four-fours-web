import { getAnswer } from "../core/answers";
import { evaluateExpression } from "../core/calculations";

describe("evaluateExpression", () => {
  test("Sum (S4)", () => {
    expect(evaluateExpression("S4")).toBe("10");
  });

  test("Factorial (4!)", () => {
    expect(evaluateExpression("4!")).toBe("24");
  });

  test("Root (R4)", () => {
    expect(evaluateExpression("R4")).toBe("2");
  });

  test("Sum and Factorial (R4!)", () => {
    expect(evaluateExpression("S4!")).toBe("300");
  });

  test("Float Point (.4)", () => {
    expect(evaluateExpression(".4")).toBe("0.4");
  });

  test("Float Point (4.4)", () => {
    expect(evaluateExpression("4.4")).toBe("4.4");
  });

  test("Float Point Addition (4.4+.4)", () => {
    expect(evaluateExpression("4.4+.4")).toBe("4.8");
  });

  test("Float Point Multiplication (4.4*.4)", () => {
    expect(evaluateExpression("4.4*.4")).toBe("1.76");
  });

  test("Float Point Division (1/0.4)", () => {
    expect(evaluateExpression("1/0.4")).toBe("2.5");
  });

  test("Float Point Division (4.4/.4)", () => {
    expect(evaluateExpression("4.4/.4")).toBe("11");
  });

  test("Negate (-4)", () => {
    expect(evaluateExpression("-4")).toBe("-4");
  });

  test("Negate and Factorial (-4!)", () => {
    expect(evaluateExpression("-4!")).toBe("-24");
  });

  test("Addition (4+4)", () => {
    expect(evaluateExpression("4+4")).toBe("8");
  });

  test("Addtion with Negate (-4+4)", () => {
    expect(evaluateExpression("-4+4")).toBe("0");
  });

  test("Subtraction (4-4)", () => {
    expect(evaluateExpression("4-4")).toBe("0");
  });

  test("Multiplication (4*4)", () => {
    expect(evaluateExpression("4*4")).toBe("16");
  });

  test("Division (4/4)", () => {
    expect(evaluateExpression("4/4")).toBe("1");
  });

  test("Exponentiation (4^4)", () => {
    expect(evaluateExpression("4^4")).toBe("256");
  });

  test("Unwrap Bracket ((4))", () => {
    expect(evaluateExpression("(4)")).toBe("4");
  });

  test("Double Unary Operators (SSR4)", () => {
    expect(evaluateExpression("SSR4")).toBe("6");
  });

  test("Bracketed Factorial ((S4)!)", () => {
    expect(evaluateExpression("(S4)!")).toBe("3628800");
  });

  test("Nested Expression (4*(4-4)+4)", () => {
    expect(evaluateExpression("4*(4-4)+4")).toBe("4");
  });

  test("Multiple Nesting (R((SR4+R4)^R4))", () => {
    expect(evaluateExpression("R((SR4+R4)^R4)")).toBe("5");
  });

  test("Multiple Digit Constant (444/4)", () => {
    expect(evaluateExpression("444/4")).toBe("111");
  });

  test("Multiple Subtraction (44-4-4)", () => {
    expect(evaluateExpression("44-4-4")).toBe("36");
  });

  test("Multiply with Brackets ((4/4)*(4/4))", () => {
    expect(evaluateExpression("(4/4)*(4/4)")).toBe("1");
  });

  test("Multiply and Divide Order (SSR4/R4*SR4)", () => {
    expect(evaluateExpression("SSR4/R4*SR4")).toBe("9");
  });

  test("Algebraic Fraction Addition ((1/2)+(1/2))", () => {
    expect(evaluateExpression("(1/2)+(1/2)")).toBe("1");
  });

  test("Algebraic Root Addition ((1/R2)-(1/R2))", () => {
    expect(evaluateExpression("(1/R2)-(1/R2)")).toBe("0");
  });

  test("Algebraic Root Simplification (2/R2-R2)", () => {
    expect(evaluateExpression("2/R2-R2")).toBe("0");
  });
});

describe("verifyAnswers", () => {
  test("Verify All Answers", () => {
    for(let i = 0; i<=3000; i++) {
      const answer = getAnswer(i);
      expect(evaluateExpression(answer)).toBe(i.toString());
    }
  });
});
