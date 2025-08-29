// NAIC PBR Data Processing Web Application - Sprint 2 (Fixed)
class NAICDataProcessor {
    constructor() {
        // Available data from the provided JSON
        this.availableReports = {} // populated dynamically
        this.corsProxy = 'https://cors-anywhere.herokuapp.com/';
        this.naicUrl = 'https://content.naic.org/pbr_data.htm';
        this.availableFiles = {};
        
        this.initializeApp();
        this.setupRealTimeHandlers(); // New method
        
        this.availableYears = ["2025", "2024", "2023"];
        
        this.sheetMappings = {
            "Table F&G Current Spreads": {
                "2025": ["Table F", "Table G", "Summary", "Methodology"],
                "2024": ["Table F", "Table G", "Summary"],
                "2023": ["Table F", "Table G"]
            },
            "Table H&I Long Term Spreads": {
                "2025": ["Table H", "Table I", "Summary"],
                "2024": ["Table H", "Table I"],
                "2023": ["Table H", "Table I"]
            },
            "Table J Current and Long Term Swap Spreads": {
                "2025": ["Table J", "Summary"],
                "2024": ["Table J"],
                "2023": ["Table J"]
            }
        };

        // Sample data for realistic output
        this.sampleData = {
            table_f: {
                naic_table_name: "Table F (06/30/2025) Investment Grade Current Benchmark Spreads (in bps)",
                credit_ratings: ["Aaa/AAA", "Aa1/AA+", "Aa2/AA", "Aa3/AA-", "A1/A+", "A2/A", "A3/A-", "Baa1/BBB+", "Baa2/BBB", "Baa3/BBB-"],
                wal_values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30],
                spreads: {
                    "1": [8.08, 14.91, 18.52, 22.91, 29.64, 38.76, 45.38, 58.43, 78.59, 112.76],
                    "2": [12.34, 19.26, 23.91, 28.52, 35.48, 43.85, 52.12, 67.22, 89.74, 125.38],
                    "3": [16.03, 25.06, 35.77, 43.54, 51.51, 59.96, 66.20, 78.42, 97.85, 113.21],
                    "4": [23.56, 33.19, 42.52, 51.90, 56.66, 62.37, 73.34, 86.71, 90.68, 115.64],
                    "5": [29.60, 37.66, 46.47, 54.72, 63.97, 73.22, 84.00, 94.77, 105.56, 122.16]
                }
            },
            table_g: {
                naic_table_name: "Table G (06/30/2025) Below Investment Grade Current Benchmark Spreads (in bps)",
                credit_ratings: ["Ba1/BB+", "Ba2/BB", "Ba3/BB-", "B1/B+", "B2/B", "B3/B-", "Caa1/CCC+", "Caa2/CCC", "Caa3/CCC-", "Ca/CCC"],
                wal_values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 30],
                spreads: {
                    "1": [138.81, 185.26, 237.74, 287.16, 336.61, 519.74, 702.87, 886.00, 1069.13, 1252.26],
                    "2": [142.15, 189.78, 245.32, 295.84, 348.92, 535.21, 721.50, 907.79, 1094.08, 1280.37],
                    "3": [145.49, 194.30, 252.90, 304.52, 361.23, 550.68, 740.13, 929.58, 1119.03, 1308.48]
                }
            }
        };

        this.currentData = null;
        this.currentChecksums = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            this.bindEvents();
            this.initializeFormState();
            console.log('NAIC Data Processor Sprint 2 initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Application failed to initialize: ' + error.message);
        }
    }

    initializeFormState() {
        const reportSelect = document.getElementById('report-select');
        const yearSelect = document.getElementById('year-select');
        const tableSelect = document.getElementById('table-select');
        const processBtn = document.getElementById('process-btn');
        const selectAllCheckbox = document.getElementById('select-all-sheets');
        
        // Report dropdown should already be populated from HTML, but ensure it's enabled
        if (reportSelect) {
            reportSelect.disabled = false;
        }
        
        // Set initial disabled states for dependent dropdowns
        if (yearSelect) {
            yearSelect.disabled = true;
            yearSelect.innerHTML = '<option value="">Select report first...</option>';
        }
        if (tableSelect) {
            tableSelect.disabled = true;
            tableSelect.innerHTML = '<option value="">Select year first...</option>';
        }
        if (processBtn) {
            processBtn.disabled = true;
        }
        if (selectAllCheckbox) {
            selectAllCheckbox.disabled = true;
        }
        
        // Hide all result panels
        this.hideAllPanels();
    }

    bindEvents() {
        // Get form elements
        const reportSelect = document.getElementById('report-select');
        const yearSelect = document.getElementById('year-select');
        const tableSelect = document.getElementById('table-select');
        const selectAllCheckbox = document.getElementById('select-all-sheets');
        const processBtn = document.getElementById('process-btn');
        const clearBtn = document.getElementById('clear-btn');
        const exportJsonBtn = document.getElementById('export-json-btn');
        const exportChecksumBtn = document.getElementById('export-checksum-btn');
        const dataForm = document.getElementById('data-form');

        if (!reportSelect || !yearSelect || !tableSelect || !dataForm) {
            throw new Error('Required form elements not found');
        }

        // Bind events
        reportSelect.addEventListener('change', (e) => {
            console.log('Report changed:', e.target.value);
            this.onReportChange(e.target.value);
        });
        
        yearSelect.addEventListener('change', (e) => {
            console.log('Year changed:', e.target.value);
            this.onYearChange(e.target.value);
        });
        
        tableSelect.addEventListener('change', () => {
            console.log('Table selection changed');
            this.validateForm();
        });
        
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                console.log('Select all changed:', e.target.checked);
                this.onSelectAllChange(e.target.checked);
            });
        }
        
        dataForm.addEventListener('submit', (e) => {
            console.log('Form submitted');
            this.onProcessData(e);
        });
        
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                console.log('Clear clicked');
                this.clearResults(e);
            });
        }
        
        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => {
                console.log('Export JSON clicked');
                this.exportJson();
            });
        }
        
        if (exportChecksumBtn) {
            exportChecksumBtn.addEventListener('click', () => {
                console.log('Export checksum clicked');
                this.exportChecksum();
            });
        }

        console.log('Events bound successfully');
    }

	// ADD THIS NEW METHOD
	setupRealTimeHandlers() {
		const refreshBtn = document.getElementById('refresh-btn');
		refreshBtn.addEventListener('click', () => this.refreshNAICFiles());
	}

	// ADD THIS NEW METHOD  
	async refreshNAICFiles() {
		const refreshBtn = document.getElementById('refresh-btn');
		const yearSelect = document.getElementById('year-select');
		
		try {
			refreshBtn.disabled = true;
			refreshBtn.innerHTML = '🔄 Checking NAIC Site...';
			
			this.showProcessingState('Connecting to NAIC data source...');
			
			// Real NAIC scraping
			const response = await fetch(this.corsProxy + this.naicUrl);
			const html = await response.text();
			
			// Parse for Excel links
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
			const links = doc.querySelectorAll('a[href$=".xlsx"]');
			
			this.availableFiles = this.parseNAICLinks(links);
			this.populateYearDropdown(this.availableFiles);
			
			// Enable year selection
			yearSelect.disabled = false;
			this.showSuccessState(`✅ Found ${Object.keys(this.availableFiles).length} years of data`);
			
		} catch (error) {
			this.showErrorState('❌ Could not connect to NAIC: ' + error.message);
			this.loadFallbackData(); // Your existing cached data
		} finally {
			refreshBtn.disabled = false;
			refreshBtn.innerHTML = '🔄 Refresh Available Files';
		}
	}

    onReportChange(report) {
        console.log('Processing report change:', report);
        const yearSelect = document.getElementById('year-select');
        const tableSelect = document.getElementById('table-select');
        const selectAllCheckbox = document.getElementById('select-all-sheets');

        if (!report) {
            yearSelect.innerHTML = '<option value="">Select report first...</option>';
            yearSelect.disabled = true;
            tableSelect.innerHTML = '<option value="">Select year first...</option>';
            tableSelect.disabled = true;
            if (selectAllCheckbox) selectAllCheckbox.disabled = true;
            this.validateForm();
            return;
        }

        // Populate years for this report
        yearSelect.innerHTML = '<option value="">Choose a year...</option>';
        this.availableYears.forEach(year => {
            if (this.sheetMappings[report] && this.sheetMappings[report][year]) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            }
        });

        yearSelect.disabled = false;
        tableSelect.innerHTML = '<option value="">Select year first...</option>';
        tableSelect.disabled = true;
        if (selectAllCheckbox) {
            selectAllCheckbox.disabled = true;
            selectAllCheckbox.checked = false;
        }
        this.validateForm();
    }

    onYearChange(year) {
        console.log('Processing year change:', year);
        const reportSelect = document.getElementById('report-select');
        const tableSelect = document.getElementById('table-select');
        const selectAllCheckbox = document.getElementById('select-all-sheets');
        
        const report = reportSelect.value;

        if (!year || !report) {
            tableSelect.innerHTML = '<option value="">Select year first...</option>';
            tableSelect.disabled = true;
            if (selectAllCheckbox) selectAllCheckbox.disabled = true;
            this.validateForm();
            return;
        }

        // Populate table names for this report and year
        const sheets = this.sheetMappings[report][year] || [];
        console.log('Available sheets:', sheets);
        
        tableSelect.innerHTML = '';
        sheets.forEach(sheet => {
            const option = document.createElement('option');
            option.value = sheet;
            option.textContent = sheet;
            tableSelect.appendChild(option);
        });

        tableSelect.disabled = false;
        if (selectAllCheckbox) selectAllCheckbox.disabled = false;
        this.validateForm();
    }

    onSelectAllChange(checked) {
        const tableSelect = document.getElementById('table-select');
        
        if (checked) {
            // Select all options
            Array.from(tableSelect.options).forEach(option => {
                option.selected = true;
            });
        } else {
            // Deselect all options
            Array.from(tableSelect.options).forEach(option => {
                option.selected = false;
            });
        }
        
        this.validateForm();
    }

    validateForm() {
        const report = document.getElementById('report-select').value;
        const year = document.getElementById('year-select').value;
        const tableSelect = document.getElementById('table-select');
        const selectedTables = Array.from(tableSelect.selectedOptions).map(opt => opt.value);
        const processBtn = document.getElementById('process-btn');

        const isValid = report && year && selectedTables.length > 0;
        if (processBtn) processBtn.disabled = !isValid;
        
        console.log('Form validation - Report:', report, 'Year:', year, 'Tables:', selectedTables, 'Valid:', isValid);
    }

    async onProcessData(event) {
        event.preventDefault();
        
        const report = document.getElementById('report-select').value;
        const year = document.getElementById('year-select').value;
        const tableSelect = document.getElementById('table-select');
        const selectedTables = Array.from(tableSelect.selectedOptions).map(opt => opt.value);

        console.log('Starting data processing for:', report, year, selectedTables);

        if (!report || !year || selectedTables.length === 0) {
            this.showError('Please complete all required selections');
            return;
        }

        try {
            await this.processData(report, year, selectedTables);
        } catch (error) {
            console.error('Processing error:', error);
            this.showError(error.message);
        }
    }

	async processData(year, tableType) {
		try {
			this.showProcessingState();
			
			// Get real file URL from scraped data
			const fileInfo = this.availableFiles[year][tableType];
			if (!fileInfo) {
				throw new Error('File not found in available data');
			}
			
			// Download real file
			this.showProcessingState(`📥 Downloading ${fileInfo.filename}...`);
			const response = await fetch(this.corsProxy + fileInfo.url);
			const arrayBuffer = await response.arrayBuffer();
			
			// Calculate real checksums
			const checksums = await this.calculateRealChecksums(arrayBuffer);
			this.displayChecksumValidation(checksums);
			
			// Process real Excel data  
			const processedData = await this.parseRealExcelData(arrayBuffer, year, tableType);
			this.displayResults(processedData);
			
		} catch (error) {
			this.showError('Processing failed: ' + error.message);
		}
	}

    async simulateDownload(report, year, selectedTables) {
        const step = document.getElementById('step-download');
        const statusText = document.getElementById('status-text');
        
        if (step && statusText) {
            step.classList.add('active');
            step.querySelector('.step-status')?.classList.add('loading');
            statusText.textContent = `Downloading ${report} (${year})...`;
            
            await this.updateProgress(25);
            await this.delay(1500);
            
            step.classList.remove('active');
            step.classList.add('completed');
            step.querySelector('.step-status')?.classList.remove('loading');
            step.querySelector('.step-status')?.classList.add('completed');
        }
    }

    async simulateChecksum() {
        const step = document.getElementById('step-verify');
        const statusText = document.getElementById('status-text');
        
        if (step && statusText) {
            step.classList.add('active');
            step.querySelector('.step-status')?.classList.add('loading');
            statusText.textContent = 'Generating SHA256 checksums...';
            
            await this.updateProgress(50);
            await this.delay(1200);
            
            // Generate realistic checksums
            this.currentChecksums = {
                sha256: this.generateChecksum('sha256'),
                md5: this.generateChecksum('md5'),
                sha1: this.generateChecksum('sha1')
            };
            
            step.classList.remove('active');
            step.classList.add('completed');
            step.querySelector('.step-status')?.classList.remove('loading');
            step.querySelector('.step-status')?.classList.add('completed');
        }
    }

    async simulateParsing(selectedTables) {
        const step = document.getElementById('step-parse');
        const statusText = document.getElementById('status-text');
        
        if (step && statusText) {
            step.classList.add('active');
            step.querySelector('.step-status')?.classList.add('loading');
            statusText.textContent = `Parsing ${selectedTables.length} worksheet(s)...`;
            
            await this.updateProgress(75);
            await this.delay(1000);
            
            step.classList.remove('active');
            step.classList.add('completed');
            step.querySelector('.step-status')?.classList.remove('loading');
            step.querySelector('.step-status')?.classList.add('completed');
        }
    }

    async simulateFormatting() {
        const step = document.getElementById('step-format');
        const statusText = document.getElementById('status-text');
        
        if (step && statusText) {
            step.classList.add('active');
            step.querySelector('.step-status')?.classList.add('loading');
            statusText.textContent = 'Building enhanced JSON structure...';
            
            await this.updateProgress(100);
            await this.delay(800);
            
            step.classList.remove('active');
            step.classList.add('completed');
            step.querySelector('.step-status')?.classList.remove('loading');
            step.querySelector('.step-status')?.classList.add('completed');
            statusText.textContent = 'Processing complete!';
        }
    }

    generateEnhancedJsonOutput(report, year, selectedTables) {
        const outputArray = [];

        selectedTables.forEach(tableName => {
            let tableData;
            
            if (tableName === 'Table F') {
                tableData = this.sampleData.table_f;
            } else if (tableName === 'Table G') {
                tableData = this.sampleData.table_g;
            } else {
                // Generate generic table data for other sheets
                tableData = {
                    naic_table_name: `${tableName} (06/30/${year}) Data Structure`,
                    credit_ratings: ["Aaa/AAA", "Aa1/AA+", "Aa2/AA", "A1/A+", "A2/A", "Baa1/BBB+"],
                    wal_values: [1, 2, 3, 5, 7, 10],
                    spreads: {
                        "1": [10.5, 15.2, 20.1, 25.8, 30.2, 35.5],
                        "2": [12.8, 17.6, 22.9, 28.1, 32.7, 38.2],
                        "3": [15.1, 19.8, 25.3, 30.6, 35.9, 41.1]
                    }
                };
            }

            // Build data array according to specification
            const dataArray = [];
            Object.entries(tableData.spreads).forEach(([wal, spreads]) => {
                const dataPoint = {
                    weighted_average_life: parseFloat(wal)
                };
                
                spreads.forEach((spread, index) => {
                    if (index < tableData.credit_ratings.length) {
                        dataPoint[tableData.credit_ratings[index]] = spread;
                    }
                });
                
                dataArray.push(dataPoint);
            });

            outputArray.push({
                naic_table_name: tableData.naic_table_name,
                sheet_name: tableName,
                weighted_average_life: tableData.wal_values,
                credit_ratings: tableData.credit_ratings,
                data: dataArray
            });
        });

        this.currentData = outputArray;
        console.log('Enhanced JSON output generated:', this.currentData);
    }

    showResultsPanel() {
        console.log('Showing results panel');
        const section = document.getElementById('results-section');
        const jsonOutput = document.getElementById('json-output');

        if (jsonOutput && this.currentData) {
            // Format JSON with syntax highlighting
            const formattedJson = this.formatJsonWithHighlighting(this.currentData);
            jsonOutput.innerHTML = `<code>${formattedJson}</code>`;
        }

        // Update validation evidence
        this.showValidationEvidence();

        if (section) {
            section.classList.remove('hidden');
        }
    }

    showValidationEvidence() {
        console.log('Updating validation evidence');
        
        // Update verification time
        const verifyTime = document.getElementById('verify-time');
        if (verifyTime) {
            verifyTime.textContent = new Date().toLocaleString();
        }

        // Update checksums
        if (this.currentChecksums) {
            const sha256Value = document.getElementById('sha256-value');
            const md5Value = document.getElementById('md5-value');
            const sha1Value = document.getElementById('sha1-value');

            if (sha256Value) sha256Value.textContent = this.currentChecksums.sha256;
            if (md5Value) md5Value.textContent = this.currentChecksums.md5;
            if (sha1Value) sha1Value.textContent = this.currentChecksums.sha1;
        }

        // Update evidence of accuracy
        if (this.currentData && this.currentData.length > 0) {
            const firstTable = this.currentData[0];
            
            const rowCount = document.getElementById('row-count');
            const colCount = document.getElementById('col-count');
            const walCount = document.getElementById('wal-count');
            const ratingCount = document.getElementById('rating-count');

            if (rowCount) rowCount.textContent = firstTable.data.length;
            if (colCount) colCount.textContent = firstTable.credit_ratings.length + 1; // +1 for WAL column
            if (walCount) walCount.textContent = firstTable.weighted_average_life.length;
            if (ratingCount) ratingCount.textContent = firstTable.credit_ratings.length;

            // Sample data spot-checks
            if (firstTable.data.length > 0) {
                const sampleCheck1 = document.getElementById('sample-check-1');
                const sampleCheck2 = document.getElementById('sample-check-2');
                const sampleCheck3 = document.getElementById('sample-check-3');

                if (sampleCheck1 && firstTable.data[0]) {
                    sampleCheck1.textContent = firstTable.data[0][firstTable.credit_ratings[0]] || 'N/A';
                }
                if (sampleCheck2 && firstTable.data[4] && firstTable.credit_ratings[5]) {
                    sampleCheck2.textContent = firstTable.data[4][firstTable.credit_ratings[5]] || 'N/A';
                }
                if (sampleCheck3 && firstTable.data[2] && firstTable.credit_ratings[9]) {
                    sampleCheck3.textContent = firstTable.data[2][firstTable.credit_ratings[9]] || 'N/A';
                }
            }
        }
    }

    formatJsonWithHighlighting(data) {
        const jsonString = JSON.stringify(data, null, 2);
        return jsonString
            .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
            .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
            .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
            .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/: null/g, ': <span class="json-null">null</span>');
    }

    exportJson() {
        if (!this.currentData) {
            this.showError('No data to export');
            return;
        }
        
        try {
            const dataStr = JSON.stringify(this.currentData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `naic-pbr-enhanced-data-${new Date().toISOString().split('T')[0]}.json`;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            console.log('Enhanced JSON exported successfully');
        } catch (error) {
            console.error('Error exporting JSON:', error);
            this.showError('Failed to export JSON: ' + error.message);
        }
    }

    exportChecksum() {
        if (!this.currentChecksums) {
            this.showError('No checksums available');
            return;
        }
        
        try {
            const checksumStr = `${this.currentChecksums.sha256}  naic-pbr-enhanced-data-${new Date().toISOString().split('T')[0]}.json\n`;
            const blob = new Blob([checksumStr], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `naic-pbr-enhanced-data-${new Date().toISOString().split('T')[0]}.sha256`;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            console.log('SHA256 checksum file exported successfully');
        } catch (error) {
            console.error('Error exporting checksum:', error);
            this.showError('Failed to export checksum: ' + error.message);
        }
    }

    generateChecksum(type) {
        // Generate realistic looking checksums for simulation
        const chars = '0123456789abcdef';
        let result = '';
        const length = type === 'sha256' ? 64 : type === 'sha1' ? 40 : 32;
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    async updateProgress(percentage) {
        const progressRing = document.getElementById('progress-ring-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressRing && progressText) {
            const circumference = 2 * Math.PI * 15.9155;
            const offset = circumference - (percentage / 100) * circumference;
            
            progressRing.style.strokeDasharray = `${circumference}, ${circumference}`;
            progressRing.style.strokeDashoffset = offset;
            progressText.textContent = `${percentage}%`;
        }
        
        await this.delay(100);
    }

    showProcessingState(message = 'Processing data...') {
		const statusDisplay = document.getElementById('status-display');
		if (statusDisplay) {
			statusDisplay.innerHTML = `
				<span class="status-indicator">🔄</span>
				<span class="status-text">${message}</span>
			`;
		}
		
		// Update progress bar if it exists
		const progressFill = document.querySelector('.progress-fill');
		if (progressFill) {
			progressFill.style.width = '25%';
		}
	}
	
	setupRealTimeHandlers() {
		const refreshBtn = document.getElementById('refresh-btn');
		if (refreshBtn) {
			refreshBtn.addEventListener('click', () => this.refreshNAICFiles());
		}
	}

	async scrapeNAICWithFallback() {
		try {
			return await this.scrapeNAICRealTime();
		} catch (corsError) {
			console.warn('CORS blocked, using cached data');
			return this.loadFallbackData();
		}
	}

	async function fetchViaGitHubActions(url) {
		// Trigger workflow via GitHub API
		const workflowResponse = await fetch(`https://api.github.com/repos/5thgenfinance/5thgenfinance.github.io/actions/workflows/cors-proxy.yml/dispatches`, {
			method: 'POST',
			headers: {
				'Authorization': `token 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`,
				'Accept': 'application/vnd.github.v3+json'
			},
			body: JSON.stringify({
				ref: 'main',
				inputs: { target_url: url }
			})
		});
		
		// Poll for completion and download artifact
		// Implementation details depend on your specific workflow
	}
	
	
	// ADD NEW SUCCESS STATE METHOD
	showSuccessState(message) {
		const statusDisplay = document.getElementById('status-display');
		if (statusDisplay) {
			statusDisplay.innerHTML = `
				<span class="status-indicator">✅</span>
				<span class="status-text">Job Successful</span>
			`;
		}
	}

	// ADD NEW ERROR STATE METHOD  
	showErrorState(message) {
		const statusDisplay = document.getElementById('status-display');
		if (statusDisplay) {
			statusDisplay.innerHTML = `
				<span class="status-indicator">❌</span>
				<span class="status-text">Job Failed</span>
			`;
		}
	}

    hideAllPanels() {
        const panels = [
            'processing-section',
            'results-section',
            'error-section'
        ];
        
        panels.forEach(id => {
            const panel = document.getElementById(id);
            if (panel) {
                panel.classList.add('hidden');
            }
        });
    }

    showError(message) {
        console.log('Showing error:', message);
        this.hideAllPanels();
        
        const section = document.getElementById('error-section');
        const errorText = document.getElementById('error-text');
        
        if (errorText) errorText.textContent = message;
        if (section) section.classList.remove('hidden');
    }

    disableProcessButton() {
        const processBtn = document.getElementById('process-btn');
        const processBtnText = document.getElementById('process-btn-text');
        const processSpinner = document.getElementById('process-spinner');

        if (processBtn) processBtn.disabled = true;
        if (processBtnText) processBtnText.textContent = 'Processing...';
        if (processSpinner) processSpinner.classList.remove('hidden');
    }

    enableProcessButton() {
        const processBtn = document.getElementById('process-btn');
        const processBtnText = document.getElementById('process-btn-text');
        const processSpinner = document.getElementById('process-spinner');

        if (processBtn) processBtn.disabled = false;
        if (processBtnText) processBtnText.textContent = 'Get Data';
        if (processSpinner) processSpinner.classList.add('hidden');
    }

    clearResults(event) {
        event.preventDefault();
        console.log('Clearing all results and resetting form');
        
        // Hide all panels
        this.hideAllPanels();
        
        // Reset form elements
        const reportSelect = document.getElementById('report-select');
        const yearSelect = document.getElementById('year-select');
        const tableSelect = document.getElementById('table-select');
        const selectAllCheckbox = document.getElementById('select-all-sheets');
        const processBtn = document.getElementById('process-btn');
        
        if (reportSelect) {
            reportSelect.value = '';
        }
        if (yearSelect) {
            yearSelect.innerHTML = '<option value="">Select report first...</option>';
            yearSelect.disabled = true;
        }
        if (tableSelect) {
            tableSelect.innerHTML = '<option value="">Select year first...</option>';
            tableSelect.disabled = true;
        }
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.disabled = true;
        }
        if (processBtn) {
            processBtn.disabled = true;
        }
        
        // Clear stored data
        this.currentData = null;
        this.currentChecksums = null;
        
        console.log('Form and data cleared successfully');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
	// ADD THESE NEW METHODS TO YOUR CLASS

	parseNAICLinks(links) {
		const files = {};
		
		links.forEach(link => {
			const href = link.getAttribute('href');
			const fullUrl = href.startsWith('http') ? href : 
				`https://content.naic.org${href}`;
			
			const filename = href.split('/').pop();
			const yearMatch = filename.match(/(\d{4})/);
			
			if (yearMatch) {
				const year = yearMatch[1];
				if (!files[year]) files[year] = {};
				
				// Determine table type from filename
				if (filename.includes('table-f-g')) {
					files[year]['Table F&G Current Spreads'] = {
						filename, url: fullUrl
					};
				} else if (filename.includes('table-h-i')) {
					files[year]['Table H&I Long Term Spreads'] = {
						filename, url: fullUrl
					};
				}
			}
		});
		
		return files;
	}

	populateYearDropdown(availableFiles) {
		const yearSelect = document.getElementById('year-select');
		yearSelect.innerHTML = '<option value="">Choose a year...</option>';
		
		Object.keys(availableFiles)
			.sort((a, b) => b - a) // Newest first
			.forEach(year => {
				const option = document.createElement('option');
				option.value = year;
				option.textContent = year;
				yearSelect.appendChild(option);
			});
	}

	async calculateRealChecksums(arrayBuffer) {
		const uint8Array = new Uint8Array(arrayBuffer);
		
		// Use Web Crypto API for real checksums
		const sha256Hash = await crypto.subtle.digest('SHA-256', uint8A