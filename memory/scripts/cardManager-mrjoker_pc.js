class CardManager {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.clickTimeout = null;
        this.isProcessingMatch = false;
    }

    createGameBoard(cards, gameMode) {
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board ${gameMode}-mode`;

        cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }

    createCardElement(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card face-down';
        cardElement.dataset.cardId = card.id;
        cardElement.dataset.pairId = card.pairId;
        cardElement.dataset.index = index;

        cardElement.innerHTML = `
            <div class="card-parameters">
                <span class="param-left">${card.parameterLeft || ''}</span>
                <span class="param-right">${card.parameterRight || ''}</span>
            </div>
            <div class="card-content">${card.displayContent}</div>
        `;

        cardElement.addEventListener('click', (e) => this.handleCardClick(e, card));

        return cardElement;
    }

    handleCardClick(event, card) {
        if (!gameState || gameState.gameStatus !== 'playing') {
            console.warn('Invalid game state for card interaction');
            return;
        }
        
        if (this.isProcessingMatch) return;
        
        const cardElement = event.currentTarget;
        
        // Prevent clicking already flipped or matched cards
        if (card.isFlipped || card.isMatched) return;
        
        // Prevent clicking more than 2 cards
        if (gameState.flippedCards.length >= 2) return;

        this.flipCard(cardElement, card);
        gameState.flippedCards.push(card.id);

        if (gameState.flippedCards.length === 2) {
            this.isProcessingMatch = true;
            setTimeout(() => this.checkForMatch(), 1000);
        }
    }

    flipCard(cardElement, card) {
        card.isFlipped = true;
        cardElement.classList.remove('face-down');
        cardElement.classList.add('flipped');
        
        // Update visual state
        this.updateCardDisplay(cardElement, card);
    }

    checkForMatch() {
        const flippedCardIds = gameState.flippedCards;
        const card1 = gameState.cards.find(c => c.id === flippedCardIds[0]);
        const card2 = gameState.cards.find(c => c.id === flippedCardIds[1]);

        if (card1.pairId === card2.pairId) {
            // It's a match!
            this.handleMatch(card1, card2);
        } else {
            // Not a match
            this.handleMismatch(card1, card2);
        }

        gameState.flippedCards = [];
        this.isProcessingMatch = false;
    }

    handleMatch(card1, card2) {
        const currentPlayer = gameState.currentTurn;
        
        // Add match to game state
        gameState.addMatch(card1.pairId, currentPlayer);

        // Update card elements
        const card1Element = document.querySelector(`[data-card-id="${card1.id}"]`);
        const card2Element = document.querySelector(`[data-card-id="${card2.id}"]`);

        card1Element.classList.add('matched', `${currentPlayer}-match`);
        card2Element.classList.add('matched', `${currentPlayer}-match`);

        // Update score display
        this.updateScoreDisplay();

        // Check if game is complete
        if (gameState.checkGameComplete()) {
            setTimeout(() => this.showEndScreen(), 1000);
        } else {
            // Player gets another turn for successful match
            this.updateTurnDisplay();
        }
    }

    handleMismatch(card1, card2) {
        // Flip cards back down
        setTimeout(() => {
            const card1Element = document.querySelector(`[data-card-id="${card1.id}"]`);
            const card2Element = document.querySelector(`[data-card-id="${card2.id}"]`);

            card1.isFlipped = false;
            card2.isFlipped = false;

            card1Element.classList.remove('flipped');
            card2Element.classList.remove('flipped');
            card1Element.classList.add('face-down');
            card2Element.classList.add('face-down');

            // Switch turns
            gameState.switchTurn();
            this.updateTurnDisplay();
        }, 500);
    }

    updateCardDisplay(cardElement, card) {
        if (card.isMatched) {
            cardElement.classList.add('matched', `${card.matchedBy}-match`);
        }
    }

    updateScoreDisplay() {
        document.getElementById('red-score').textContent = gameState.players.red.matchCount;
        document.getElementById('blue-score').textContent = gameState.players.blue.matchCount;
    }

    updateTurnDisplay() {
        const currentTurnElement = document.getElementById('current-turn');
        const redPlayerInfo = document.querySelector('.game-header .player-info.red-player');
        const bluePlayerInfo = document.querySelector('.game-header .player-info.blue-player');

        // Remove current turn indicators
        redPlayerInfo.classList.remove('current-turn');
        bluePlayerInfo.classList.remove('current-turn');

        // Add current turn indicator
        if (gameState.currentTurn === 'red') {
            currentTurnElement.textContent = `${gameState.players.red.name}'s Turn`;
            redPlayerInfo.classList.add('current-turn');
        } else {
            currentTurnElement.textContent = `${gameState.players.blue.name}'s Turn`;
            bluePlayerInfo.classList.add('current-turn');
        }
    }

    showEndScreen() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('end-screen').classList.add('active');

        // Update end screen content
        const winnerAnnouncement = document.getElementById('winner-announcement');
        const redFinalScore = document.getElementById('red-final-score');
        const blueFinalScore = document.getElementById('blue-final-score');
        const finalTime = document.getElementById('final-time');
        const totalTurns = document.getElementById('total-turns');

        if (gameState.winner === 'tie') {
            winnerAnnouncement.textContent = "It's a Tie!";
            winnerAnnouncement.className = 'tie-game';
        } else {
            const winnerName = gameState.players[gameState.winner].name;
            winnerAnnouncement.textContent = `${winnerName} Wins!`;
            winnerAnnouncement.className = `${gameState.winner}-winner`;
        }

        redFinalScore.textContent = `${gameState.players.red.name}: ${gameState.players.red.matchCount}`;
        blueFinalScore.textContent = `${gameState.players.blue.name}: ${gameState.players.blue.matchCount}`;
        finalTime.textContent = gameState.getFormattedTime();
        totalTurns.textContent = gameState.totalTurns;
    }

    cleanupEventListeners() {
        // Remove any existing event listeners from cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.replaceWith(card.cloneNode(true)