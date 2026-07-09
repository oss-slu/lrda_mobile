import { formatToLocalDateString } from "../lib/components/time";

describe("formatToLocalDateString", () => {
  it("returns a date line and a time line", () => {
    const result = formatToLocalDateString(new Date(2024, 0, 15, 12, 30));
    const [datePart, timePart] = result.split("\n");
    expect(datePart).toBe("1/15/2024");
    expect(timePart).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
  });

  it("accepts a date-like value without throwing", () => {
    expect(() => formatToLocalDateString(new Date(0))).not.toThrow();
  });
});
