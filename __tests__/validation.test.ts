import { validateEmail, validatePassword } from "../lib/utils/validation";

describe("validateEmail", () => {
  it("accepts a normal email", () => {
    expect(validateEmail("user@example.com")).toBeNull();
  });

  it("accepts subdomains and plus addressing", () => {
    expect(validateEmail("user+tag@mail.example.co")).toBeNull();
  });

  it("rejects a missing @", () => {
    expect(validateEmail("userexample.com")).toBe("Invalid email address");
  });

  it("rejects a missing domain dot", () => {
    expect(validateEmail("user@example")).toBe("Invalid email address");
  });

  it("rejects whitespace", () => {
    expect(validateEmail("user @example.com")).toBe("Invalid email address");
  });

  it("rejects the empty string", () => {
    expect(validateEmail("")).toBe("Invalid email address");
  });
});

describe("validatePassword", () => {
  const ERROR = "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";

  it("accepts a compliant password", () => {
    expect(validatePassword("TestPass1!")).toBeNull();
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePassword("Te1!abc")).toBe(ERROR);
  });

  it("rejects passwords without an uppercase letter", () => {
    expect(validatePassword("testpass1!")).toBe(ERROR);
  });

  it("rejects passwords without a lowercase letter", () => {
    expect(validatePassword("TESTPASS1!")).toBe(ERROR);
  });

  it("rejects passwords without a digit", () => {
    expect(validatePassword("TestPass!!")).toBe(ERROR);
  });

  it("rejects passwords without a special character", () => {
    expect(validatePassword("TestPass11")).toBe(ERROR);
  });
});
