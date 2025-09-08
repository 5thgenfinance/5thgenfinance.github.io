// Main Application Logic for Annuity Valuation Calculator
// Updated to include expandable cash flow detail sections and enhanced sample cash flows display

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
        
        // Display scenario results (with expandable cash flows)
        this.displayScenarioResults(results);
        
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
            <h3>Executive Summary</h3>
            <p><strong>STAT CARVM Reserve:</strong> ${formatCurrency(results.reserve)}</p>
            <p><strong>Product Type:</strong> ${this.formatProductType(policyData.productType)}</p>
            <p><strong>Policy Premium:</strong> ${formatCurrency(policyData.premiumAmount)}</p>
            <p><strong>Reserve as % of Premium:</strong> ${((results.reserve / policyData.premiumAmount) * 100).toFixed(2)}%</p>
            <p><strong>Valuation Method:</strong> Commissioners Annuity Reserve Valuation Method (CARVM)</p>
            <p><strong>Regulatory Standard:</strong> NAIC Standard Valuation Law</p>
            <div class="message ${results.compliance.compliant ? 'success' : 'error'}">
                <strong>Compliance Status:</strong> ${results.compliance.message}
            </div>
        `;
        
        document.getElementById('executiveSummary').innerHTML = summaryHtml;
    }

    displayAssumptionsTable(policyData, results) {
        const assumptionsHtml = `
            <h3>Valuation Assumptions</h3>
            <table>
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
                        <td>Minimum Interest Rate</td>
                        <td>${formatPercentage(INTEREST_RATES.statutory_minimum)}</td>
                        <td>Regulatory Minimum</td>
                    </tr>
                    <tr>
                        <td>Surrender Charge Period</td>
                        <td>${policyData.surrenderChargeYears} years</td>
                        <td>Product Feature</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        document.getElementById('assumptionsTable').innerHTML = assumptionsHtml;
    }

    // ENHANCED: Updated calculation steps display to render sample cash flows as tables
    displayCalculationSteps(results) {
        let stepsHtml = '<h3>Calculation Methodology</h3>';
        stepsHtml += '<p><strong>CARVM Form Applied:</strong> Greatest Present Value Method</p>';
        stepsHtml += '<p><strong>Regulatory Reference:</strong> NAIC Standard Valuation Law</p>';
        
        results.calculationSteps.forEach((step, index) => {
            stepsHtml += `
                <div class="calculation-step">
                    <h4>Step ${index + 1}: ${step.step}</h4>
                    ${this.formatStepDetails(step.details)}
                </div>
            `;
        });
        
        document.getElementById('calculationSteps').innerHTML = stepsHtml;
    }

    // ENHANCED: Updated to properly render sample cash flows table
    formatStepDetails(details) {
        if (!details) return '';
        
        let html = '';
        
        for (const [key, value] of Object.entries(details)) {
            if (key === 'sampleCashFlowsTable') {
                // Special handling for the sample cash flows table
                html += `<div class="sample-cashflows-section">`;
                html += `<h5>Sample Cash Flows (First 10 Years):</h5>`;
                html += value; // This is already formatted HTML table from the calculation engine
                html += `</div>`;
            } else if (Array.isArray(value)) {
                html += `<p><strong>${this.formatKey(key)}:</strong></p><ul>`;
                value.forEach(item => {
                    if (typeof item === 'object') {
                        if (item.name && item.interestRate !== undefined) {
                            // Format scenario objects nicely
                            html += `<li>${item.name}: ${formatPercentage(item.interestRate)}</li>`;
                        } else {
                            html += `<li>${JSON.stringify(item)}</li>`;
                        }
                    } else {
                        html += `<li>${item}</li>`;
                    }
                });
                html += '</ul>';
            } else if (typeof value === 'number') {
                if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent')) {
                    html += `<p><strong>${this.formatKey(key)}:</strong> ${formatPercentage(value)}</p>`;
                } else if (key.toLowerCase().includes('value') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('reserve')) {
                    html += `<p><strong>${this.formatKey(key)}:</strong> ${formatCurrency(value)}</p>`;
                } else {
                    html += `<p><strong>${this.formatKey(key)}:</strong> ${value.toLocaleString()}</p>`;
                }
            } else {
                html += `<p><strong>${this.formatKey(key)}:</strong> ${value}</p>`;
            }
        }
        
        return html;
    }

    // UPDATED: Enhanced scenario results display with expandable cash flows
    displayScenarioResults(results) {
        let scenarioHtml = `
            <h3>Scenario Analysis Results</h3>
            <table>
                <thead>
                    <tr>
                        <th>Scenario</th>
                        <th>Description</th>
                        <th>Interest Rate</th>
                        <th>Present Value</th>
                        <th>Selected</th>
                        <th>Cash Flows</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        const maxPV = Math.max(...results.presentValues.map(pv => pv.presentValue));
        
        // Build scenario table with expandable cash flow sections
        results.presentValues.forEach((pv, idx) => {
            const isSelected = pv.presentValue === maxPV;
            scenarioHtml += `
                <tr ${isSelected ? 'style="background-color: #e8f4f8; font-weight: bold;"' : ''}>
                    <td>${pv.scenario.name}</td>
                    <td>${pv.scenario.description}</td>
                    <td>${formatPercentage(pv.scenario.interestRate)}</td>
                    <td>${formatCurrency(pv.presentValue)}</td>
                    <td>${isSelected ? '✓ CARVM Reserve' : ''}</td>
                    <td>
                        <button class="expand-btn" data-scenario-idx="${idx}">Show Cash Flows</button>
                    </td>
                </tr>
                <tr class="cashflow-detail" id="cashflow-detail-${idx}" style="display: none;">
                    <td colspan="6">
                        <table class="cashflow-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Age</th>
                                    <th>Account Value</th>
                                    <th>Survival Prob</th>
                                    <th>Persistency</th>
                                    <th>Lapse Rate</th>
                                    <th>Benefit Payment</th>
                                    <th>Present Value</th>
                                </tr>
                            </thead>
                            <tbody id="cashflow-tbody-${idx}">
                                <!-- Cash flow data will be populated here -->
                            </tbody>
                        </table>
                    </td>
                </tr>
            `;
        });
        
        scenarioHtml += '</tbody></table>';
        document.getElementById('scenarioResults').innerHTML = scenarioHtml;
        
        // Populate cash flow data and set up event listeners
        results.presentValues.forEach((pv, idx) => {
            const cashflowTbody = document.getElementById(`cashflow-tbody-${idx}`);
            let cashflowRowsHtml = '';
            
            // Display first 15 years of cash flows for readability
            const displayRows = Math.min(pv.cashFlows.length, 15);
            for (let i = 0; i < displayRows; i++) {
                const cf = pv.cashFlows[i];
                cashflowRowsHtml += `
                    <tr>
                        <td>${cf.year}</td>
                        <td>${cf.age}</td>
                        <td>${formatCurrency(cf.accountValue)}</td>
                        <td>${(cf.survivalProb * 100).toFixed(3)}%</td>
                        <td>${(cf.persistency * 100).toFixed(3)}%</td>
                        <td>${(cf.lapseRate * 100).toFixed(2)}%</td>
                        <td>${formatCurrency(cf.benefitPayment)}</td>
                        <td>${formatCurrency(cf.presentValue)}</td>
                    </tr>
                `;
            }
            
            if (pv.cashFlows.length > 15) {
                cashflowRowsHtml += `
                    <tr>
                        <td colspan="8" style="text-align: center; font-style: italic; color: #666;">
                            ... and ${pv.cashFlows.length - 15} more years (total: ${pv.cashFlows.length} years)
                        </td>
                    </tr>
                `;
            }
            
            cashflowTbody.innerHTML = cashflowRowsHtml;
        });
        
        // Set up expand/collapse event listeners
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenarioIdx = e.target.getAttribute('data-scenario-idx');
                const detailRow = document.getElementById(`cashflow-detail-${scenarioIdx}`);
                const isVisible = detailRow.style.display === 'table-row';
                
                if (isVisible) {
                    detailRow.style.display = 'none';
                    e.target.textContent = 'Show Cash Flows';
                } else {
                    detailRow.style.display = 'table-row';
                    e.target.textContent = 'Hide Cash Flows';
                }
            });
        });
    }

    displayReserveSummary(results) {
        const summaryHtml = `
            <h3>Reserve Results Summary</h3>
            <table>
                <thead>
                    <tr>
                        <th>Reserve Type</th>
                        <th>Amount</th>
                        <th>Calculation Reference</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>STAT CARVM Reserve</td>
                        <td>${formatCurrency(results.reserve)}</td>
                        <td>Greatest Present Value Method</td>
                    </tr>
                    <tr>
                        <td>Minimum Scenario</td>
                        <td>${formatCurrency(Math.min(...results.presentValues.map(pv => pv.presentValue)))}</td>
                        <td>Lowest Present Value</td>
                    </tr>
                    <tr>
                        <td>Maximum Scenario</td>
                        <td>${formatCurrency(Math.max(...results.presentValues.map(pv => pv.presentValue)))}</td>
                        <td>Highest Present Value (CARVM)</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        document.getElementById('reserveSummary').innerHTML = summaryHtml;
    }

    displayAuditTrail(results) {
        let auditHtml = `
            <h3>Complete Audit Trail</h3>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Step</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        results.auditTrail.forEach(entry => {
            const timestamp = new Date(entry.timestamp).toLocaleString();
            auditHtml += `
                <tr>
                    <td>${timestamp}</td>
                    <td>${entry.step}</td>
                    <td>${entry.description}</td>
                </tr>
            `;
        });
        
        auditHtml += '</tbody></table>';
        
        document.getElementById('auditTrail').innerHTML = auditHtml;
    }

    formatProductType(productType) {
        return productType.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatKey(key) {
        return key.split(/(?=[A-Z])/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    showLoadingState() {
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<span class="loading"></span> Calculating...';
        submitButton.disabled = true;
    }

    hideLoadingState() {
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.innerHTML = 'Calculate STAT CARVM Reserve';
        submitButton.disabled = false;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.innerHTML = message;
        
        const form = document.getElementById('valuationForm');
        form.insertBefore(errorDiv, form.firstChild);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'message success';
        successDiv.innerHTML = message;
        
        const form = document.getElementById('valuationForm');
        form.insertBefore(successDiv, form.firstChild);
        
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }
}

// Export functionality
function exportResults(format) {
    if (!window.calculatorApp || !window.calculatorApp.currentResults) {
        alert('No calculation results to export. Please run a calculation first.');
        return;
    }

    if (format === 'csv') {
        exportToCSV();
    } else if (format === 'print') {
        window.print();
    }
}

function exportToCSV() {
    const results = window.calculatorApp.currentResults;
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add header
    csvContent += "Annuity STAT CARVM Valuation Results\\n\\n";
    
    // Add summary
    csvContent += "Summary\\n";
    csvContent += `CARVM Reserve,${results.reserve}\\n\\n`;
    
    // Add scenarios
    csvContent += "Scenario Analysis\\n";
    csvContent += "Scenario,Description,Interest Rate,Present Value\\n";
    
    results.presentValues.forEach(pv => {
        csvContent += `"${pv.scenario.name}","${pv.scenario.description}",${pv.scenario.interestRate},${pv.presentValue}\\n`;
    });
    
    csvContent += "\\n";
    
    // Add audit trail
    csvContent += "Audit Trail\\n";
    csvContent += "Timestamp,Step,Description\\n";
    
    results.auditTrail.forEach(entry => {
        csvContent += `"${entry.timestamp}","${entry.step}","${entry.description}"\\n`;
    });
    
    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `annuity-carvm-results-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.calculatorApp = new AnnuityCalculatorApp();
});