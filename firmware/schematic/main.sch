{
  "version": 1,
  "symbols": [
    {
      "id": "VUSB",
      "type": "vsource-dc",
      "ref": "VUSB",
      "x": 75,
      "y": 58,
      "rotation": 0,
      "value": "5",
      "mirror": false
    },
    {
      "id": "VPACK",
      "type": "vsource-dc",
      "ref": "VPACK",
      "x": 75,
      "y": 115,
      "rotation": 0,
      "value": "24",
      "mirror": false
    },
    {
      "id": "U_MCU",
      "type": "reg:esp32-devkit-v1",
      "ref": "U_MCU",
      "x": 34,
      "y": 140,
      "rotation": 0,
      "mirror": false
    },
    {
      "id": "U_ACS",
      "type": "cat:Sensor_Current/ACS712xLCTR-20A",
      "ref": "U_ACS",
      "x": 75,
      "y": 223,
      "rotation": 0,
      "mirror": false
    },
    {
      "id": "C_ACS",
      "type": "capacitor",
      "ref": "C_ACS",
      "x": 75,
      "y": 20,
      "rotation": 0,
      "value": "100n",
      "mirror": false
    },
    {
      "id": "R_ACS_TOP",
      "type": "resistor",
      "ref": "R_ACS_TOP",
      "x": 109,
      "y": 233,
      "rotation": 0,
      "value": "10k",
      "mirror": false
    },
    {
      "id": "R_ACS_BOT",
      "type": "resistor",
      "ref": "R_ACS_BOT",
      "x": 75,
      "y": 181,
      "rotation": 0,
      "value": "22k",
      "mirror": false
    },
    {
      "id": "R_VDIV_TOP",
      "type": "resistor",
      "ref": "R_VDIV_TOP",
      "x": 109,
      "y": 115,
      "rotation": 0,
      "value": "68k",
      "mirror": false
    },
    {
      "id": "R_VDIV_BOT",
      "type": "resistor",
      "ref": "R_VDIV_BOT",
      "x": 75,
      "y": 200,
      "rotation": 0,
      "value": "10k",
      "mirror": false
    },
    {
      "id": "U_DS18",
      "type": "cat:Sensor_Temperature/DS18B20",
      "ref": "U_DS18",
      "x": 75,
      "y": 139,
      "rotation": 0,
      "mirror": false
    },
    {
      "id": "R_OW_PULL",
      "type": "resistor",
      "ref": "R_OW_PULL",
      "x": 75,
      "y": 96,
      "rotation": 0,
      "value": "4.7k",
      "mirror": false
    },
    {
      "id": "C_DS18",
      "type": "capacitor",
      "ref": "C_DS18",
      "x": 75,
      "y": 77,
      "rotation": 0,
      "value": "100n",
      "mirror": false
    },
    {
      "id": "R_LED",
      "type": "resistor",
      "ref": "R_LED",
      "x": 75,
      "y": 162,
      "rotation": 0,
      "value": "130",
      "mirror": false
    },
    {
      "id": "D_ALERT",
      "type": "led",
      "ref": "D_ALERT",
      "x": 109,
      "y": 74,
      "rotation": 0,
      "mirror": false
    },
    {
      "id": "R_BUZ",
      "type": "resistor",
      "ref": "R_BUZ",
      "x": 75,
      "y": 39,
      "rotation": 0,
      "value": "100",
      "mirror": false
    },
    {
      "id": "BZ_ALERT",
      "type": "buzzer",
      "ref": "BZ_ALERT",
      "x": 109,
      "y": 55,
      "rotation": 0,
      "mirror": false
    }
  ],
  "wires": [
    {
      "id": "w_0",
      "points": [
        {
          "x": 28,
          "y": 126
        },
        {
          "x": 12,
          "y": 126
        },
        {
          "x": 12,
          "y": 50
        },
        {
          "x": 75,
          "y": 50
        },
        {
          "x": 75,
          "y": 55
        }
      ],
      "net": "VBUS"
    },
    {
      "id": "w_1",
      "points": [
        {
          "x": 28,
          "y": 126
        },
        {
          "x": 12,
          "y": 126
        },
        {
          "x": 12,
          "y": 211
        },
        {
          "x": 75,
          "y": 211
        },
        {
          "x": 75,
          "y": 216
        }
      ],
      "net": "VBUS"
    },
    {
      "id": "w_2",
      "points": [
        {
          "x": 28,
          "y": 126
        },
        {
          "x": 12,
          "y": 126
        },
        {
          "x": 12,
          "y": 12
        },
        {
          "x": 75,
          "y": 12
        },
        {
          "x": 75,
          "y": 17
        }
      ],
      "net": "VBUS"
    },
    {
      "id": "w_3",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 66
        },
        {
          "x": 75,
          "y": 66
        },
        {
          "x": 75,
          "y": 61
        }
      ],
      "net": "0"
    },
    {
      "id": "w_4",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 123
        },
        {
          "x": 75,
          "y": 123
        },
        {
          "x": 75,
          "y": 118
        }
      ],
      "net": "0"
    },
    {
      "id": "w_5",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 235
        },
        {
          "x": 75,
          "y": 235
        },
        {
          "x": 75,
          "y": 230
        }
      ],
      "net": "0"
    },
    {
      "id": "w_6",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 28
        },
        {
          "x": 75,
          "y": 28
        },
        {
          "x": 75,
          "y": 23
        }
      ],
      "net": "0"
    },
    {
      "id": "w_7",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 189
        },
        {
          "x": 75,
          "y": 189
        },
        {
          "x": 75,
          "y": 184
        }
      ],
      "net": "0"
    },
    {
      "id": "w_8",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 208
        },
        {
          "x": 75,
          "y": 208
        },
        {
          "x": 75,
          "y": 203
        }
      ],
      "net": "0"
    },
    {
      "id": "w_9",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 148
        },
        {
          "x": 75,
          "y": 148
        },
        {
          "x": 75,
          "y": 143
        }
      ],
      "net": "0"
    },
    {
      "id": "w_10",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 85
        },
        {
          "x": 75,
          "y": 85
        },
        {
          "x": 75,
          "y": 80
        }
      ],
      "net": "0"
    },
    {
      "id": "w_11",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 129
        },
        {
          "x": 91,
          "y": 129
        },
        {
          "x": 91,
          "y": 104
        },
        {
          "x": 109,
          "y": 104
        },
        {
          "x": 109,
          "y": 77
        }
      ],
      "net": "0"
    },
    {
      "id": "w_12",
      "points": [
        {
          "x": 40,
          "y": 128
        },
        {
          "x": 56,
          "y": 128
        },
        {
          "x": 56,
          "y": 129
        },
        {
          "x": 91,
          "y": 129
        },
        {
          "x": 91,
          "y": 63
        },
        {
          "x": 109,
          "y": 63
        },
        {
          "x": 109,
          "y": 58
        }
      ],
      "net": "0"
    },
    {
      "id": "w_13",
      "points": [
        {
          "x": 75,
          "y": 112
        },
        {
          "x": 75,
          "y": 107
        },
        {
          "x": 109,
          "y": 107
        },
        {
          "x": 109,
          "y": 112
        }
      ],
      "net": "VPACK_RAW"
    },
    {
      "id": "w_f304d919",
      "points": [
        {
          "x": 28,
          "y": 138
        },
        {
          "x": 18,
          "y": 138
        },
        {
          "x": 18,
          "y": 31
        },
        {
          "x": 63,
          "y": 31
        }
      ],
      "net": "BUZZ_CTRL"
    },
    {
      "id": "w_f6256559",
      "points": [
        {
          "x": 63,
          "y": 31
        },
        {
          "x": 75,
          "y": 31
        },
        {
          "x": 75,
          "y": 36
        }
      ],
      "net": "BUZZ_CTRL"
    },
    {
      "id": "w_15",
      "points": [
        {
          "x": 28,
          "y": 146
        },
        {
          "x": 15,
          "y": 146
        },
        {
          "x": 15,
          "y": 238
        },
        {
          "x": 97,
          "y": 238
        },
        {
          "x": 97,
          "y": 123
        },
        {
          "x": 109,
          "y": 123
        },
        {
          "x": 109,
          "y": 118
        }
      ],
      "net": "V_PACK_ADC"
    },
    {
      "id": "w_16",
      "points": [
        {
          "x": 28,
          "y": 146
        },
        {
          "x": 15,
          "y": 146
        },
        {
          "x": 15,
          "y": 192
        },
        {
          "x": 75,
          "y": 192
        },
        {
          "x": 75,
          "y": 197
        }
      ],
      "net": "V_PACK_ADC"
    },
    {
      "id": "w_17",
      "points": [
        {
          "x": 28,
          "y": 148
        },
        {
          "x": 18,
          "y": 148
        },
        {
          "x": 18,
          "y": 242
        },
        {
          "x": 109,
          "y": 242
        },
        {
          "x": 109,
          "y": 236
        }
      ],
      "net": "I_SENSE"
    },
    {
      "id": "w_18",
      "points": [
        {
          "x": 28,
          "y": 148
        },
        {
          "x": 18,
          "y": 148
        },
        {
          "x": 18,
          "y": 173
        },
        {
          "x": 75,
          "y": 173
        },
        {
          "x": 75,
          "y": 178
        }
      ],
      "net": "I_SENSE"
    },
    {
      "id": "w_19",
      "points": [
        {
          "x": 40,
          "y": 126
        },
        {
          "x": 75,
          "y": 126
        },
        {
          "x": 75,
          "y": 135
        }
      ],
      "net": "V3P3"
    },
    {
      "id": "w_20",
      "points": [
        {
          "x": 40,
          "y": 126
        },
        {
          "x": 59,
          "y": 126
        },
        {
          "x": 59,
          "y": 104
        },
        {
          "x": 75,
          "y": 104
        },
        {
          "x": 75,
          "y": 99
        }
      ],
      "net": "V3P3"
    },
    {
      "id": "w_21",
      "points": [
        {
          "x": 40,
          "y": 126
        },
        {
          "x": 59,
          "y": 126
        },
        {
          "x": 59,
          "y": 69
        },
        {
          "x": 75,
          "y": 69
        },
        {
          "x": 75,
          "y": 74
        }
      ],
      "net": "V3P3"
    },
    {
      "id": "w_22",
      "points": [
        {
          "x": 40,
          "y": 134
        },
        {
          "x": 53,
          "y": 134
        },
        {
          "x": 53,
          "y": 151
        },
        {
          "x": 91,
          "y": 151
        },
        {
          "x": 91,
          "y": 139
        },
        {
          "x": 81,
          "y": 139
        }
      ],
      "net": "ONEWIRE"
    },
    {
      "id": "w_23",
      "points": [
        {
          "x": 40,
          "y": 134
        },
        {
          "x": 53,
          "y": 134
        },
        {
          "x": 53,
          "y": 88
        },
        {
          "x": 75,
          "y": 88
        },
        {
          "x": 75,
          "y": 93
        }
      ],
      "net": "ONEWIRE"
    },
    {
      "id": "w_24",
      "points": [
        {
          "x": 40,
          "y": 146
        },
        {
          "x": 50,
          "y": 146
        },
        {
          "x": 50,
          "y": 154
        },
        {
          "x": 75,
          "y": 154
        },
        {
          "x": 75,
          "y": 159
        }
      ],
      "net": "LED_CTRL"
    },
    {
      "id": "w_25",
      "points": [
        {
          "x": 81,
          "y": 225
        },
        {
          "x": 109,
          "y": 225
        },
        {
          "x": 109,
          "y": 230
        }
      ],
      "net": "ACS_OUT"
    },
    {
      "id": "w_26",
      "points": [
        {
          "x": 75,
          "y": 165
        },
        {
          "x": 75,
          "y": 170
        },
        {
          "x": 94,
          "y": 170
        },
        {
          "x": 94,
          "y": 66
        },
        {
          "x": 109,
          "y": 66
        },
        {
          "x": 109,
          "y": 71
        }
      ],
      "net": "LED_AN"
    },
    {
      "id": "w_27",
      "points": [
        {
          "x": 75,
          "y": 42
        },
        {
          "x": 75,
          "y": 47
        },
        {
          "x": 109,
          "y": 47
        },
        {
          "x": 109,
          "y": 52
        }
      ],
      "net": "BUZ_P"
    }
  ],
  "netLabels": [
    {
      "id": "nl_VBUS",
      "name": "VBUS",
      "x": 28,
      "y": 126,
      "owner": "U_MCU",
      "anchor": "end"
    },
    {
      "id": "nl_0",
      "name": "GND",
      "x": 40,
      "y": 128,
      "owner": "U_MCU",
      "anchor": "start"
    },
    {
      "id": "nl_VPACK_RAW",
      "name": "VPACK_RAW",
      "x": 75,
      "y": 112,
      "owner": "VPACK",
      "anchor": "start"
    },
    {
      "id": "nl_BUZZ_CTRL",
      "name": "BUZZ_CTRL",
      "x": 28,
      "y": 138,
      "owner": "U_MCU",
      "anchor": "end"
    },
    {
      "id": "nl_V_PACK_ADC",
      "name": "V_PACK_ADC",
      "x": 28,
      "y": 146,
      "owner": "U_MCU",
      "anchor": "end"
    },
    {
      "id": "nl_I_SENSE",
      "name": "I_SENSE",
      "x": 28,
      "y": 148,
      "owner": "U_MCU",
      "anchor": "end"
    },
    {
      "id": "nl_V3P3",
      "name": "V3P3",
      "x": 40,
      "y": 126,
      "owner": "U_MCU",
      "anchor": "start"
    },
    {
      "id": "nl_ONEWIRE",
      "name": "ONEWIRE",
      "x": 40,
      "y": 134,
      "owner": "U_MCU",
      "anchor": "start"
    },
    {
      "id": "nl_LED_CTRL",
      "name": "LED_CTRL",
      "x": 40,
      "y": 146,
      "owner": "U_MCU",
      "anchor": "start"
    },
    {
      "id": "nl_ACS_OUT",
      "name": "ACS_OUT",
      "x": 81,
      "y": 225,
      "owner": "U_ACS",
      "anchor": "start"
    },
    {
      "id": "nl_LED_AN",
      "name": "LED_AN",
      "x": 75,
      "y": 165,
      "owner": "R_LED",
      "anchor": "end"
    },
    {
      "id": "nl_BUZ_P",
      "name": "BUZ_P",
      "x": 75,
      "y": 42,
      "owner": "R_BUZ",
      "anchor": "end"
    }
  ],
  "junctions": [
    {
      "id": "j_28_126",
      "x": 28,
      "y": 126
    },
    {
      "id": "j_12_126",
      "x": 12,
      "y": 126
    },
    {
      "id": "j_12_50",
      "x": 12,
      "y": 50
    },
    {
      "id": "j_40_128",
      "x": 40,
      "y": 128
    },
    {
      "id": "j_56_128",
      "x": 56,
      "y": 128
    },
    {
      "id": "j_56_66",
      "x": 56,
      "y": 66
    },
    {
      "id": "j_56_123",
      "x": 56,
      "y": 123
    },
    {
      "id": "j_56_189",
      "x": 56,
      "y": 189
    },
    {
      "id": "j_56_208",
      "x": 56,
      "y": 208
    },
    {
      "id": "j_56_148",
      "x": 56,
      "y": 148
    },
    {
      "id": "j_56_85",
      "x": 56,
      "y": 85
    },
    {
      "id": "j_56_129",
      "x": 56,
      "y": 129
    },
    {
      "id": "j_91_129",
      "x": 91,
      "y": 129
    },
    {
      "id": "j_91_104",
      "x": 91,
      "y": 104
    },
    {
      "id": "j_15_146",
      "x": 15,
      "y": 146
    },
    {
      "id": "j_15_192",
      "x": 15,
      "y": 192
    },
    {
      "id": "j_18_148",
      "x": 18,
      "y": 148
    },
    {
      "id": "j_18_173",
      "x": 18,
      "y": 173
    },
    {
      "id": "j_40_126",
      "x": 40,
      "y": 126
    },
    {
      "id": "j_59_126",
      "x": 59,
      "y": 126
    },
    {
      "id": "j_59_104",
      "x": 59,
      "y": 104
    },
    {
      "id": "j_53_134",
      "x": 53,
      "y": 134
    }
  ],
  "probes": [],
  "directives": [
    "; ACS712 current path pins IP+ / IP- are physical high-current terminals; VIOUT path is wired to ESP32 ADC"
  ],
  "analysis": {
    "type": "op"
  }
}