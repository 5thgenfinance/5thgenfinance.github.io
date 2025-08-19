// Standard Mortality Tables and Interest Rates for Annuity Valuation
// Based on common industry standards for demonstration purposes

// 2012 Individual Annuity Mortality Table (simplified version)
const MORTALITY_TABLES = {
    // Mortality rates by age and gender (per 1000)
    male: {
        20: 0.00054, 21: 0.00058, 22: 0.00062, 23: 0.00067, 24: 0.00072,
        25: 0.00077, 26: 0.00082, 27: 0.00088, 28: 0.00094, 29: 0.00101,
        30: 0.00108, 31: 0.00116, 32: 0.00124, 33: 0.00133, 34: 0.00142,
        35: 0.00152, 36: 0.00163, 37: 0.00175, 38: 0.00187, 39: 0.00201,
        40: 0.00215, 41: 0.00231, 42: 0.00248, 43: 0.00266, 44: 0.00285,
        45: 0.00306, 46: 0.00329, 47: 0.00354, 48: 0.00381, 49: 0.00410,
        50: 0.00441, 51: 0.00475, 52: 0.00512, 53: 0.00552, 54: 0.00595,
        55: 0.00642, 56: 0.00693, 57: 0.00748, 58: 0.00808, 59: 0.00873,
        60: 0.00943, 61: 0.01019, 62: 0.01102, 63: 0.01192, 64: 0.01290,
        65: 0.01396, 66: 0.01512, 67: 0.01638, 68: 0.01775, 69: 0.01924,
        70: 0.02086, 71: 0.02262, 72: 0.02453, 73: 0.02661, 74: 0.02886,
        75: 0.03131, 76: 0.03396, 77: 0.03684, 78: 0.03996, 79: 0.04334,
        80: 0.04700, 81: 0.05097, 82: 0.05527, 83: 0.05992, 84: 0.06495,
        85: 0.07039, 86: 0.07626, 87: 0.08260, 88: 0.08943, 89: 0.09679,
        90: 0.10472, 91: 0.11326, 92: 0.12245, 93: 0.13233, 94: 0.14295,
        95: 0.15436, 96: 0.16661, 97: 0.17975, 98: 0.19384, 99: 0.20894,
        100: 0.22512, 101: 0.24244, 102: 0.26097, 103: 0.28078, 104: 0.30194,
        105: 0.32454, 106: 0.34866, 107: 0.37438, 108: 0.40180, 109: 0.43101,
        110: 1.00000
    },

    female: {
        20: 0.00037, 21: 0.00040, 22: 0.00043, 23: 0.00046, 24: 0.00049,
        25: 0.00053, 26: 0.00056, 27: 0.00060, 28: 0.00065, 29: 0.00069,
        30: 0.00074, 31: 0.00080, 32: 0.00086, 33: 0.00092, 34: 0.00099,
        35: 0.00106, 36: 0.00114, 37: 0.00123, 38: 0.00132, 39: 0.00142,
        40: 0.00153, 41: 0.00165, 42: 0.00178, 43: 0.00192, 44: 0.00207,
        45: 0.00224, 46: 0.00242, 47: 0.00262, 48: 0.00284, 49: 0.00308,
        50: 0.00334, 51: 0.00363, 52: 0.00394, 53: 0.00428, 54: 0.00465,
        55: 0.00506, 56: 0.00550, 57: 0.00598, 58: 0.00651, 59: 0.00708,
        60: 0.00771, 61: 0.00840, 62: 0.00915, 63: 0.00998, 64: 0.01088,
        65: 0.01187, 66: 0.01296, 67: 0.01415, 68: 0.01546, 69: 0.01689,
        70: 0.01846, 71: 0.02018, 72: 0.02206, 73: 0.02412, 74: 0.02637,
        75: 0.02884, 76: 0.03153, 77: 0.03447, 78: 0.03767, 79: 0.04116,
        80: 0.04496, 81: 0.04909, 82: 0.05358, 83: 0.05845, 84: 0.06374,
        85: 0.06948, 86: 0.07569, 87: 0.08241, 88: 0.08968, 89: 0.09753,
        90: 0.10601, 91: 0.11516, 92: 0.12503, 93: 0.13566, 94: 0.14711,
        95: 0.15943, 96: 0.17268, 97: 0.18691, 98: 0.20218, 99: 0.21856,
        100: 0.23611, 101: 0.25491, 102: 0.27502, 103: 0.29653, 104: 0.31951,
        105: 0.34405, 106: 0.37024, 107: 0.39818, 108: 0.42797, 109: 0.45971,
        110: 1.00000
    },

    unisex: {} // Will be calculated as blend of male/female
};

// Calculate unisex rates as 50/50 blend
for (let age = 20; age <= 110; age++) {
    MORTALITY_TABLES.unisex[age] = (MORTALITY_TABLES.male[age] + MORTALITY_TABLES.female[age]) / 2;
}

// Standard Interest Rates for Different Scenarios
const INTEREST_RATES = {
    // Current regulatory rates
    statutory_minimum: 0.015,  // 1.5% minimum guaranteed
    valuation_rate: 0.035,     // 3.5% standard valuation rate

    // Scenario rates for testing
    scenarios: {
        guaranteed_minimum: 0.015,  // 1.5%
        current_rate: 0.035,        // 3.5%
        stress_low: 0.01,           // 1.0% stress scenario
        stress_high: 0.06,          // 6.0% stress scenario
        historical_average: 0.045   // 4.5% long-term average
    }
};

// Standard Lapse Rates by Product Type and Duration
const LAPSE_RATES = {
    "fixed-deferred": {
        1: 0.08,  2: 0.12, 3: 0.15, 4: 0.15, 5: 0.12,
        6: 0.10,  7: 0.08, 8: 0.06, 9: 0.05, 10: 0.04,
        default: 0.03 // After year 10
    },

    "fixed-immediate": {
        // Lower lapse rates for immediate annuities
        1: 0.02, 2: 0.02, 3: 0.02, 4: 0.02, 5: 0.02,
        default: 0.02
    },

    "variable-deferred": {
        1: 0.10, 2: 0.15, 3: 0.18, 4: 0.18, 5: 0.15,
        6: 0.12, 7: 0.10, 8: 0.08, 9: 0.06, 10: 0.05,
        default: 0.04
    },

    "indexed-deferred": {
        1: 0.09, 2: 0.13, 3: 0.16, 4: 0.16, 5: 0.13,
        6: 0.11, 7: 0.09, 8: 0.07, 9: 0.05, 10: 0.04,
        default: 0.03
    }
};

// Surrender Charge Schedules
const SURRENDER_CHARGES = {
    standard_7_year: [0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.00],
    standard_10_year: [0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.00],
    enhanced_7_year: [0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.00]
};

// Utility functions for mortality calculations
function getMortalityRate(age, gender) {
    if (age < 20) age = 20;
    if (age > 110) age = 110;

    return MORTALITY_TABLES[gender][age] || MORTALITY_TABLES[gender][110];
}

function getSurvivalProbability(age, gender, years) {
    let survivalProb = 1.0;
    for (let i = 0; i < years; i++) {
        const currentAge = Math.min(age + i, 110);
        const mortalityRate = getMortalityRate(currentAge, gender);
        survivalProb *= (1 - mortalityRate);
    }
    return survivalProb;
}

function getLapseRate(productType, year) {
    const rates = LAPSE_RATES[productType];
    return rates[year] || rates.default;
}

function getSurrenderCharge(year, surrenderPeriod) {
    if (surrenderPeriod <= 7) {
        return SURRENDER_CHARGES.standard_7_year[year] || 0;
    } else if (surrenderPeriod <= 10) {
        return SURRENDER_CHARGES.standard_10_year[year] || 0;
    } else {
        return SURRENDER_CHARGES.enhanced_7_year[year] || 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MORTALITY_TABLES,
        INTEREST_RATES,
        LAPSE_RATES,
        SURRENDER_CHARGES,
        getMortalityRate,
        getSurvivalProbability,
        getLapseRate,
        getSurrenderCharge
    };
}