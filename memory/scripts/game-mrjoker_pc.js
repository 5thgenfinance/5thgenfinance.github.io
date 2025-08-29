class MemoryGame {
    constructor() {
        this.customContentData = null;
        this.initializeEventListeners();
        this.showSetupScreen();
    }

    initializeEventListeners() {
        // Setup screen events
        document.getElementById('red-player-name').addEventListener('input', () => this.validateSetup());
        document.getElementById('blue-player-name').addEventListener('input', () => this.validateSetup());
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectGameMode(e));
        });

        // Content source selection
        document.querySelectorAll('.content-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchContentSource(e));
        });

        // File upload handling
        const fileInput = document.getElementById('custom-content-file');
        const fileUploadArea = document.getElementById('file-upload-area');
        const removeFileBtn = document.getElementById('remove-file');

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        
        removeFileBtn.addEventListener('click', () => this.removeSelectedFile());

        document.getElementById('start-game').addEventListener('click', () => this.startNewGame());

        // Game screen events
        document.getElementById('reset-game').addEventListener('click', () => this.resetCurrentGame());
        document.getElementById('quit-game').addEventListener('click', () => this.quitToSetup());

        // End screen events
        document.getElementById('play-again').addEventListener('click', () => this.playAgain());
        document.getElementById('new-players').addEventListener('click', () => this.newPlayers());
    }

    switchContentSource(event) {
        const sourceType = event.target.dataset.source;
        
        // Update tab styling
        document.querySelectorAll('.content-tab').forEach(tab => 
            tab.classList.remove('active'));
        event.target.classList.add('active');
        
        // Update content options
        document.querySelectorAll('.content-option').forEach(option => 
            option.classList.remove('active'));
        document.querySelector(`.${sourceType}-content`).classList.add('active');
        
        // Reset validation
        this.validateSetup();
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('file-upload-area').classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('file-upload-area').classList.remove('dragover');
    }

    handleFileDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('file-upload-area').classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processSelectedFile(files[0]);
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processSelectedFile(file);
        }
    }

    async processSelectedFile(file) {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showFileError('Please select a valid JSON file.');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showFileError('File size must be less than 5MB.');
            return;
        }

        this.showFileLoading('Validating content file...');

        try {
            const fileContent = await this.readFileAsText(file);
            const contentData = JSON.parse(fileContent);
            
            // Validate content schema
            contentLoader.validateContentSchema(contentData);
            
            // Store valid content
            this.customContentData = contentData;
            this.showFileSuccess(file.name, contentData);
            
        } catch (error) {
            console.error('File validation error:', error);
            if (error instanceof SyntaxError) {
                this.showFileError('Invalid JSON format. Please check your file syntax.');
            } else {
                this.showFileError(`Content validation failed: ${error.message}`);
            }
            this.customContentData = null;
        }
        
        this.validateSetup();
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    showFileLoading(message) {
        const statusElement = document.getElementById('file-validation-status');
        statusElement.className = 'file-validation-status loading';
        statusElement.textContent = message;
    }

    showFileSuccess(fileName, contentData) {
        const statusElement = document.getElementById('file-validation-status');
        statusElement.className = 'file-validation-status success';
        statusElement.innerHTML = `
            ✅ Valid content file loaded<br>
            <strong>${contentData.contentMetadata.title}</strong><br>
            ${contentData.cardPairs.length} pairs available
        `;
        
        // Show selected file
        document.getElementById('file-upload-area').style.display = 'none';
        document.getElementById('file-selected').style.display = 'flex';
        document.getElementById('selected-file-name').textContent = fileName;
    }

    showFileError(message) {
        const statusElement = document.getElementById('file-validation-status');
        statusElement.className = 'file-validation-status error';
        statusElement.textContent = `❌ ${message}`;
        
        this.customContentData = null;
        this.removeSelectedFile();
    }

    removeSelectedFile() {
        document.getElementById('custom-content-file').value = '';
        document.getElementById('file-upload-area').style.display = 'block';
        document.getElementById('file-selected').style.display = 'none';
        document.getElementById('file-validation-status').style.display = 'none';
        
        this.customContentData = null;
        this.validateSetup();
    }

    showSetupScreen() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('setup-screen').classList.add('active');
        gameState.reset();
        
        // Reset file upload state
        this.removeSelectedFile();
        
        // Reset to predefined content tab
        document.querySelectorAll('.content-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector('.content-tab[data-source="predefined"]').classList.add('active');
        document.querySelectorAll('.content-option').forEach(option => option.classList.remove('active'));
        document.querySelector('.predefined-content').classList.add('active');
    }

    validateSetup() {
        const redName = document.getElementById('red-player-name').value.trim();
        const blueName = document.getElementById('blue-player-name').value.trim();
        const selectedMode = document.querySelector('.mode-btn.selected');
        
        // Check content source
        const activeContentTab = document.querySelector('.content-tab.active');
        const contentSourceValid = activeContentTab.dataset.source === 'predefined' || 
                                 (activeContentTab.dataset.source === 'custom' && this.customContentData !== null);
        
        const isValid = redName.length > 0 && 
                       blueName.length > 0 && 
                       redName !== blueName && 
                       selectedMode !== null &&
                       contentSourceValid;

        document.getElementById('start-game').disabled = !isValid;
    }

    selectGameMode(event) {
        // Remove previous selection
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('selected'));
        
        // Add selection to clicked button
        event.currentTarget.classList.add('selected');
        
        const mode = event.currentTarget.dataset.mode;
        gameState.setGameMode(mode);
        
        this.validateSetup();
    }

    async startNewGame() {
        const redName = document.getElementById('red-player-name').value.trim();
        const blueName = document.getElementById('blue-player-name').value.trim();
        
        // Set players
        gameState.setPlayers(redName, blueName);
        
        // Determine content source
        const activeContentTab = document.querySelector('.content-tab.active');
        let contentSet;
        
        try {
            if (activeContentTab.dataset.source === 'custom') {
                // Use uploaded custom content
                contentSet = this.customContentData;
                if (!contentSet || !contentSet.cardPairs) {
                    throw new Error('Invalid custom content set');
                }
                gameState.setSelectedContent(contentSet);
            } else {
                // Use pre-defined content
                const contentSetId = document.getElementById('content-set').value;
                contentSet = await contentLoader.loadContentSet(contentSetId);
                if (!contentSet || !contentSet.cardPairs) {
                    throw new Error('Failed to load content set');
                }
                gameState.setSelectedContent(contentSet);
            }

            // Validate minimum pairs for selected game mode
            const pairCount = gameState.gameMode === 'easy' ? 8 : 12;
            if (contentSet.cardPairs.length < pairCount) {
                throw new Error(`Content set has only ${contentSet.cardPairs.length} pairs, but ${pairCount} pairs are required for ${gameState.gameMode} mode.`);
            }

            // Select random pairs based on game mode
            const selectedPairs = contentLoader.selectRandomPairs(contentSet, pairCount);
            
            // Generate game cards
            gameState.cards = contentLoader.generateGameCards(selectedPairs);
            
            // Start the game
            this.showGameScreen();
            
        } catch (error) {
            console.error('Error starting game:', error);
            this.showErrorMessage(`Error starting game: ${error.message}`);
        }
    }

    showErrorMessage(message) {
        alert(message); // Simple alert for now - could be enhanced with modal
    }

    showGameScreen() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('game-screen').classList.add('active');

        // Update player displays
        document.getElementById('red-player-display').textContent = gameState.players.red.name;
        document.getElementById('blue-player-display').textContent = gameState.players.blue.name;

        // Create game board
        cardManager.createGameBoard(gameState.cards, gameState.gameMode);
        
        // Initialize displays
        cardManager.updateScoreDisplay();
        cardManager.updateTurnDisplay();

        // Start game timer
        gameState.startGame();
    }

    resetCurrentGame() {
        if (confirm('Are you sure you want to reset the current game?')) {
            // Reset game state but keep players and mode
            const currentRedName = gameState.players.red.name;
            const currentBlueName = gameState.players.blue.name;
            const currentMode = gameState.gameMode;
            const currentContent = gameState.selectedContent;

            gameState.reset();
            gameState.setPlayers(currentRedName, currentBlueName);
            gameState.setGameMode(currentMode);
            gameState.setSelectedContent(currentContent);

            // Regenerate cards
            const pairCount = gameState.gameMode === 'easy' ? 8 : 12;
            const selectedPairs = contentLoader.selectRandomPairs(currentContent, pairCount);
            gameState.cards = contentLoader.generateGameCards(selectedPairs);

            // Restart game
            this.showGameScreen();
        }
    }

    quitToSetup() {
        if (confirm('Are you sure you want to quit the current game?')) {
            this.showSetupScreen();
        }
    }

    playAgain() {
        // Same players, same mode, new cards
        const currentRedName = gameState.players.red.name;
        const currentBlueName = gameState.players.blue.name;
        const currentMode = gameState.gameMode;
        const currentContent = gameState.selectedContent;

        gameState.reset();
        gameState.setPlayers(currentRedName, currentBlueName);
        gameState.setGameMode(currentMode);
        gameState.setSelectedContent(currentContent);

        // Regenerate cards
        const pairCount = gameState.gameMode === 'easy' ? 8 : 12;
        const selectedPairs = contentLoader.selectRandomPairs(currentContent, pairCount);
        gameState.cards = contentLoader.generateGameCards(selectedPairs);

        this.showGameScreen();
    }

    newPlayers() {
        this.showSetupScreen();
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new MemoryGame();
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          