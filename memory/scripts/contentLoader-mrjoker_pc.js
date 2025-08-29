class ContentLoader {
    constructor() {
        this.contentSets = new Map();
        this.loadDefaultContent();
    }

    async loadContentSet(contentId) {
        if (this.contentSets.has(contentId)) {
            return this.contentSets.get(contentId);
        }

        try {
            const response = await fetch(`content/content-${contentId}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load content: ${response.status}`);
            }
            
            const contentData = await response.json();
            this.validateContentSchema(contentData);
            this.contentSets.set(contentId, contentData);
            return contentData;
        } catch (error) {
            console.error('Error loading content:', error);
            return this.getDefaultContent();
        }
    }

    validateContentSchema(contentData) {
        if (!contentData.contentMetadata || !contentData.cardPairs) {
            throw new Error('Invalid content schema: missing required fields');
        }

        if (!Array.isArray(contentData.cardPairs) || contentData.cardPairs.length < 8) {
            throw new Error('Content must have at least 8 card pairs');
        }

        contentData.cardPairs.forEach((pair, index) => {
            if (!pair.pairId || !pair.matchContent || !pair.card1 || !pair.card2) {
                throw new Error(`Invalid pair at index ${index}: missing required fields`);
            }
        });
    }

    selectRandomPairs(contentData, pairCount) {
        const availablePairs = [...contentData.cardPairs];
        const selectedPairs = [];

        // Apply weighted selection
        for (let i = 0; i < pairCount && availablePairs.length > 0; i++) {
            const weights = availablePairs.map(pair => {
                const weight1 = pair.card1.metadata?.weight || 5;
                const weight2 = pair.card2.metadata?.weight || 5;
                return (weight1 + weight2) / 2;
            });

            const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
            let random = Math.random() * totalWeight;
            
            let selectedIndex = 0;
            for (let j = 0; j < weights.length; j++) {
                random -= weights[j];
                if (random <= 0) {
                    selectedIndex = j;
                    break;
                }
            }

            selectedPairs.push(availablePairs[selectedIndex]);
            availablePairs.splice(selectedIndex, 1);
        }

        return selectedPairs;
    }

    generateGameCards(selectedPairs) {
        const cards = [];
        let cardIdCounter = 1;

        selectedPairs.forEach((pair, pairIndex) => {
            // Create two cards for each pair
            const card1 = {
                id: cardIdCounter++,
                pairId: `pair_${pairIndex + 1}`,
                displayContent: pair.card1.displayContent,
                parameterLeft: pair.card1.parameterLeft,
                parameterRight: pair.card1.parameterRight,
                isFlipped: false,
                isMatched: false,
                matchedBy: null
            };

            const card2 = {
                id: cardIdCounter++,
                pairId: `pair_${pairIndex + 1}`,
                displayContent: pair.card2.displayContent,
                parameterLeft: pair.card2.parameterLeft,
                parameterRight: pair.card2.parameterRight,
                isFlipped: false,
                isMatched: false,
                matchedBy: null
            };

            cards.push(card1, card2);
        });

        // Shuffle the cards
        return this.shuffleArray(cards);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    loadDefaultContent() {
        // Default content as fallback
        const defaultContent = {
            contentMetadata: {
                version: "1.0.0",
                title: "Default Vocabulary Set",
                description: "Basic vocabulary words for memory game",
                category: "vocabulary",
                difficulty: "beginner",
                totalPairs: 15
            },
            cardPairs: [
                {
                    pairId: "pair_001",
                    matchContent: "APPLE",
                    card1: {
                        cardId: "card_001_a",
                        displayContent: "APPLE",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 5, tags: ["fruit", "food"] }
                    },
                    card2: {
                        cardId: "card_001_b", 
                        displayContent: "APPLE",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 5, tags: ["fruit", "food"] }
                    }
                },
                {
                    pairId: "pair_002",
                    matchContent: "HOUSE",
                    card1: {
                        cardId: "card_002_a",
                        displayContent: "HOUSE",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 6, tags: ["building"] }
                    },
                    card2: {
                        cardId: "card_002_b",
                        displayContent: "HOUSE", 
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 6, tags: ["building"] }
                    }
                },
                {
                    pairId: "pair_003",
                    matchContent: "CAR",
                    card1: {
                        cardId: "card_003_a",
                        displayContent: "CAR",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 7, tags: ["vehicle"] }
                    },
                    card2: {
                        cardId: "card_003_b",
                        displayContent: "CAR",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 7, tags: ["vehicle"] }
                    }
                },
                {
                    pairId: "pair_004",
                    matchContent: "BOOK",
                    card1: {
                        cardId: "card_004_a",
                        displayContent: "BOOK",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 5, tags: ["education"] }
                    },
                    card2: {
                        cardId: "card_004_b",
                        displayContent: "BOOK",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 5, tags: ["education"] }
                    }
                },
                {
                    pairId: "pair_005",
                    matchContent: "TREE",
                    card1: {
                        cardId: "card_005_a",
                        displayContent: "TREE",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 6, tags: ["nature"] }
                    },
                    card2: {
                        cardId: "card_005_b",
                        displayContent: "TREE",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 6, tags: ["nature"] }
                    }
                },
                {
                    pairId: "pair_006",
                    matchContent: "WATER",
                    card1: {
                        cardId: "card_006_a",
                        displayContent: "WATER",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 8, tags: ["nature", "basic"] }
                    },
                    card2: {
                        cardId: "card_006_b",
                        displayContent: "WATER",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 8, tags: ["nature", "basic"] }
                    }
                },
                {
                    pairId: "pair_007",
                    matchContent: "SUN",
                    card1: {
                        cardId: "card_007_a",
                        displayContent: "SUN",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 7, tags: ["nature", "space"] }
                    },
                    card2: {
                        cardId: "card_007_b",
                        displayContent: "SUN",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 7, tags: ["nature", "space"] }
                    }
                },
                {
                    pairId: "pair_008",
                    matchContent: "MOON",
                    card1: {
                        cardId: "card_008_a",
                        displayContent: "MOON",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 6, tags: ["nature", "space"] }
                    },
                    card2: {
                        cardId: "card_008_b",
                        displayContent: "MOON",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 6, tags: ["nature", "space"] }
                    }
                },
                {
                    pairId: "pair_009",
                    matchContent: "FISH",
                    card1: {
                        cardId: "card_009_a",
                        displayContent: "FISH",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 5, tags: ["animal", "water"] }
                    },
                    card2: {
                        cardId: "card_009_b",
                        displayContent: "FISH",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 5, tags: ["animal", "water"] }
                    }
                },
                {
                    pairId: "pair_010",
                    matchContent: "BIRD",
                    card1: {
                        cardId: "card_010_a",
                        displayContent: "BIRD",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 6, tags: ["animal", "sky"] }
                    },
                    card2: {
                        cardId: "card_010_b",
                        displayContent: "BIRD",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 6, tags: ["animal", "sky"] }
                    }
                },
                {
                    pairId: "pair_011",
                    matchContent: "FLOWER",
                    card1: {
                        cardId: "card_011_a",
                        displayContent: "FLOWER",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 4, tags: ["nature", "plant"] }
                    },
                    card2: {
                        cardId: "card_011_b",
                        displayContent: "FLOWER",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 4, tags: ["nature", "plant"] }
                    }
                },
                {
                    pairId: "pair_012",
                    matchContent: "CHAIR",
                    card1: {
                        cardId: "card_012_a",
                        displayContent: "CHAIR",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 8, tags: ["furniture", "home"] }
                    },
                    card2: {
                        cardId: "card_012_b",
                        displayContent: "CHAIR",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 8, tags: ["furniture", "home"] }
                    }
                },
                {
                    pairId: "pair_013",
                    matchContent: "BALL",
                    card1: {
                        cardId: "card_013_a",
                        displayContent: "BALL",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 9, tags: ["toy", "sport"] }
                    },
                    card2: {
                        cardId: "card_013_b",
                        displayContent: "BALL",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 9, tags: ["toy", "sport"] }
                    }
                },
                {
                    pairId: "pair_014",
                    matchContent: "PHONE",
                    card1: {
                        cardId: "card_014_a",
                        displayContent: "PHONE",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 7, tags: ["technology"] }
                    },
                    card2: {
                        cardId: "card_014_b",
                        displayContent: "PHONE",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 7, tags: ["technology"] }
                    }
                },
                {
                    pairId: "pair_015",
                    matchContent: "STAR",
                    card1: {
                        cardId: "card_015_a",
                        displayContent: "STAR",
                        parameterLeft: null,
                        parameterRight: null,
                        metadata: { weight: 3, tags: ["space", "night"] }
                    },
                    card2: {
                        cardId: "card_015_b",
                        displayContent: "STAR",
                        parameterLeft: null,
             