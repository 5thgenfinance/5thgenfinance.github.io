class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.gameMode = null;
        this.players = {
            red: {
                name: '',
                matchCount: 0,
                color: '#ff4444',
                isCurrentPlayer: false
            },
            blue: {
                name: '',
                matchCount: 0,
                color: '#4444ff',
                isCurrentPlayer: false
            }
        };
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = [];
        this.currentTurn = 'red';
        this.gameStatus = 'setup';
        this.startTime = null;
        this.totalTurns = 0;
        this.winner = null;
        this.selectedContent = null;
        this.gameTimer = null;
        this.elapsedTime = 0;
    }

    setPlayers(redName, blueName) {
        this.players.red.name = redName;
        this.players.blue.name = blueName;
        this.players.red.isCurrentPlayer = true;
        this.players.blue.isCurrentPlayer = false;
    }

    setGameMode(mode) {
        this.gameMode = mode;
    }

    setSelectedContent(contentSet) {
        this.selectedContent = contentSet;
    }

    startGame() {
        this.gameStatus = 'playing';
        this.startTime = Date.now();
        this.startTimer();
    }

    startTimer() {
        this.gameTimer = setInterval(() => {
            this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        const timerElement = document.getElementById('game-timer');
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === 'red' ? 'blue' : 'red';
        this.players.red.isCurrentPlayer = this.currentTurn === 'red';
        this.players.blue.isCurrentPlayer = this.currentTurn === 'blue';
        this.totalTurns++;
    }

    addMatch(pairId, playerId) {
        const matchedPair = {
            pairId: pairId,
            matchedBy: playerId,
            matchedAt: Date.now(),
            cardIds: this.cards.filter(card => card.pairId === pairId).map(card => card.id)
        };
        
        this.matchedPairs.push(matchedPair);
        this.players[playerId].matchCount++;
        
        // Mark cards as matched
        this.cards.forEach(card => {
            if (card.pairId === pairId) {
                card.isMatched = true;
                card.matchedBy = playerId;
            }
        });
    }

    checkGameComplete() {
        const totalPairs = this.gameMode === 'easy' ? 8 : 12;
        const matchedPairs = this.matchedPairs.length;
        
        if (matchedPairs === totalPairs) {
            this.gameStatus = 'completed';
            this.endGame();
            return true;
        }
        return false;
    }

    endGame() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        const redScore = this.players.red.matchCount;
        const blueScore = this.players.blue.matchCount;
        
        if (redScore > blueScore) {
            this.winner = 'red';
        } else if (blueScore > redScore) {
            this.winner = 'blue';
        } else {
            this.winner = 'tie';
        }
    }

    getFormattedTime() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        return `${minutes.toString().pa