import { describe, expect, it } from "vitest";
import {
  evaluateTelemetry,
  hasValidTelemetryToken,
  telemetryPayloadSchema,
} from "./telemetry";

const basePayload = {
  device_id: "esp32-demo-01",
  temperature_c: 34.8,
  battery_voltage_v: 48.6,
  current_a: 8.2,
};

describe("telemetry contract", () => {
  it("accepts the ESP32 payload and rejects unexpected fields", () => {
    expect(telemetryPayloadSchema.safeParse(basePayload).success).toBe(true);
    expect(
      telemetryPayloadSchema.safeParse({ ...basePayload, risk_score: 12 })
        .success
    ).toBe(false);
  });

  it("compares device bearer tokens without accepting malformed headers", () => {
    expect(
      hasValidTelemetryToken("Bearer device-secret", "device-secret")
    ).toBe(true);
    expect(hasValidTelemetryToken("Bearer wrong", "device-secret")).toBe(false);
    expect(hasValidTelemetryToken(undefined, "device-secret")).toBe(false);
    expect(hasValidTelemetryToken("Bearer device-secret", null)).toBe(false);
  });

  it("calculates temperature rise, weighted risk, and alert state", () => {
    const result = evaluateTelemetry(
      { ...basePayload, temperature_c: 45.8, current_a: 11.2 },
      { temperature_c: 41.8, recorded_at: "2026-09-21T12:15:57.000Z" },
      new Date("2026-09-21T12:16:57.000Z")
    );

    expect(result.recorded_at).toBe("2026-09-21T12:16:57.000Z");
    expect(result.temp_rise_c_per_min).toBe(4);
    expect(result.risk_score).toBeGreaterThan(60);
    expect(result.alert).toBe(true);
  });
});
