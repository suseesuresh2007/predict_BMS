#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

OneWire oneWire(PIN_ONEWIRE);
DallasTemperature ds18(&oneWire);

struct Measurements {
    float temperatureC = NAN;
    float currentA = NAN;
    float vPack = NAN;
    float tempRiseCPerMin = 0.0f;
    float riskScore = 0.0f;
    bool overTemp = false;
    bool overCurrent = false;
    bool fastTempRise = false;
    bool alert = false;
};

static uint32_t lastSampleMs = 0;
static float lastTempC = NAN;
static uint32_t lastTempMs = 0;

static float clamp01(float x) {
    if (x < 0.0f) return 0.0f;
    if (x > 1.0f) return 1.0f;
    return x;
}

static float adcRawToVolts(int raw) {
    return (static_cast<float>(raw) * ADC_VREF) / static_cast<float>(ADC_MAX);
}

static float readBatteryVoltage() {
    int raw = analogRead(PIN_V_PACK_ADC);
    float vadc = adcRawToVolts(raw);
    return vadc * VPACK_DIVIDER_RATIO;
}

static float readCurrentA() {
    int raw = analogRead(PIN_I_SENSE);
    float vadc = adcRawToVolts(raw);
    float vsensor = vadc * ACS_DIVIDER_RATIO;
    return (vsensor - ACS_ZERO_CURRENT_V) / ACS_SENSITIVITY_V_PER_A;
}

static float readTemperatureC() {
    ds18.requestTemperatures(); // blocking, ~188ms at 10-bit
    float t = ds18.getTempCByIndex(0);
    if (t == DEVICE_DISCONNECTED_C) {
        return NAN;
    }
    return t;
}

static Measurements readAndEvaluate() {
    Measurements m;
    uint32_t nowMs = millis();

    m.temperatureC = readTemperatureC();
    m.currentA = readCurrentA();
    m.vPack = readBatteryVoltage();

    // Temperature rise rate (C/min)
    if (!isnan(m.temperatureC) && !isnan(lastTempC) && nowMs > lastTempMs) {
        float dtMin = (nowMs - lastTempMs) / 60000.0f;
        if (dtMin > 0.0f) {
            m.tempRiseCPerMin = (m.temperatureC - lastTempC) / dtMin;
        }
    }

    if (!isnan(m.temperatureC)) {
        lastTempC = m.temperatureC;
        lastTempMs = nowMs;
    }

    // Hard early-trigger checks requested by brief
    m.overTemp = (!isnan(m.temperatureC) && m.temperatureC > TEMP_WARN_C);
    m.overCurrent = (!isnan(m.currentA) && fabs(m.currentA) > CURRENT_WARN_A);
    m.fastTempRise = (m.tempRiseCPerMin > TEMP_RISE_WARN_C_PER_MIN);

    // Weighted predictive score:
    // - tempNorm rises with absolute temperature
    // - currNorm rises with absolute current
    // - riseNorm rises with positive heating rate
    float tempNorm = (!isnan(m.temperatureC)) ? clamp01(m.temperatureC / TEMP_SCORE_FULL_C) : 0.0f;
    float currNorm = (!isnan(m.currentA)) ? clamp01(fabs(m.currentA) / CURRENT_SCORE_FULL_A) : 0.0f;
    float riseNorm = clamp01(m.tempRiseCPerMin / RISE_SCORE_FULL_C_PER_MIN);

    m.riskScore = 100.0f * (
        SCORE_W_TEMP * tempNorm +
        SCORE_W_CURRENT * currNorm +
        SCORE_W_RISE * riseNorm
    );

    // Alert if any direct early-warning trigger OR score exceeds threshold.
    m.alert = m.overTemp || m.overCurrent || m.fastTempRise || (m.riskScore >= SCORE_ALERT_THRESHOLD);

    return m;
}

static void applyAlertOutputs(bool alert) {
    digitalWrite(PIN_LED_CTRL, alert ? HIGH : LOW);
    digitalWrite(PIN_BUZZ_CTRL, alert ? HIGH : LOW);
}

static void printMeasurements(const Measurements& m) {
    Serial.println(F("---- PredictBMS Telemetry ----"));
    Serial.printf("Temp      : %s C\n", isnan(m.temperatureC) ? "NaN" : String(m.temperatureC, 2).c_str());
    Serial.printf("Current   : %s A\n", isnan(m.currentA) ? "NaN" : String(m.currentA, 2).c_str());
    Serial.printf("Battery   : %s V\n", isnan(m.vPack) ? "NaN" : String(m.vPack, 2).c_str());
    Serial.printf("dT/dt     : %.2f C/min\n", m.tempRiseCPerMin);
    Serial.printf("RiskScore : %.1f / 100\n", m.riskScore);
    Serial.printf("Triggers  : temp>%gC=%s, |I|>%gA=%s, fastRise>%gC/min=%s\n",
                  TEMP_WARN_C, m.overTemp ? "YES" : "no",
                  CURRENT_WARN_A, m.overCurrent ? "YES" : "no",
                  TEMP_RISE_WARN_C_PER_MIN, m.fastTempRise ? "YES" : "no");
    Serial.printf("ALERT     : %s\n", m.alert ? "ON" : "OFF");
    Serial.println();
}

void setup() {
    Serial.begin(115200);
    delay(200);

    pinMode(PIN_LED_CTRL, OUTPUT);
    pinMode(PIN_BUZZ_CTRL, OUTPUT);
    digitalWrite(PIN_LED_CTRL, LOW);
    digitalWrite(PIN_BUZZ_CTRL, LOW);

    // ESP32 ADC setup (12-bit, 0..4095)
    analogReadResolution(12);
    analogSetPinAttenuation(PIN_V_PACK_ADC, ADC_11db);
    analogSetPinAttenuation(PIN_I_SENSE, ADC_11db);

    ds18.begin();
    ds18.setResolution(10); // faster conversion, good for 1-second loop

    Serial.println(F("PredictBMS started."));
    lastSampleMs = millis();
}

void loop() {
    uint32_t now = millis();
    if (now - lastSampleMs >= SAMPLE_INTERVAL_MS) {
        lastSampleMs = now;

        Measurements m = readAndEvaluate();
        applyAlertOutputs(m.alert);
        printMeasurements(m);
    }
}
