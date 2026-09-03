# PredictBMS

Predictive Battery Intelligence & Thermal Runaway Prevention System — a
retrofittable safety layer for EV battery packs, combining ESP32-based
sensor firmware with a real-time web monitoring dashboard.

This repository contains two parts of the system:

- **`/client`, `/server`, `/shared`** — the web dashboard (React +
  Node/Express + Supabase auth) for real-time fleet monitoring, alerts,
  and reporting
- **`/firmware`** — the ESP32 sensor firmware, wiring, schematic, and
  bill of materials for the physical battery-monitoring hardware

---

## Problem

Traditional Battery Management Systems (BMS) rely on rigid, hard
thresholds for safety. They typically wait until a battery has already
exceeded critical temperature or current limits before triggering an
alert. This reactive approach often results in thermal runaway,
permanent cell damage, or safety hazards — a documented, rising concern
in India's EV two-wheeler segment.

## What PredictBMS Does

PredictBMS continuously monitors voltage, current, and temperature on
a battery pack and calculates a dynamic **weighted risk score (0–100)**
instead of a simple pass/fail threshold:

- **Temperature Magnitude** — Weight: 45%
- **Current Load** — Weight: 35%
- **Rate of Temperature Rise** — Weight: 20%

This allows the system to flag a battery as "risky" even before any
single value crosses a hard limit — giving a critical window to act
before thermal runaway occurs.

## Web Dashboard (`/client`, `/server`, `/shared`)

A real-time monitoring interface for viewing fleet-wide battery health:

- Live risk-score view per battery pack (voltage, current, temperature)
- Alerts feed (Normal / Watch / Critical severity)
- Reports view (risk distribution, alert trends)
- Supabase-backed authentication (email/password)

**Tech stack:** React, TypeScript, Vite, Node/Express, Supabase
(Auth + Postgres)

See [`/client`](./client) and [`/server`](./server) for source.

## Firmware & Hardware (`/firmware`)

The physical sensor rig that feeds real battery telemetry into the
system.

**Hardware:**
- ESP32-DevKitV1 — main controller
- DS18B20 — temperature sensor
- ACS712-20A — current sensor
- Voltage divider network (68kΩ, 10kΩ ×2, 22kΩ)
- Status LED, alert LED, piezo buzzer

**Firmware logic:** samples sensors every 1000ms, computes the
weighted risk score, and triggers local LED/buzzer alerts when the
score exceeds 60 or any hard threshold is breached (Temp > 45°C,
Current > 10A, Rise > 4°C/min).

Full hardware README, wiring table, and file breakdown:
[`/firmware/README.md`](./firmware/README.md)

## Demo Flow

1. **Baseline** — system initializes, stable readings, low risk score
2. **Stress test (current)** — increased load raises the risk score
3. **Stress test (temperature)** — rising temp/rate triggers escalation
4. **Alert** — risk score crosses 60 or a hard threshold is hit →
   local alert (LED/buzzer) + dashboard alert fire together

## Innovation

- Shifts BMS behavior from **reactive** (threshold shutdown) to
  **predictive** (continuous risk scoring)
- **Retrofit-friendly** — designed to sit alongside an existing BMS,
  not replace it, so it can be added to EVs already on the road
- Combines **firmware-level detection** with a **fleet-level
  dashboard**, rather than being a single-device gadget

## Future Work

- MQTT/Wi-Fi integration to push firmware alerts directly into the
  dashboard in real time
- Cell-by-cell voltage monitoring for multi-cell packs
- "Safe Mode" cutoff relay to physically disconnect the battery when
  risk is critical

## Team

**[Team Name]** — E-Mobility HackFest 2026, Global EV Summit &
Innovation Conclave
