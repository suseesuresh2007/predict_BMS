# PredictBMS — 30-Second Fallback Script

We built PredictBMS, an ESP32-based early-warning monitor for EV battery safety.

Every second it reads three signals: battery current via ACS712, pack voltage via a divider, and temperature via DS18B20.

Instead of waiting for a critical failure, we compute a predictive risk score using temperature level, current stress, and how fast temperature is rising.

When risk rises early, the LED and buzzer alert immediately.

This gives extra reaction time before dangerous conditions, and the same logic can scale to cloud logging and full BMS integration.