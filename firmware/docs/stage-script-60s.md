# PredictBMS — 60-Second Stage Script

Hello judges, we built **PredictBMS**, a predictive EV battery monitoring prototype focused on **early warning**, not just emergency shutdown.

## Problem
In many low-cost battery systems, alerts come too late — after current spikes or heat buildup are already dangerous.

## What we built
Our ESP32 reads three safety signals every second:
- **Current** with ACS712
- **Pack voltage** through a scaled voltage-sensing divider
- **Temperature** with DS18B20

## Innovation
Instead of using only hard limits, PredictBMS computes a simple **risk score** using:
- absolute temperature,
- over-current behavior,
- and **temperature rise rate**.

So even before critical thresholds are crossed, the system can flag abnormal trends.

## Live demo flow
1. We power the system and open Serial Monitor.
2. You see real-time current, voltage, temperature, and risk output every second.
3. We simulate stress by heating the temperature probe.
4. As risk rises, the **LED and buzzer trigger early warning**.

## Impact
This approach can improve EV battery safety by giving drivers or BMS controllers extra reaction time.

## Future work
Next steps are adaptive thresholds by battery chemistry, cloud logging, SOC/SOH estimation, and integration with contactor control for automatic mitigation.

Thank you.