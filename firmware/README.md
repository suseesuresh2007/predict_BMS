PredictBMS
Predictive Battery Management System using weighted risk scoring to detect thermal runaway before it occurs.
What it does
PredictBMS is a real-time battery monitoring system that predicts thermal runaway and over-current events before they become critical. Unlike traditional BMS that trigger alerts only after hard thresholds are crossed, this system continuously calculates a weighted risk score based on temperature, current magnitude, and temperature rise rate. It provides early warnings and visual/audio alerts to prevent battery damage.
Hardware
ESP32-DevKitV1 — Main controller (Wi-Fi/Bluetooth capable)
DS18B20 — 1-Wire temperature sensor
ACS712-20A — Hall-effect current sensor (±20A)
Resistors — 68kΩ, 10kΩ (x2), 22kΩ (Voltage divider network)
LEDs — Red (Status) and Yellow (Alert)
Active Piezo Buzzer — Audible alarm
Capacitors — 100nF, 10µF (Stability)
Wiring
Pin 21 — LED Red (Status)
Pin 26 — Buzzer (Active High)
Pin 35 — Battery Voltage (ADC, Attenuation 11dB)
Pin 34 — Current Sense (ACS712, Attenuation 11dB)
Pin 4 — DS18B20 (1-Wire)
5V / GND — Power sensors and buzzer
How to use
Hardware Setup: Connect the ESP32 to the breadboard and wire the sensors and output components according to the pin map in `src/config.h`.
Power: Connect a 5V power supply to the ESP32 and sensors.
Serial Monitor: Open the Serial Monitor at 115200 baud to view telemetry.
Operation: The system samples every 1000ms. Watch the `RiskScore` and `ALERT` fields. If the score exceeds 60 or any hard threshold (Temp > 45°C, Current > 10A, Rise > 4°C/min) is met, the LED and buzzer will activate.
Files
`firmware/src/main.cpp` — Core logic, sensor reading, and predictive scoring algorithm.
`firmware/src/config.h` — Pin definitions, electrical constants, and alert thresholds.
`firmware/specs/bom.json` — Bill of Materials.
`firmware/docs/steps.json` — Assembly instructions.
`firmware/schematic/main.sch` — Schematic diagram.
`firmware/platformio.ini` — PlatformIO project configuration.
Hackathon Submission Overview
Problem
Traditional Battery Management Systems (BMS) rely on rigid, hard thresholds for safety. They typically wait until a battery has already exceeded critical temperature or current limits before triggering an alert. This reactive approach often results in thermal runaway, permanent cell damage, or safety hazards.
Innovation
PredictBMS introduces a predictive risk scoring algorithm. Instead of simple binary triggers, the system calculates a dynamic risk score (0–100) by combining:
Temperature Magnitude (Weight: 45%)
Current Load (Weight: 35%)
Rate of Temperature Rise (Weight: 20%)
This allows the system to flag a battery as "risky" even if absolute values haven't hit hard limits yet, providing a critical window for intervention.
Impact
By shifting from reactive to predictive safety, this system can significantly extend battery lifespan and prevent catastrophic failure. The use of ESP32 allows for future integration with cloud dashboards for remote fleet monitoring.
Demo Flow
Baseline: Initialize system. Serial output shows stable readings and a low risk score.
Stress Test (Current): Increase load. The system detects high current; the risk score rises.
Stress Test (Temperature): Apply heat. The system detects rising temperature and rate of change.
Alert: Once the weighted score exceeds 60 or hard thresholds are met, the Red LED and Buzzer activate immediately.
Future Work
Integrate MQTT/Wi-Fi to send alerts to a smartphone app.
Implement cell-by-cell voltage monitoring for multi-cell packs.
Add a "Safe Mode" cutoff relay to physically disconnect the battery when risk is critical.
