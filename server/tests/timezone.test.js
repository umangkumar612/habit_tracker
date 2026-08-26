const {
  validateTimezone,
  convertUtcToLocalDate,
  getDateTimeForLocalDate
} = require("../utils/timezone");

describe("Timezone Utility", () => {
  test("validates IANA timezone", () => {
    expect(validateTimezone("Asia/Kolkata")).toBe(true);
    expect(validateTimezone("America/New_York")).toBe(true);
    expect(validateTimezone("Europe/London")).toBe(true);
    expect(validateTimezone("UTC")).toBe(true);
  });

  test("rejects invalid timezone", () => {
    expect(validateTimezone("+05:30")).toBe(false);
    expect(validateTimezone("IST")).toBe(false);
    expect(validateTimezone("UTC+5:30")).toBe(false);
    expect(validateTimezone("Invalid/Timezone")).toBe(false);
  });

  test("converts UTC instant to Asia/Kolkata local date", () => {
    const result = convertUtcToLocalDate(
      "2026-03-10T18:30:00Z",
      "Asia/Kolkata"
    );

    expect(result).toBe("2026-03-11");
  });

  test("converts UTC instant to America/New_York local date", () => {
    const result = convertUtcToLocalDate(
      "2026-03-10T23:30:00Z",
      "America/New_York"
    );

    expect(result).toBe("2026-03-10");
  });

  test("handles DST correctly for New York", () => {
    const beforeDst = convertUtcToLocalDate(
      "2026-03-08T06:30:00Z",
      "America/New_York"
    );

    const afterDst = convertUtcToLocalDate(
      "2026-03-08T07:30:00Z",
      "America/New_York"
    );

    expect(beforeDst).toBe("2026-03-08");
    expect(afterDst).toBe("2026-03-08");
  });

  test("creates a valid local DateTime", () => {
    const dateTime = getDateTimeForLocalDate(
      "2026-03-12",
      "Asia/Kolkata"
    );

    expect(dateTime.isValid).toBe(true);
    expect(dateTime.toISODate()).toBe("2026-03-12");
    expect(dateTime.zoneName).toBe("Asia/Kolkata");
  });

  test("rejects invalid local date", () => {
    expect(() => {
      getDateTimeForLocalDate(
        "2026-02-30",
        "Asia/Kolkata"
      );
    }).toThrow("Invalid local date.");
  });
});