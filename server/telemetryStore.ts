import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  TelemetryEvaluation,
  TelemetryPayload,
  TelemetryRecord,
} from "./telemetry";

type TelemetryRow = {
  id: string;
  device_id: string;
  temperature_c: number;
  battery_voltage_v: number;
  current_a: number;
  temp_rise_c_per_min: number;
  risk_score: number;
  alert: boolean;
  recorded_at: string;
};

export type TelemetryStore = {
  insertReading(
    payload: TelemetryPayload,
    evaluation: TelemetryEvaluation
  ): Promise<TelemetryRecord>;
  getLatest(deviceId: string): Promise<TelemetryRecord | null>;
  getHistory(deviceId: string, limit: number): Promise<TelemetryRecord[]>;
};

export type TelemetryStoreConfig = {
  url: string;
  serviceRoleKey: string;
};

export function resolveSupabaseServerConfig(
  env: NodeJS.ProcessEnv = process.env
): TelemetryStoreConfig | null {
  const configuredUrl = env.SUPABASE_URL?.trim();
  const serviceRoleKey = (
    env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY
  )?.trim();
  if (!configuredUrl || !serviceRoleKey) return null;

  // Accept both the normal API URL and the Supabase dashboard project URL.
  const dashboardMatch = configuredUrl.match(
    /^https:\/\/supabase\.com\/dashboard\/project\/([a-z0-9]+)$/i
  );
  const url = dashboardMatch
    ? `https://${dashboardMatch[1]}.supabase.co`
    : configuredUrl.replace(/\/+$/, "");
  return { url, serviceRoleKey };
}

export function createSupabaseTelemetryStore(
  config: TelemetryStoreConfig | null = resolveSupabaseServerConfig()
): TelemetryStore | null {
  if (!config) return null;
  const client = createClient(config.url, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return createTelemetryStore(client);
}

export function createTelemetryStore(client: SupabaseClient): TelemetryStore {
  const mapRow = (row: TelemetryRow): TelemetryRecord => ({
    id: row.id,
    device_id: row.device_id,
    temperature_c: Number(row.temperature_c),
    battery_voltage_v: Number(row.battery_voltage_v),
    current_a: Number(row.current_a),
    temp_rise_c_per_min: Number(row.temp_rise_c_per_min),
    risk_score: Number(row.risk_score),
    alert: Boolean(row.alert),
    recorded_at: row.recorded_at,
  });

  return {
    async insertReading(payload, evaluation) {
      const { data, error } = await client
        .from("telemetry_readings")
        .insert({
          device_id: payload.device_id,
          temperature_c: payload.temperature_c,
          battery_voltage_v: payload.battery_voltage_v,
          current_a: payload.current_a,
          temp_rise_c_per_min: evaluation.temp_rise_c_per_min,
          risk_score: evaluation.risk_score,
          alert: evaluation.alert,
          recorded_at: evaluation.recorded_at,
        })
        .select(
          "id,device_id,temperature_c,battery_voltage_v,current_a,temp_rise_c_per_min,risk_score,alert,recorded_at"
        )
        .single();
      if (error) throw error;
      return mapRow(data as TelemetryRow);
    },

    async getLatest(deviceId) {
      const { data, error } = await client
        .from("telemetry_readings")
        .select(
          "id,device_id,temperature_c,battery_voltage_v,current_a,temp_rise_c_per_min,risk_score,alert,recorded_at"
        )
        .eq("device_id", deviceId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapRow(data as TelemetryRow) : null;
    },

    async getHistory(deviceId, limit) {
      const { data, error } = await client
        .from("telemetry_readings")
        .select(
          "id,device_id,temperature_c,battery_voltage_v,current_a,temp_rise_c_per_min,risk_score,alert,recorded_at"
        )
        .eq("device_id", deviceId)
        .order("recorded_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map(row => mapRow(row as TelemetryRow));
    },
  };
}
