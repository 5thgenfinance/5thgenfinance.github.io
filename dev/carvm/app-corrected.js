// Updated Main Application Logic for Annuity Valuation Calculator
// Compatible with corrected CARVM calculation engine
// Updated to display CARVM Greatest Present Value results

class AnnuityCalculatorApp {
    constructor() {
        this.engine = new AnnuityValuationEngine();
        this.currentResults = null;
        this.initializeApp();
    }

    initializeApp() {
        // Set up event listeners
        document.getElementById('valuationForm').addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Set default dates
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        
        document.getElementById('valuationDate').value = today.toISOString().split('T')[0];
        document.getElementById('issueDate').value = oneYearAgo.toISOString().split('T')[0];
        
        // Update timestamp in footer
        document.getElementById('timestamp').textContent = today.toLocaleString();
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        try {
            // Show loading state
            this.showLoadingState();
            
            // Collect form data
            const policyData = this.collectFormData();
            
            // Perform validation
            this.validateFormData(policyData);
            
            // Calculate STAT CARVM
            setTimeout(() => {
                try {
                    this.currentResults = this.engine.calculateStatCARVM(policyData);
                    this.displayResults(policyData, this.currentResults);
                    this.hideLoadingState();
                } catch (error) {
                    this.showError('Calculation Error: ' + error.message);
                    this.hideLoadingState();
                }
            }, 100); // Small delay to show loading state
            
        } catch (error) {
            this.showError('Input Error: ' + error.message);
            this.hideLoadingState();
        }
    }

    collectFormData() {
        return {
            productType: document.getElementById('productType').value,
            premiumAmount: parseFloat(document.getElementById('premiumAmount').value),
            issueAge: parseInt(document.getElementById('issueAge').value),
            gender: document.getElementById('gender').value,
            issueDate: document.getElementById('issueDate').value,
            valuationDate: document.getElementById('valuationDate').value,
            guaranteedRate: parseFloat(document.getElementById('guaranteedRate').value),
            surrenderChargeYears: parseInt(document.getElementById('surrenderChargeYears').value)
        };
    }

    validateFormData(data) {
        // Additional client-side validation
        const issueDate = new Date(data.issueDate);
        const valuationDate = new Date(data.valuationDate);
        
        if (valuationDate <= issueDate) {
            throw new Error('Valuation date must be after issue date');
        }

        const daysDiff = (valuationDate - issueDate) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365 * 50) { // 50 years maximum
            throw new Error('Policy duration cannot exceed 50 years');
        }
    }

    displayResults(policyData, results) {
        // Display executive summary
        this.displayExecutiveSummary(policyData, results);
        
        // Display assumptions table
        this.displayAssumptionsTable(policyData, results);
        
        // Display calculation steps
        this.displayCalculationSteps(results);
        
        // Display CARVM test results (updated for greatest present value)
        this.displayCARVMResults(results);
        
        // Display reserve summary
        this.displayReserveSummary(results);
        
        // Display audit trail
        this.displayAuditTrail(results);
        
        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }

    displayExecutiveSummary(policyData, results) {
        const summaryHtml = `
            <div class="executive-summary">
                <h3>Executive Summary</h3>
                <div class="summary-metrics">
                    <div class="metric">
                        <span class="label">STAT CARVM Reserve:</span>
                        <span class="value">${formatCurrency(results.reserve)}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Product Type:</span>
                        <span class="value">${this.formatProductType(policyData.productType)}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Policy Premium:</span>
                        <span class="value">${formatCurrency(policyData.premiumAmount)}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Reserve as % of Premium:</span>
                        <span class="value">${((results.reserve / policyData.premiumAmount) * 100).toFixed(2)}%</span>
                    </div>
                    <div class="metric">
                        <span class="label">Selected Year:</span>
                        <span class="value">Year ${results.selectedYear}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Selected Benefit:</span>
                        <span class="value">${results.selectedTest.selectedBenefit}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Valuation Method:</span>
                        <span class="value">Greatest Present Value (CARVM)</span>
                    </div>
                </div>
            </div>`;
        
        document.getElementById('executiveSummary').innerHTML = summaryHtml;
    }

    displayAssumptionsTable(policyData, results) {
        const assumptionsHtml = `
            <div class="assumptions-section">
                <h3>Assumptions</h3>
                <p><strong>Regulatory Standard:</strong> NAIC Standard Valuation Law</p>
                
                <table class="assumptions-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Value</th>
                            <th>Source/Justification</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Valuation Date</td>
                            <td>${policyData.valuationDate}</td>
                            <td>User Input</td>
                        </tr>
                        <tr>
                            <td>Issue Age</td>
                            <td>${policyData.issueAge}</td>
                            <td>Policy Contract</td>
                        </tr>
                        <tr>
                            <td>Gender</td>
                            <td>${policyData.gender}</td>
                            <td>Policy Contract</td>
                        </tr>
                        <tr>
                            <td>Mortality Table</td>
                            <td>2012 Individual Annuity Mortality (Simplified)</td>
                            <td>Industry Standard</td>
                        </tr>
                        <tr>
                            <td>Guaranteed Rate</td>
                            <td>${formatPercentage(policyData.guaranteedRate / 100)}</td>
                            <td>Policy Contract</td>
                        </tr>
                        <tr>
                            <td>Valuation Interest Rate</td>
                            <td>${formatPercentage(INTEREST_RATES.valuation_rate)}</td>
                            <td>NAIC Standard</td>
                        </tr>
                        <tr>
                            <td>Surrender Charge Period</td>
                            <td>${policyData.surrenderChargeYears} years</td>
                            <td>Product Feature</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
        
        document.getElementById('assumptions').innerHTML = assumptionsHtml;
    }

    displayCalculationSteps(results) {
        let stepsHtml = `
            <div class="calculation-steps">
                <h3>Calculation Methodology</h3>
                <p><strong>CARVM Form Applied:</strong> Greatest Present Value Method</p>
                <p><strong>Regulatory Reference:</strong> NAIC Standard Valuation Law</p>
                
                <div class="steps-container">`;
        
        results.calculationSteps.forEach((step, index) => {
            stepsHtml += `
                <div class="calculation-step">
                    <h4>Step ${index + 1}: ${step.step}</h4>
                    ${this.formatStepData(step.data)}
                </div>`;
        });
        
        stepsHtml += `
                </div>
            </div>`;
        
        document.getElementById('calculationSteps').innerHTML = stepsHtml;
    }

    // NEW: Display CARVM test results showing all years tested
    displayCARVMResults(results) {
        const presentValue = results.presentValues[0];
        
        let carvmHtml = `
            <div class="carvm-results">
                <h3>CARVM Greatest Present Value Analysis</h3>
                <p><strong>Method:</strong> ${presentValue.scenario.description}</p>
                <p><strong>Valuation Rate:</strong> ${formatPercentage(presentValue.scenario.interestRate)}</p>
                
                <div class="carvm-summary">
                    <div class="selected-result">
                        <h4>Selected CARVM Reserve</h4>
                        <div class="result-highlight">
                            <span class="reserve-amount">${formatCurrency(results.reserve)}</span>
                            <span class="reserve-details">Year ${results.selectedYear} - ${results.selectedTest.selectedBenefit}</span>
                        </div>
                    </div>
                </div>
                
                <div class="carvm-details">
                    <h4>Year-by-Year Test Results</h4>
                    <button class="toggle-details" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                        Show/Hide Detailed Cash Flows
                    </button>
                    <div class="cash-flows-container" style="display: none;">
                        ${this.engine.formatCashFlowsAsTable(presentValue.cashFlows)}
                    </div>
                </div>
            </div>`;
        
        document.getElementById('scenarioResults').innerHTML = carvmHtml;
    }

    displayReserveSummary(results) {
        const reserveHtml = `
            <div class="reserve-summary">
                <h3>Reserve Results</h3>
                
                <table class="reserve-table">
                    <thead>
                        <tr>
                            <th>Reserve Type</th>
                            <th>Amount</th>
                            <th>Calculation Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="primary-reserve">
                            <td>STAT CARVM Reserve</td>
                            <td>${formatCurrency(results.reserve)}</td>
                            <td>Greatest Present Value Method</td>
                        </tr>
                        <tr>
                            <td>Selected Year</td>
                            <td>Year ${results.selectedYear}</td>
                            <td>Highest PV Test Result</td>
                        </tr>
                        <tr>
                            <td>Selected Benefit</td>
                            <td>${results.selectedTest.selectedBenefit}</td>
                            <td>Greatest Benefit Available</td>
                        </tr>
                        <tr>
                            <td>Benefit Amount</td>
                            <td>${formatCurrency(results.selectedTest.greatestBenefit)}</td>
                            <td>Pre-Discount Value</td>
                        </tr>
                    </tbody>
                </table>
            </div>`;
        
        document.getElementById('reserveSummary').innerHTML = reserveHtml;
    }

    displayAuditTrail(results) {
        let auditHtml = `
            <div class="audit-trail">
                <h3>Audit Trail</h3>
                
                <table class="audit-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Step</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        results.auditTrail.forEach(entry => {
            auditHtml += `
                <tr>
                    <td>${entry.timestamp}</td>
                    <td>${entry.step}</td>
                    <td>${entry.description}</td>
                </tr>`;
        });
        
        auditHtml += `
                    </tbody>
                </table>
            </div>`;
        
        document.getElementById('auditTrail').innerHTML = auditHtml;
    }

    formatStepData(data) {
        let html = '<div class="step-data">';
        
        for (const [key, value] of Object.entries(data)) {
            if (key === 'sampleTests' && Array.isArray(value)) {
                html += `<div class="sample-tests">
                    <h5>Sample Test Results:</h5>
                    ${this.engine.formatCashFlowsAsTable(value)}
                </div>`;
            } else if (typeof value === 'object' && value !== null) {
                html += `<div class="nested-data">
                    <strong>${this.formatKey(key)}:</strong>
                    <pre>${JSON.stringify(value, null, 2)}</pre>
                </div>`;
            } else if (typeof value === 'number' && key.toLowerCase().includes('rate')) {
                html += `<p><strong>${this.formatKey(key)}:</strong> ${formatPercentage(value)}</p>`;
            } else if (typeof value === 'number' && (key.toLowerCase().includes('value') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('reserve'))) {
                html += `<p><strong>${this.formatKey(key)}:</strong> ${formatCurrency(value)}</p>`;
            } else {
                html += `<p><strong>${this.formatKey(key)}:</strong> ${value}</p>`;
            }
        }
        
        html += '</div>';
        return html;
    }

    formatKey(key) {
        return key.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim();
    }

    formatProductType(productType) {
        return productType.replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim();
    }

    // Utility methods for loading states and errors
    showLoadingState() {
        const button = document.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.textContent = 'Calculating...';
        }
        
        // Hide any previous results
        document.getElementById('resultsSection').style.display = 'none';
        
        // Clear any previous errors
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    hideLoadingState() {
        const button = document.querySelector('button[type="submit"]');
        if (button) {
            button.disabled = false;
            button.textContent = 'Calculate STAT CARVM Reserve';
        }
    }

    showError(message) {
        let errorDiv = document.getElementById('errorMessage');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'errorMessage';
            errorDiv.className = 'error-message';
            document.querySelector('.container').insertBefore(errorDiv, document.getElementById('resultsSection'));
        }
        
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.style.display='none'">Close</button>
            </div>`;
        errorDiv.style.display = 'block';
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new AnnuityCalculatorApp();
});