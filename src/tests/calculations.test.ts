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

  test("Float Point (.4)", () => {
    expect(evaluateExpression(".4")).toBe("0.4");
  })

  test("Float Point (4.4)", () => {
    expect(evaluateExpression("4.4")).toBe("4.4");
  })

  test("Negate (-4)", () => {
    expect(evaluateExpression("-4")).toBe("-4");
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

  test("Double Side Unary Operators (S4!)", () => {
    expect(evaluateExpression("S4!")).toBe("300");
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
});
