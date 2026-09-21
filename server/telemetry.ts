import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { extractBearerToken } from "./dashboardAccess";

export const telemetryPayloadSchema = z
  .object({
    device_id: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[A-Za-z0-9._:-]+$/),
    temperature_c: z.number().finite().min(-100).max(200),
    battery_voltage_v: z.number().finite().min(0).max(1000),
    current_a: z.number().finite().min(-500).max(500),
    recorded_at: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export type TelemetryPayload = z.infer<typeof telemetryPayloadSchema>;

export type PreviousTelemetry = {
  temperature_c: number;
  recorded_at: string;
};

export type TelemetryEvaluation = {
  recorded_at: string;
  temp_rise_c_per_min: number;
  risk_score: number;
  alert: boolean;
};

export type TelemetryRecord = TelemetryPayload &
  TelemetryEvaluation & { id: string };

export function resolveTelemetryDeviceToken(
  env: NodeJS.ProcessEnv = process.env
): string | null {
  const token = env.TELEMETRY_DEVICE_TOKEN?.trim();
  return token || null;
}

export function hasValidTelemetryToken(
  authorizationHeader: string | undefined,
  expectedToken: string | null
): boolean {
  const presentedToken = extractBearerToken(authorizationHeader);
  if (!presentedToken || !expectedToken) return false;

  const presented = Buffer.from(presentedToken);
  const expected = Buffer.from(expectedToken);
  return (
    presented.length === expected.length && timingSafeEqual(presented, expected)
  );
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function evaluateTelemetry(
  payload: TelemetryPayload,
  previous: PreviousTelemetry | null = null,
  now: Date = new Date()
): TelemetryEvaluation {
  const recordedAt = payload.recorded_at ? new Date(payload.recorded_at) : now;
  const previousAt = previous ? new Date(previous.recorded_at) : null;
  const elapsedMinutes = previousAt
    ? (recordedAt.getTime() - previousAt.getTime()) / 60000
    : 0;
  const tempRise =
    previous && elapsedMinutes > 0
      ? (payload.temperature_c - previous.temperature_c) / elapsedMinutes
      : 0;
  const tempRiseCPerMin = Number(tempRise.toFixed(3));

  const temperatureRisk = clamp01(payload.temperature_c / 60);
  const currentRisk = clamp01(Math.abs(payload.current_a) / 20);
  const riseRisk = clamp01(Math.max(0, tempRiseCPerMin) / 8);
  const riskScore = Number(
    (
      100 *
      (0.45 * temperatureRisk + 0.35 * currentRisk + 0.2 * riseRisk)
    ).toFixed(2)
  );

  return {
    recorded_at: recordedAt.toISOString(),
    temp_rise_c_per_min: tempRiseCPerMin,
    risk_score: riskScore,
    alert:
      payload.temperature_c > 45 ||
      Math.abs(payload.current_a) > 10 ||
      tempRiseCPerMin > 4 ||
      riskScore >= 60,
  };
}
