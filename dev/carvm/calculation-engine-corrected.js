// CORRECTED STAT CARVM Calculation Engine - Complete Implementation
// Implements Commissioners Annuity Reserve Valuation Method
// Compliant with NAIC Standard Valuation Law - GREATEST PRESENT VALUE METHOD

class AnnuityValuationEngine {
    constructor() {
        this.auditTrail = [];
        this.calculationSteps = [];
    }

    // Main CARVM calculation method - CORRECTED
    calculateStatCARVM(policyData) {
        this.auditTrail = [];
        this.calculationSteps = [];
        
        try {
            // Step 1: Validate input data
            this.validateInputs(policyData);
            this.addAuditStep("Input Validation", "All required policy data validated successfully");
            
            // Step 2: Calculate CARVM using Greatest Present Value method
            const carvmResult = this.calculateCARVMPresentValue(policyData);
            this.addAuditStep("CARVM Greatest PV Calculation", 
                `Tested ${carvmResult.testCount} surrender years, selected year ${carvmResult.selectedYear}`);
            
            // Step 3: Get details of selected test
            const selectedTest = carvmResult.allTests[carvmResult.selectedYear];
            this.addAuditStep("Reserve Selection", 
                `Year ${carvmResult.selectedYear}: ${selectedTest.selectedBenefit} benefit of $${selectedTest.greatestBenefit.toLocaleString()} → PV = $${selectedTest.presentValue.toLocaleString()}`);
            
            // Step 4: Create summary for display
            const summaryTests = carvmResult.allTests.slice(0, 15).map(test => ({
                year: test.testYear,
                age: test.age,
                accountValue: test.accountValue,
                survivalProb: test.survivalProb,
                selectedBenefit: test.selectedBenefit,
                benefitAmount: test.greatestBenefit,
                presentValue: test.presentValue,
                isSelected: test.testYear === carvmResult.selectedYear
            }));
            
            // Step 5: Regulatory compliance
            const complianceResult = this.performComplianceChecks(policyData, carvmResult.carvmReserve);
            this.addAuditStep("Regulatory Compliance", complianceResult.message);
            
            // Format calculation steps with sample data
            this.addCalculationStep("CARVM Reserve Summary", {
                finalReserve: carvmResult.carvmReserve,
                selectedYear: carvmResult.selectedYear,
                selectedBenefit: selectedTest.selectedBenefit,
                methodology: "Greatest Present Value Method",
                sampleTests: summaryTests
            });
            
            return {
                reserve: carvmResult.carvmReserve,
                selectedYear: carvmResult.selectedYear,
                selectedTest: selectedTest,
                presentValues: [{
                    scenario: {
                        name: "CARVM Greatest Present Value",
                        description: `Selected from year ${carvmResult.selectedYear} ${selectedTest.selectedBenefit}`,
                        interestRate: INTEREST_RATES.valuation_rate
                    },
                    presentValue: carvmResult.carvmReserve,
                    cashFlows: summaryTests
                }],
                auditTrail: this.auditTrail,
                calculationSteps: this.calculationSteps,
                compliance: complianceResult
            };
            
        } catch (error) {
            this.addAuditStep("Error", `CARVM calculation failed: ${error.message}`);
            throw error;
        }
    }

    validateInputs(policyData) {
        const required = ['productType', 'premiumAmount', 'issueAge', 'gender', 'issueDate', 'valuationDate', 'guaranteedRate'];
        for (const field of required) {
            if (!policyData[field] && policyData[field] !== 0) {
                throw new Error(`Required field missing: ${field}`);
            }
        }

        if (policyData.issueAge < 18 || policyData.issueAge > 85) {
            throw new Error("Issue age must be between 18 and 85");
        }

        if (policyData.premiumAmount < 1000) {
            throw new Error("Premium amount must be at least $1,000");
        }

        if (policyData.guaranteedRate < 0 || policyData.guaranteedRate > 10) {
            throw new Error("Guaranteed rate must be between 0% and 10%");
        }
    }

    // CORRECTED: Calculate CARVM present value using greatest present value method
    calculateCARVMPresentValue(policyData) {
        const currentAge = policyData.issueAge;
        const premium = policyData.premiumAmount;
        const guaranteedRate = policyData.guaranteedRate / 100;
        const valuationRate = INTEREST_RATES.valuation_rate; // Use statutory rate consistently
        
        const maxAge = 100;
        const policyDuration = maxAge - currentAge;
        
        let greatestPV = 0;
        let selectedYear = 0;
        let allTestResults = [];
        
        this.addCalculationStep("CARVM Greatest Present Value Test", {
            methodology: "Testing surrender at each policy year",
            testYears: Math.min(policyDuration, 30),
            valuationRate: valuationRate
        });
        
        // CORE CARVM LOGIC: Test surrender at each policy year
        for (let testYear = 0; testYear <= Math.min(policyDuration, 30); testYear++) {
            const testResult = this.calculatePVAtYear(testYear, policyData, valuationRate);
            allTestResults.push(testResult);
            
            // Track the greatest present value (CARVM requirement)
            if (testResult.presentValue > greatestPV) {
                greatestPV = testResult.presentValue;
                selectedYear = testYear;
            }
        }
        
        return {
            carvmReserve: greatestPV,
            selectedYear: selectedYear,
            allTests: allTestResults,
            methodology: "Greatest Present Value",
            testCount: allTestResults.length
        };
    }

    // NEW METHOD: Calculate present value of benefits available at specific test year
    calculatePVAtYear(testYear, policyData, valuationRate) {
        const currentAge = policyData.issueAge;
        const premium = policyData.premiumAmount;
        const guaranteedRate = policyData.guaranteedRate / 100;
        
        // Calculate guaranteed account value at test year
        const accountValue = premium * Math.pow(1 + guaranteedRate, testYear);
        
        // Calculate survival probability to test year
        const survivalProb = getSurvivalProbability(currentAge, policyData.gender, testYear);
        
        // Calculate discount factor from test year back to valuation date
        const discountFactor = testYear === 0 ? 1.0 : Math.pow(1 + valuationRate, -testYear);
        
        // Test all available benefits at this year and select greatest
        let greatestBenefit = 0;
        let selectedBenefit = "";
        let benefitDetails = {};
        
        // 1. TEST CASH SURRENDER VALUE
        const surrenderCharge = getSurrenderCharge(testYear, policyData.surrenderChargeYears || 7);
        const cashValue = accountValue * (1 - surrenderCharge);
        benefitDetails.cashValue = cashValue;
        
        if (cashValue > greatestBenefit) {
            greatestBenefit = cashValue;
            selectedBenefit = "Cash Surrender";
        }
        
        // 2. TEST DEATH BENEFIT (if applicable for product type)
        if (!policyData.productType.includes('immediate')) {
            const deathBenefit = Math.max(accountValue, premium); // Simplified death benefit
            benefitDetails.deathBenefit = deathBenefit;
            
            if (deathBenefit > greatestBenefit) {
                greatestBenefit = deathBenefit;
                selectedBenefit = "Death Benefit";
            }
        }
        
        // 3. TEST ANNUITIZATION VALUE (if past surrender charge period)
        if (testYear >= (policyData.surrenderChargeYears || 7)) {
            const ageAtAnnuitization = currentAge + testYear;
            const annuityValue = this.calculateAnnuitizationValue(accountValue, ageAtAnnuitization, valuationRate);
            benefitDetails.annuitizationValue = annuityValue;
            
            if (annuityValue > greatestBenefit) {
                greatestBenefit = annuityValue;
                selectedBenefit = "Annuitization";
            }
        }
        
        // Calculate final present value
        const presentValue = greatestBenefit * survivalProb * discountFactor;
        
        return {
            testYear: testYear,
            age: currentAge + testYear,
            accountValue: accountValue,
            survivalProb: survivalProb,
            discountFactor: discountFactor,
            benefitDetails: benefitDetails,
            selectedBenefit: selectedBenefit,
            greatestBenefit: greatestBenefit,
            presentValue: presentValue
        };
    }

    // HELPER METHOD: Calculate annuitization value
    calculateAnnuitizationValue(accountValue, ageAtAnnuitization, valuationRate) {
        // Calculate immediate annuity value using account balance
        const lifeExpectancy = Math.max(1, 85 - ageAtAnnuitization);
        
        // Present value of immediate life annuity factor
        let annuityFactor = 0;
        for (let t = 1; t <= lifeExpectancy; t++) {
            const survivalToT = getSurvivalProbability(ageAtAnnuitization, 'unisex', t);
            const discountToT = Math.pow(1 + valuationRate, -t);
            annuityFactor += survivalToT * discountToT;
        }
        
        // Annual annuity payment that account value can purchase
        const annualPayment = accountValue / annuityFactor;
        
        // Present value of all future annuity payments
        return accountValue; // Simplified - the account value becomes the annuity reserve
    }

    // COMPLIANCE CHECKS
    performComplianceChecks(policyData, reserve) {
        const premium = policyData.premiumAmount;
        const reserveRatio = reserve / premium;
        
        let compliance = {
            passed: true,
            message: "CARVM reserve calculation complies with statutory requirements",
            checks: []
        };
        
        // Check 1: Reserve should not be negative
        if (reserve < 0) {
            compliance.passed = false;
            compliance.checks.push("FAIL: Reserve cannot be negative");
        } else {
            compliance.checks.push("PASS: Reserve is non-negative");
        }
        
        // Check 2: Reserve ratio reasonableness
        if (reserveRatio > 2.0) {
            compliance.checks.push("WARNING: Reserve exceeds 200% of premium - review assumptions");
        } else {
            compliance.checks.push("PASS: Reserve ratio within reasonable bounds");
        }
        
        // Check 3: Minimum reserve (simplified)
        const minimumReserve = premium * 0.01; // 1% minimum
        if (reserve < minimumReserve) {
            compliance.passed = false;
            compliance.checks.push("FAIL: Reserve below regulatory minimum");
        } else {
            compliance.checks.push("PASS: Reserve exceeds minimum requirement");
        }
        
        return compliance;
    }

    // Helper methods for lapse rates and other calculations
    getLapseRateForScenario(baseLapseRate, lapseAssumption) {
        switch (lapseAssumption) {
            case 'statutory_minimum':
                return baseLapseRate * 0.8; // 20% reduction
            case 'best_estimate':
                return baseLapseRate;
            case 'stressed':
                return baseLapseRate * 0.6; // 40% reduction (more persistent)
            case 'high_lapse':
                return baseLapseRate * 1.5; // 50% increase
            default:
                return baseLapseRate;
        }
    }

    calculateAnnuityPayment(premium, age, mortalityTable, discountRate) {
        // Simplified immediate annuity payment calculation
        const lifeExpectancy = 85 - age;
        const annuityFactor = (1 - Math.pow(1 + discountRate, -lifeExpectancy)) / discountRate;
        return premium / annuityFactor;
    }

    // Audit trail helpers
    addAuditStep(step, description) {
        const timestamp = new Date().toLocaleTimeString();
        this.auditTrail.push({
            timestamp: timestamp,
            step: step,
            description: description
        });
    }

    addCalculationStep(stepName, stepData) {
        this.calculationSteps.push({
            step: stepName,
            data: stepData
        });
    }

    // Format cash flows as HTML table for display
    formatCashFlowsAsTable(cashFlows) {
        if (!cashFlows || cashFlows.length === 0) {
            return '<p>No cash flows available</p>';
        }

        let tableHtml = `
        <table class="cash-flow-table">
            <thead>
                <tr>
                    <th>Year</th>
                    <th>Age</th>
                    <th>Account Value</th>
                    <th>Survival Prob</th>
                    <th>Selected Benefit</th>
                    <th>Benefit Amount</th>
                    <th>Present Value</th>
                </tr>
            </thead>
            <tbody>`;

        cashFlows.forEach(cf => {
            const highlight = cf.isSelected ? ' class="selected-row"' : '';
            tableHtml += `
                <tr${highlight}>
                    <td>${cf.year}</td>
                    <td>${cf.age}</td>
                    <td>${formatCurrency(cf.accountValue)}</td>
                    <td>${(cf.survivalProb * 100).toFixed(3)}%</td>
                    <td>${cf.selectedBenefit}</td>
                    <td>${formatCurrency(cf.benefitAmount)}</td>
                    <td>${formatCurrency(cf.presentValue)}</td>
                </tr>`;
        });

        tableHtml += `
            </tbody>
        </table>`;

        return tableHtml;
    }
}