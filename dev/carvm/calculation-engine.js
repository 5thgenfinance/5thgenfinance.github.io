// calculation-engine.js
// STAT CARVM Calculation Engine - Fully Recalibrated with patched generateScenarios

// Import or assume available: INTEREST_RATES, getMortalityRate, getSurvivalProbability, getLapseRate, getSurrenderCharge, formatCurrency, formatPercentage

class AnnuityValuationEngine {
    constructor() {
        this.scenarios = [];
        this.presentValues = [];
        this.auditTrail = [];
        this.calculationSteps = [];
    }

    // Patched scenario generation ensuring distinct interest rates
    generateScenarios(policyData) {
        this.scenarios = [];

        // Scenario 1: Guaranteed Minimum Scenario
        this.scenarios.push({
            name: "Guaranteed Minimum",
            description: "Minimum guaranteed benefits with statutory minimum interest rate",
            interestRate: INTEREST_RATES.statutory_minimum, // 1.5%
            mortalityTable: policyData.gender,
            lapseAssumption: "statutory_minimum"
        });

        // Scenario 2: Current Assumptions
        this.scenarios.push({
            name: "Current Assumptions",
            description: "Best estimate assumptions",
            interestRate: INTEREST_RATES.valuation_rate, // 3.5%
            mortalityTable: policyData.gender,
            lapseAssumption: "best_estimate"
        });

        // Scenario 3: Stress Scenario - Low Interest
        this.scenarios.push({
            name: "Stress - Low Interest",
            description: "Stress test with low interest scenario",
            interestRate: INTEREST_RATES.scenarios.stress_low, // 1.0%
            mortalityTable: policyData.gender,
            lapseAssumption: "stressed"
        });

        // Scenario 4: Stress Scenario - High Lapse
        this.scenarios.push({
            name: "Stress - High Lapse",
            description: "Stress test with elevated lapse rates",
            interestRate: INTEREST_RATES.valuation_rate, // using valuation rate
            mortalityTable: policyData.gender,
            lapseAssumption: "high_lapse"
        });

        this.addCalculationStep("Scenario Generation", {
            totalScenarios: this.scenarios.length,
            scenarios: this.scenarios.map(s => ({ name: s.name, interestRate: s.interestRate }))
        });
    }

    // Main CARVM calculation orchestrator
    calculateStatCARVM(policyData) {
        this.auditTrail = [];
        this.calculationSteps = [];

        // 1. Validate inputs
        this.validateInputs(policyData);
        this.addAuditStep("Input Validation", "Inputs validated");

        // 2. Generate scenarios
        this.generateScenarios(policyData);
        this.addAuditStep("Scenario Generation Complete", `Generated ${this.scenarios.length} scenarios`);

        // 3. Compute present values
        this.calculatePresentValues(policyData);
        this.addAuditStep("Present Value Calculation", "Completed PV for all scenarios");

        // 4. Determine greatest present value
        const reserve = this.determineGreatestPresentValue();
        this.addAuditStep("CARVM Reserve", `Selected reserve: ${formatCurrency(reserve)}`);

        // 5. Compliance check
        const compliance = this.performComplianceChecks(policyData, reserve);
        this.addAuditStep("Compliance Check", compliance.message);

        return { reserve, scenarios: this.scenarios, presentValues: this.presentValues, calculationSteps: this.calculationSteps, auditTrail: this.auditTrail, compliance };
    }

    // ... existing methods: validateInputs, calculatePresentValues, calculateScenarioPresentValue, determineGreatestPresentValue, performComplianceChecks, addAuditStep, addCalculationStep etc.
}

// Export or attach global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnnuityValuationEngine;
}
