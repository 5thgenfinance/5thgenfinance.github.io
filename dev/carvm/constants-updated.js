// Constants for Annuity Valuation Calculator
// Interest rates and assumptions for CARVM calculations

// INTEREST RATES - Statutory and regulatory rates
const INTEREST_RATES = {
    // Primary statutory valuation rate (NAIC Standard)
    valuation_rate: 0.035,        // 3.5% - Standard CARVM discount rate
    
    // Regulatory minimums
    statutory_minimum: 0.015,     // 1.5% - Minimum guaranteed rate
    
    // Stress testing scenarios
    scenarios: {
        stress_low: 0.01,         // 1.0% - Low interest stress test
        current_market: 0.045,    // 4.5% - Current market conditions
        high_rate: 0.06          // 6.0% - High interest scenario
    }
};

// MORTALITY ASSUMPTIONS - Simplified mortality rates by age and gender
const MORTALITY_RATES = {
    male: {
        45: 0.002, 46: 0.002, 47: 0.003, 48: 0.003, 49: 0.004,
        50: 0.004, 51: 0.005, 52: 0.005, 53: 0.006, 54: 0.007,
        55: 0.008, 56: 0.009, 57: 0.010, 58: 0.011, 59: 0.012,
        60: 0.014, 61: 0.015, 62: 0.017, 63: 0.019, 64: 0.021,
        65: 0.023, 66: 0.026, 67: 0.028, 68: 0.031, 69: 0.035,
        70: 0.038, 71: 0.042, 72: 0.047, 73: 0.052, 74: 0.058,
        75: 0.064, 76: 0.071, 77: 0.079, 78: 0.088, 79: 0.098,
        80: 0.109, 81: 0.121, 82: 0.135, 83: 0.150, 84: 0.167
    },
    female: {
        45: 0.001, 46: 0.001, 47: 0.002, 48: 0.002, 49: 0.002,
        50: 0.003, 51: 0.003, 52: 0.003, 53: 0.004, 54: 0.004,
        55: 0.005, 56: 0.006, 57: 0.006, 58: 0.007, 59: 0.008,
        60: 0.009, 61: 0.010, 62: 0.011, 63: 0.012, 64: 0.014,
        65: 0.015, 66: 0.017, 67: 0.019, 68: 0.021, 69: 0.023,
        70: 0.026, 71: 0.029, 72: 0.032, 73: 0.036, 74: 0.040,
        75: 0.045, 76: 0.050, 77: 0.056, 78: 0.063, 79: 0.071,
        80: 0.080, 81: 0.090, 82: 0.101, 83: 0.114, 84: 0.128
    },
    unisex: {
        45: 0.0015, 46: 0.0015, 47: 0.0025, 48: 0.0025, 49: 0.003,
        50: 0.0035, 51: 0.004, 52: 0.004, 53: 0.005, 54: 0.0055,
        55: 0.0065, 56: 0.0075, 57: 0.008, 58: 0.009, 59: 0.010,
        60: 0.0115, 61: 0.0125, 62: 0.014, 63: 0.0155, 64: 0.0175,
        65: 0.019, 66: 0.0215, 67: 0.0235, 68: 0.026, 69: 0.029,
        70: 0.032, 71: 0.0355, 72: 0.0395, 73: 0.044, 74: 0.049,
        75: 0.0545, 76: 0.0605, 77: 0.0675, 78: 0.0755, 79: 0.0845,
        80: 0.0945, 81: 0.1055, 82: 0.118, 83: 0.132, 84: 0.1475
    }
};

// LAPSE RATE ASSUMPTIONS - Annual lapse rates by product type and policy year
const LAPSE_RATES = {
    'fixedDeferred': {
        1: 0.15,    // 15% in year 1
        2: 0.12,    // 12% in year 2
        3: 0.10,    // 10% in year 3
        4: 0.08,    // 8% in year 4
        5: 0.07,    // 7% in year 5
        6: 0.06,    // 6% in year 6
        7: 0.05,    // 5% in year 7
        ultimate: 0.04  // 4% thereafter
    },
    'fixedImmediate': {
        ultimate: 0.02  // 2% per year (annuitization lapses)
    },
    'variableDeferred': {
        1: 0.18,    // 18% in year 1
        2: 0.14,    // 14% in year 2
        3: 0.12,    // 12% in year 3
        4: 0.10,    // 10% in year 4
        5: 0.08,    // 8% in year 5
        6: 0.07,    // 7% in year 6
        7: 0.06,    // 6% in year 7
        ultimate: 0.05  // 5% thereafter
    },
    'indexedDeferred': {
        1: 0.16,    // 16% in year 1
        2: 0.13,    // 13% in year 2
        3: 0.11,    // 11% in year 3
        4: 0.09,    // 9% in year 4
        5: 0.08,    // 8% in year 5
        6: 0.07,    // 7% in year 6
        7: 0.06,    // 6% in year 7
        ultimate: 0.05  // 5% thereafter
    }
};

// SURRENDER CHARGE SCHEDULES - By year as percentage of account value
const SURRENDER_CHARGES = {
    standard_7_year: {
        1: 0.07,    // 7% in year 1
        2: 0.06,    // 6% in year 2
        3: 0.05,    // 5% in year 3
        4: 0.04,    // 4% in year 4
        5: 0.03,    // 3% in year 5
        6: 0.02,    // 2% in year 6
        7: 0.01,    // 1% in year 7
        ultimate: 0.00  // 0% after year 7
    },
    standard_10_year: {
        1: 0.10,    // 10% in year 1
        2: 0.09,    // 9% in year 2
        3: 0.08,    // 8% in year 3
        4: 0.07,    // 7% in year 4
        5: 0.06,    // 6% in year 5
        6: 0.05,    // 5% in year 6
        7: 0.04,    // 4% in year 7
        8: 0.03,    // 3% in year 8
        9: 0.02,    // 2% in year 9
        10: 0.01,   // 1% in year 10
        ultimate: 0.00  // 0% after year 10
    }
};

// UTILITY FUNCTIONS FOR ACTUARIAL CALCULATIONS

/**
 * Get mortality rate for specific age and gender
 * @param {number} age - Age at which to get mortality rate
 * @param {string} gender - 'male', 'female', or 'unisex'
 * @returns {number} Annual mortality rate (0-1)
 */
function getMortalityRate(age, gender) {
    const genderKey = gender.toLowerCase();
    const rates = MORTALITY_RATES[genderKey] || MORTALITY_RATES.unisex;
    
    // Return rate for age, or extrapolate for extreme ages
    if (age < 45) {
        return rates[45] * 0.5; // Lower rate for younger ages
    } else if (age > 84) {
        return Math.min(0.25, rates[84] * 1.2); // Cap at 25% for very old ages
    } else {
        return rates[age] || rates[Math.floor(age)] || 0.05; // Default 5% if missing
    }
}

/**
 * Calculate survival probability to a given year
 * @param {number} startAge - Starting age
 * @param {string} gender - 'male', 'female', or 'unisex'
 * @param {number} years - Number of years to survive
 * @returns {number} Probability of survival (0-1)
 */
function getSurvivalProbability(startAge, gender, years) {
    let survivalProb = 1.0;
    
    for (let t = 0; t < years; t++) {
        const currentAge = startAge + t;
        const mortalityRate = getMortalityRate(currentAge, gender);
        survivalProb *= (1 - mortalityRate);
    }
    
    return Math.max(0, survivalProb);
}

/**
 * Get lapse rate for specific product type and policy year
 * @param {string} productType - Product type identifier
 * @param {number} year - Policy year
 * @returns {number} Annual lapse rate (0-1)
 */
function getLapseRate(productType, year) {
    const rates = LAPSE_RATES[productType] || LAPSE_RATES.fixedDeferred;
    
    if (year <= 7 && rates[year]) {
        return rates[year];
    } else {
        return rates.ultimate || 0.04; // Default 4% ultimate lapse rate
    }
}

/**
 * Get surrender charge for specific year
 * @param {number} year - Policy year
 * @param {number} surrenderYears - Number of surrender charge years (7 or 10 typical)
 * @returns {number} Surrender charge rate (0-1)
 */
function getSurrenderCharge(year, surrenderYears) {
    const scheduleKey = surrenderYears <= 7 ? 'standard_7_year' : 'standard_10_year';
    const schedule = SURRENDER_CHARGES[scheduleKey];
    
    if (year <= surrenderYears && schedule[year]) {
        return schedule[year];
    } else {
        return schedule.ultimate || 0.00;
    }
}

// FORMATTING UTILITY FUNCTIONS

/**
 * Format number as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format number as percentage
 * @param {number} rate - Rate to format (as decimal, e.g., 0.035 for 3.5%)
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} Formatted percentage string
 */
function formatPercentage(rate, decimals = 2) {
    if (typeof rate !== 'number' || isNaN(rate)) {
        return '0.00%';
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(rate);
}

/**
 * Format large numbers with appropriate suffixes
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatLargeNumber(num) {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }
    
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toFixed(0);
    }
}

// VALIDATION FUNCTIONS

/**
 * Validate that a value is a positive number
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of field for error messages
 * @returns {number} Validated number
 * @throws {Error} If validation fails
 */
function validatePositiveNumber(value, fieldName) {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        throw new Error(`${fieldName} must be a positive number`);
    }
    return num;
}

/**
 * Validate that a value is within a specified range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Name of field for error messages
 * @returns {number} Validated number
 * @throws {Error} If validation fails
 */
function validateRange(value, min, max, fieldName) {
    if (value < min || value > max) {
        throw new Error(`${fieldName} must be between ${min} and ${max}`);
    }
    return value;
}

// Export constants for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INTEREST_RATES,
        MORTALITY_RATES,
        LAPSE_RATES,
        SURRENDER_CHARGES,
        getMortalityRate,
        getSurvivalProbability,
        getLapseRate,
        getSurrenderCharge,
        formatCurrency,
        formatPercentage,
        formatLargeNumber,
        validatePositiveNumber,
        validateRange
    };
}