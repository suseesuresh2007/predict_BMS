import { describe, expect, it } from "vitest";
import { filterAndSortSignals, signalsToCsv, type SignalRecord } from "./signalUtils";

const now = new Date("2026-09-03T12:00:00.000Z");
const records: SignalRecord[] = [
  { timestamp: "2026-09-03T10:00:00.000Z", signal: "Temperature", reading: "34.8", unit: "°C", status: "Normal" },
  { timestamp: "2026-09-02T10:00:00.000Z", signal: "Voltage", reading: "48.3", unit: "V", status: "Watch" },
  { timestamp: "2026-08-10T10:00:00.000Z", signal: "Current", reading: "10.5", unit: "A", status: "Critical" },
];

describe("signal table helpers", () => {
  it("filters by status and recent date while sorting newest first", () => {
    const result = filterAndSortSignals(records, "7d", "Watch", "newest", now);
    expect(result).toEqual([records[1]]);
  });

  it("supports oldest-first sorting across the full signal history", () => {
    const result = filterAndSortSignals(records, "all", "all", "oldest", now);
    expect(result.map((record) => record.signal)).toEqual(["Current", "Voltage", "Temperature"]);
  });

  it("creates a CSV with a stable header and escaped values", () => {
    const csv = signalsToCsv([{ ...records[0], signal: "Temperature, pack" }]);
    expect(csv).toContain("Date,Signal,Reading,Unit,Status");
    expect(csv).toContain('"Temperature, pack"');
    expect(csv.split("\n")).toHaveLength(2);
  });
});
