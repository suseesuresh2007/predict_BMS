#pragma once

// Pin map (canonical)
static constexpr int PIN_BUZZ_CTRL = 26;
static constexpr int PIN_V_PACK_ADC = 35;
static constexpr int PIN_I_SENSE = 34;
static constexpr int PIN_ONEWIRE = 4;
static constexpr int PIN_LED_CTRL = 21;

// ADC and electrical constants
static constexpr float ADC_VREF = 3.3f;
static constexpr int ADC_MAX = 4095;

// Battery divider: Rtop=68k, Rbot=10k
// Vadc = Vpack * (Rbot / (Rtop + Rbot)) => Vpack = Vadc * ((Rtop + Rbot)/Rbot)
static constexpr float VPACK_DIVIDER_RATIO = (68.0f + 10.0f) / 10.0f; // 7.8

// ACS712 path:
// Sensor is ACS712-20A (100 mV/A), powered from 5V so zero-current output ~2.5V.
// Divider to ADC: Rtop=10k, Rbot=22k
// Vadc = Vsensor * (Rbot / (Rtop + Rbot))
static constexpr float ACS_DIVIDER_RATIO = (10.0f + 22.0f) / 22.0f;   // recover Vsensor from Vadc
static constexpr float ACS_ZERO_CURRENT_V = 2.5f;                      // tunable calibration
static constexpr float ACS_SENSITIVITY_V_PER_A = 0.100f;               // 100 mV/A for 20A variant

// Sampling
static constexpr uint32_t SAMPLE_INTERVAL_MS = 1000;

// Early warning thresholds
static constexpr float TEMP_WARN_C = 45.0f;
static constexpr float CURRENT_WARN_A = 10.0f;
static constexpr float TEMP_RISE_WARN_C_PER_MIN = 4.0f;

// Weighted predictive risk model (0..100 target range)
// Tune these live during demo if needed.
static constexpr float SCORE_W_TEMP = 0.45f;
static constexpr float SCORE_W_CURRENT = 0.35f;
static constexpr float SCORE_W_RISE = 0.20f;
static constexpr float SCORE_ALERT_THRESHOLD = 60.0f;

// Normalization reference points for scoring
static constexpr float TEMP_SCORE_FULL_C = 60.0f;       // 100% temp risk by 60C
static constexpr float CURRENT_SCORE_FULL_A = 20.0f;    // 100% current risk by 20A
static constexpr float RISE_SCORE_FULL_C_PER_MIN = 8.0f;// 100% rise risk by 8 C/min
