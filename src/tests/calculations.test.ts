import { getAnswer } from "../core/answers";
import { evaluate } from "../core/calculations";

describe("evaluateExpression", () => {
  test("Sum (S4)", () => {
    expect(evaluate("S4")).toBe("10");
  });

  test("Factorial (4!)", () => {
    expect(evaluate("4!")).toBe("24");
  });

  test("Root (R4)", () => {
    expect(evaluate("R4")).toBe("2");
  });

  test("Sum and Factorial (R4!)", () => {
    expect(evaluate("S4!")).toBe("300");
  });

  test("Decimal (.4)", () => {
    expect(evaluate(".4")).toBe("0.4");
  });

  test("Decimal (4.4)", () => {
    expect(evaluate("4.4")).toBe("4.4");
  });

  test("Decimal Addition (4.4+.4)", () => {
    expect(evaluate("4.4+.4")).toBe("4.8");
  });

  test("Decimal Multiplication (4.4*.4)", () => {
    expect(evaluate("4.4*.4")).toBe("1.76");
  });

  test("Decimal Division (1/0.4)", () => {
    expect(evaluate("1/0.4")).toBe("2.5");
  });

  test("Decimal Division (4.4/.4)", () => {
    expect(evaluate("4.4/.4")).toBe("11");
  });

  test("Repating Decimal (.(4)*9)", () => {
    expect(evaluate(".(4)*9")).toBe("4");
  });

  test("Repating Decimal (.(3)*3)", () => {
    expect(evaluate(".(3)*3")).toBe("1");
  });

  test("Negate (-4)", () => {
    expect(evaluate("-4")).toBe("-4");
  });

  test("Negate and Factorial (-4!)", () => {
    expect(evaluate("-4!")).toBe("-24");
  });

  test("Addition (4+4)", () => {
    expect(evaluate("4+4")).toBe("8");
  });

  test("Addtion with Negate (-4+4)", () => {
    expect(evaluate("-4+4")).toBe("0");
  });

  test("Subtraction (4-4)", () => {
    expect(evaluate("4-4")).toBe("0");
  });

  test("Multiplication (4*4)", () => {
    expect(evaluate("4*4")).toBe("16");
  });

  test("Division (4/4)", () => {
    expect(evaluate("4/4")).toBe("1");
  });

  test("Exponentiation (4^4)", () => {
    expect(evaluate("4^4")).toBe("256");
  });

  test("Unwrap Bracket ((4))", () => {
    expect(evaluate("(4)")).toBe("4");
  });

  test("Double Unary Operators (SSR4)", () => {
    expect(evaluate("SSR4")).toBe("6");
  });

  test("Bracketed Factorial ((S4)!)", () => {
    expect(evaluate("(S4)!")).toBe("3628800");
  });

  test("Nested Expression (4*(4-4)+4)", () => {
    expect(evaluate("4*(4-4)+4")).toBe("4");
  });

  test("Multiple Nesting (R((SR4+R4)^R4))", () => {
    expect(evaluate("R((SR4+R4)^R4)")).toBe("5");
  });

  test("Multiple Digit Constant (444/4)", () => {
    expect(evaluate("444/4")).toBe("111");
  });

  test("Multiple Subtraction (44-4-4)", () => {
    expect(evaluate("44-4-4")).toBe("36");
  });

  test("Multiply with Brackets ((4/4)*(4/4))", () => {
    expect(evaluate("(4/4)*(4/4)")).toBe("1");
  });

  test("Multiply and Divide Order (SSR4/R4*SR4)", () => {
    expect(evaluate("SSR4/R4*SR4")).toBe("9");
  });

  test("Algebraic Fraction Addition ((1/2)+(1/2))", () => {
    expect(evaluate("(1/2)+(1/2)")).toBe("1");
  });

  test("Algebraic Root Addition ((1/R2)-(1/R2))", () => {
    expect(evaluate("(1/R2)-(1/R2)")).toBe("0");
  });

  test("Algebraic Root Simplification (2/R2-R2)", () => {
    expect(evaluate("2/R2-R2")).toBe("0");
  });
});

describe("verifyAnswers", () => {
  test("Verify All Answers", () => {
    for(let i = 0; i<=3000; i++) {
      const answer = getAnswer(i);
      expect(evaluate(answer)).toBe(i.toString());
    }
  });
});
