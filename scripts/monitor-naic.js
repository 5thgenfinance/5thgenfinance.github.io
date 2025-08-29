const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

class NAICMonitor {
    constructor() {
        this.naicUrl = 'https://content.naic.org/pbr_data.htm';
        this.contentHistoryPath = './docs/content_history/manifest.json';
        this.contentDir = './docs/content_history/';
    }

    async run() {
        console.log('🔍 Starting NAIC monitoring check...');
        
        try {
            // Ensure content directory exists
            await fs.mkdir(this.contentDir, { recursive: true });
            
            // Load existing content history
            const contentHistory = await this.loadContentHistory();
            
            // Scrape current NAIC files
            const currentFiles = await this.scrapeNAICFiles();
            
            // Check for new or updated files
            const updates = await this.checkForUpdates(currentFiles, contentHistory);
            
            if (updates.length > 0) {
                console.log(`📊 Found ${updates.length} file updates`);
                await this.processUpdates(updates, contentHistory);
                await this.saveContentHistory(contentHistory);
                console.log('✅ Content history updated successfully');
            } else {
                console.log('ℹ️ No new files detected');
            }
            
        } catch (error) {
            console.error('❌ Monitoring failed:', error.message);
            process.exit(1);
        }
    }

    async loadContentHistory() {
        try {
            const data = await fs.readFile(this.contentHistoryPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('📝 Creating new content history manifest');
            return {};
        }
    }

    async scrapeNAICFiles() {
        console.log('🌐 Scraping NAIC website...');
        
        const response = await fetch(this.naicUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NAIC-Monitor/1.0)'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        const files = {};
        const links = document.querySelectorAll('a[href$=".xlsx"]');
        
        links.forEach(link => {
            const href = link.href;
            const fullUrl = href.startsWith('http') ? href : `https://content.naic.org${href}`;
            const filename = href.split('/').pop();
            
            // Extract year from filename
            const yearMatch = filename.match(/(\d{4})/);
            if (yearMatch) {
                const year = yearMatch[1];
                const fileKey = `${year}-${filename}`;
                
                files[fileKey] = {
                    filename,
                    url: fullUrl,
                    year,
                    detected_date: new Date().toISOString()
                };
            }
        });
        
        console.log(`📋 Found ${Object.keys(files).length} Excel files on NAIC site`);
        return files;
    }

    async checkForUpdates(currentFiles, contentHistory) {
        const updates = [];
        
        for (const [fileKey, fileInfo] of Object.entries(currentFiles)) {
            if (!contentHistory[fileKey]) {
                console.log(`🆕 New file: ${fileInfo.filename}`);
                updates.push({ type: 'new', fileKey, fileInfo });
            } else {
                // Check if URL changed or file was modified
                const existingInfo = contentHistory[fileKey];
                if (existingInfo.url !== fileInfo.url) {
                    console.log(`🔄 Updated file: ${fileInfo.filename}`);
                    updates.push({ type: 'updated', fileKey, fileInfo });
                }
            }
        }
        
        return updates;
    }

    async processUpdates(updates, contentHistory) {
        for (const update of updates) {
            const { fileKey, fileInfo } = update;
            
            try {
                // Download the file to calculate checksum
                const response = await fetch(fileInfo.url);
                const buffer = await response.arrayBuffer();
                const uint8Array = new Uint8Array(buffer);
                
                // Calculate SHA256 checksum
                const hash = crypto.createHash('sha256');
                hash.update(uint8Array);
                const checksum = hash.digest('hex');
                
                // Save file locally
                const localPath = path.join(this.contentDir, fileInfo.filename);
                await fs.writeFile(localPath, uint8Array);
                
                // Update manifest
                contentHistory[fileKey] = {
                    ...fileInfo,
                    checksum,
                    file_size: buffer.byteLength,
                    downloaded_date: new Date().toISOString(),
                    local_path: `content_history/${fileInfo.filename}`
                };
                
                console.log(`💾 Processed: ${fileInfo.filename} (${buffer.byteLength} bytes)`);
                
            } catch (error) {
                console.error(`❌ Failed to process ${fileInfo.filename}:`, error.message);
            }
        }
    }

    async saveContentHistory(contentHistory) {
        const manifestData = {
            last_updated: new Date().toISOString(),
            total_files: Object.keys(contentHistory).length,
            files: contentHistory
        };
        
        await fs.writeFile(
            this.contentHistoryPath, 
            JSON.stringify(manifestData, null, 2)
        );
    }
}

// Run the monitor
const monitor = new NAICMonitor();
monitor.run();
