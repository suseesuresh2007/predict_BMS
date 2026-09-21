# PredictBMS telemetry ingestion

## Endpoint

The deployed API endpoint is:

```text
POST https://<YOUR_PREDICTBMS_HOST>/api/telemetry
```

For local development, use:

```text
POST http://<YOUR_SERVER_HOST>:3000/api/telemetry
```

The server route is exactly `/api/telemetry`. It accepts JSON and returns `201 Created` with the stored reading.

## Authentication

Use a dedicated device bearer token, not a Supabase user session. Configure the server with a random secret in `TELEMETRY_DEVICE_TOKEN`, then send this HTTP header from the ESP32:

```http
Authorization: Bearer <same value as TELEMETRY_DEVICE_TOKEN>
Content-Type: application/json
```

Keep the token out of source control. The current firmware keeps a placeholder in `firmware/src/config.h`; replace it before flashing. If the token is missing or incorrect, the endpoint returns `401 Unauthorized`.

## Required JSON fields

```json
{
  "device_id": "esp32-demo-01",
  "temperature_c": 34.8,
  "battery_voltage_v": 48.6,
  "current_a": 8.2
}
```

`device_id`, `temperature_c`, `battery_voltage_v`, and `current_a` are required. `recorded_at` is optional and must be an ISO-8601 timestamp with a timezone offset, for example `2026-09-21T12:16:57+05:30`. If omitted, the server timestamp is used.

The server calculates and stores `temp_rise_c_per_min`, `risk_score`, and `alert` from the incoming value and the previous reading for that device. The risk score follows the firmware model: temperature 45%, absolute current 35%, and positive temperature-rise rate 20%.

## Example request

```bash
curl -i -X POST "https://<YOUR_PREDICTBMS_HOST>/api/telemetry" \
  -H "Authorization: Bearer $TELEMETRY_DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "device_id": "esp32-demo-01",
    "temperature_c": 34.8,
    "battery_voltage_v": 48.6,
    "current_a": 8.2
  }'
```

## Dashboard reads

The protected dashboard uses the signed-in Supabase user session to call:

```text
GET /api/telemetry/latest?device_id=esp32-demo-01
GET /api/telemetry/history?device_id=esp32-demo-01&limit=30
```

These read routes require `Authorization: Bearer <Supabase access token>`. The dashboard refreshes them every five seconds and falls back to the local demo stream when no stored reading exists.

## Server configuration

Set these server-side variables in the deployment environment:

```dotenv
SUPABASE_URL=https://<supabase-project-ref>.supabase.co
SUPABASE_ANON_KEY=<public-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
TELEMETRY_DEVICE_TOKEN=<long-random-device-token>
TELEMETRY_DEFAULT_DEVICE_ID=esp32-demo-01
```

`SUPABASE_SERVICE_ROLE_KEY` may be supplied as `SUPABASE_KEY` for compatibility with the current sandbox environment. Never expose either server key in the browser or firmware.

Apply `supabase/migrations/20260921_telemetry_readings.sql` to the same Supabase project before starting the server.

## Security note

The prototype firmware uses `WiFiClientSecure::setInsecure()` so it can connect without bundling a CA certificate. For production, replace that call with the CA certificate for the deployed host or certificate pinning. The bearer token should also be rotated if the device is lost or the firmware image is shared.
