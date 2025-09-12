class PerplexityChatWidget {
    constructor() {
        this.apiKey = localStorage.getItem('perplexity_api_key');
        this.isOpen = false;
        this.quizSpec = `## Overview

This schema defines the structure for a multi-choice quiz application with comprehensive metadata tracking, dynamic section management, and detailed question specifications. The schema supports educational content with percentage-based topic distribution and extensive question metadata.

## Root Schema Structure

### Top-Level Properties

|Property|Type|Required|Description|
|--|--|--|--|
|\`metadata\`|object|✅|Comprehensive quiz information and statistics|
|\`questions\`|array|✅|Array of quiz questions with detailed metadata|

## Questions Section

### Question Object Schema

Each question must include:

|Field|Type|Required|Format|Description|
|--|--|--|--|--|
|\`id\`|integer|✅|Sequential from 1|Unique question identifier|
|\`section\`|string|✅|1+ characters|Primary content area name|
|\`subsection\`|string|✅|1-100 characters|Specific subtopic within section|
|\`question\`|string|✅|10-1000 characters|The actual question text|
|\`choices\`|array|✅|Exactly 4 strings|Multiple choice options|
|\`correct_answer\`|string|✅|A, B, C, or D|Letter designation of correct answer|
|\`explanation\`|string|✅|10-500 characters|Detailed answer explanation|
|\`source\`|string|✅|3-100 characters|Reference citation|

#### Choice Array Requirements

Length: Exactly 4 elements
Format: Each choice must be prefixed with letter and parenthesis:
\`"A) [option text]"\`
\`"B) [option text]"\`
\`"C) [option text]"\`
\`"D) [option text]"\`

## Metadata Structure

The metadata object must include:

|Field|Type|Required|Description|
|--|--|--|--|
|\`quiz_name\`|string|✅|Descriptive quiz title|
|\`total_questions\`|integer|✅|Total number of questions in file|
|\`batch_range\`|string|✅|Format: "number-number"|
|\`question_id_range\`|string|✅|Format: "1-[total_questions]"|
|\`created_date\`|string|✅|Format: YYYY-MM-DD|
|\`gen_model_used\`|string|✅|AI model used for generation|
|\`file_description\`|string|✅|Comprehensive description of contents|
|\`content_areas\`|array|✅|Array of content area objects|
|\`sources\`|array|✅|Array of source references|
|\`special_features\`|array|✅|Array of special feature descriptions|

### Content Area Objects

Each content area must include:

|Field|Type|Required|Description|
|--|--|--|--|
|\`name\`|string|✅|Content area name|
|\`weight\`|string|✅|Percentage with % symbol|
|\`questions_in_file\`|integer|✅|Actual question count|
|\`percentage\`|string|✅|Calculated percentage with % symbol|

## Validation Rules & Constraints

### Cross-Field Validation
- Every \`questions[].section\` must correspond to a \`content_areas[].name\`
- \`correct_answer\` must match an existing choice letter (A-D)
- Question IDs should be consecutive integers starting from 1
- \`content_areas[].questions_in_file\` should sum to approximately \`total_questions\`

### Data Integrity Checks
- All required string fields must be non-empty
- Date format must follow YYYY-MM-DD pattern
- Percentage strings must end with "%" symbol
- Range strings must follow "number-number" pattern
- Choice arrays must contain exactly 4 items with proper letter prefixes

This specification ensures consistent data structure, enables comprehensive quiz management, and supports educational content across different subject areas and examination types.`;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkApiKey();
    }

    bindEvents() {
        const chatBubble = document.getElementById('chat-bubble');
        const chatModal = document.getElementById('chat-modal');
        const closeBtn = document.getElementById('close-chat');
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        const saveApiKeyBtn = document.getElementById('save-api-key');
        const cancelApiKeyBtn = document.getElementById('cancel-api-key');
        const generateQuizBtn = document.getElementById('generate-quiz-btn');

        chatBubble?.addEventListener('click', () => this.toggleChat());
        closeBtn?.addEventListener('click', () => this.closeChat());
        sendBtn?.addEventListener('click', () => this.sendMessage());
        generateQuizBtn?.addEventListener('click', () => this.generateQuiz());
        
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        saveApiKeyBtn?.addEventListener('click', () => this.saveApiKey());
        cancelApiKeyBtn?.addEventListener('click', () => this.hideApiKeyModal());
    }

    checkApiKey() {
        if (!this.apiKey) {
            this.showApiKeyModal();
        }
    }

    showApiKeyModal() {
        const modal = document.getElementById('api-key-modal');
        modal?.classList.remove('hidden');
    }

    hideApiKeyModal() {
        const modal = document.getElementById('api-key-modal');
        modal?.classList.add('hidden');
    }

    saveApiKey() {
        const input = document.getElementById('api-key-input');
        const apiKey = input?.value.trim();
        
        if (apiKey) {
            this.apiKey = apiKey;
            localStorage.setItem('perplexity_api_key', apiKey);
            this.hideApiKeyModal();
            input.value = '';
        } else {
            alert('Please enter a valid API key');
        }
    }

    toggleChat() {
        if (!this.apiKey) {
            this.showApiKeyModal();
            return;
        }

        const modal = document.getElementById('chat-modal');
        if (this.isOpen) {
            this.closeChat();
        } else {
            modal?.classList.remove('hidden');
            this.isOpen = true;
            document.getElementById('topic-input')?.focus();
        }
    }

    closeChat() {
        const modal = document.getElementById('chat-modal');
        modal?.classList.add('hidden');
        this.isOpen = false;
    }

// Fix for the generateQuiz function in chat-widget.js

async generateQuiz() {
    const topicInput = document.getElementById('topic-input');
    const questionCountSelect = document.getElementById('quiz-question-count');
    const topic = topicInput?.value.trim();
    const questionCount = questionCountSelect?.value || '25';
    
    if (!topic || !this.apiKey) {
        this.addMessage('Please enter a topic and ensure your API key is set.', 'bot');
        return;
    }

    // Add user message to chat
    this.addMessage(`Generate ${questionCount} questions on: ${topic}`, 'user');
    topicInput.value = '';
    
    // Show loading
    this.showLoading();

    try {
        const response = await this.callPerplexityAPI(topic, questionCount);
        this.hideLoading();
        
        // Clean the response - remove markdown code blocks if present
        let cleanedResponse = response.trim();
        
        // Remove markdown code block markers if they exist
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/^```[^\n]*\n/, '').replace(/\n```$/, '');
        }
        
        // Try to parse as JSON
        try {
            const quizData = JSON.parse(cleanedResponse);
            
            // Validate that it has the required structure
            if (quizData.questions && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
                this.handleQuizGenerated(quizData, topic);
            } else {
                throw new Error('Invalid quiz structure - missing questions array');
            }
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            
            // Show the response and provide manual options
            this.addMessage('Quiz content generated! The response needs to be cleaned up:', 'bot');
            
            // Add a download button for the raw response
            this.addRawDownloadButton(cleanedResponse, topic);
            
            // Provide instructions
            this.addMessage('You can download the raw response above, clean it manually, and upload it to the quiz app.', 'bot');
        }
    } catch (error) {
        this.hideLoading();
        this.addMessage('Sorry, I encountered an error generating the quiz. Please try again.', 'bot');
        console.error('Perplexity API Error:', error);
    }
}

// Add this new method to handle raw downloads
addRawDownloadButton(content, topic) {
    const messagesContainer = document.getElementById('chat-messages');
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'message bot-message';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn--primary btn--sm';
    downloadBtn.textContent = '📥 Download Raw JSON';
    downloadBtn.style.margin = '5px';
    
    const tryParseBtn = document.createElement('button');
    tryParseBtn.className = 'btn btn--secondary btn--sm';
    tryParseBtn.textContent = '🔧 Try Manual Parse';
    tryParseBtn.style.margin = '5px';
    
    downloadBtn.addEventListener('click', () => {
        this.downloadRawContent(content, topic);
    });
    
    tryParseBtn.addEventListener('click', () => {
        this.showManualParseDialog(content, topic);
    });
    
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(tryParseBtn);
    messagesContainer?.appendChild(buttonContainer);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Method to download raw content
downloadRawContent(content, topic) {
    const filename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_raw_quiz.txt`;
    const dataBlob = new Blob([content], { type: 'text/plain' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.addMessage(`📁 Downloaded raw content: ${filename}`, 'bot');
    this.addMessage('Clean up the content and save as .json file, then upload to the quiz app.', 'bot');
}

// Method to show manual parsing options
showManualParseDialog(content, topic) {
    // Create a simple dialog for manual JSON cleaning
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        max-width: 80%;
        max-height: 80%;
        overflow: auto;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    dialog.innerHTML = `
        <h3>Manual JSON Cleanup</h3>
        <p>Clean up the content below and click "Try Parse" when ready:</p>
        <textarea id="manual-json-content" style="width: 100%; height: 300px; font-family: monospace;">${content}</textarea>
        <div style="margin-top: 10px;">
            <button id="try-parse-json" class="btn btn--primary">Try Parse JSON</button>
            <button id="close-manual-dialog" class="btn btn--secondary">Cancel</button>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event listeners
    document.getElementById('try-parse-json').addEventListener('click', () => {
        const cleanedContent = document.getElementById('manual-json-content').value.trim();
        try {
            const quizData = JSON.parse(cleanedContent);
            this.handleQuizGenerated(quizData, topic);
            document.body.removeChild(dialog);
        } catch (error) {
            alert('Still not valid JSON. Please check the format.');
        }
    });
    
    document.getElementById('close-manual-dialog').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
}

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input?.value.trim();
        if (!message || !this.apiKey) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';

        // Show loading
        this.showLoading();

        try {
            const response = await this.callPerplexityAPI(message, '25');
            this.hideLoading();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideLoading();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            console.error('Perplexity API Error:', error);
        }
    }

    async callPerplexityAPI(topic, questionCount) {
        const systemPrompt = `You are an expert quiz generator. Create a ${questionCount}-question multiple choice quiz on the topic provided by the user.

CRITICAL: You must return ONLY valid JSON that matches this exact schema:

${this.quizSpec}

The response must be valid JSON that can be directly parsed and used by the quiz application. Do not include any explanatory text before or after the JSON.

Generate questions that are:
- Educational and challenging
- Appropriate for the topic
- Well-distributed across relevant subtopics
- Include clear explanations for correct answers
- Cite appropriate sources

Return only the JSON object, nothing else.`;

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: `Create a ${questionCount}-question quiz on: ${topic}`
                    }
                ],
                max_tokens: 4000,
                temperature: 0.1,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    }

    handleQuizGenerated(quizData, topic) {
        // Validate the quiz data
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            this.addMessage('Generated quiz has invalid format. Please try again.', 'bot');
            return;
        }

        this.addMessage(`✅ Successfully generated ${quizData.questions.length} questions on "${topic}"!`, 'bot');
        
        // Create download button
        this.createDownloadButton(quizData, topic);
        
        // Offer to load into quiz app
        this.addMessage('You can download the quiz file or load it directly into the quiz application.', 'bot');
    }

    createDownloadButton(quizData, topic) {
        const messagesContainer = document.getElementById('chat-messages');
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'message bot-message';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn btn--primary btn--sm';
        downloadBtn.textContent = '📥 Download Quiz JSON';
        downloadBtn.style.margin = '5px';
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn--secondary btn--sm';
        loadBtn.textContent = '🚀 Load into App';
        loadBtn.style.margin = '5px';
        
        downloadBtn.addEventListener('click', () => {
            this.downloadQuizFile(quizData, topic);
        });
        
        loadBtn.addEventListener('click', () => {
            this.loadIntoApp(quizData);
        });
        
        buttonContainer.appendChild(downloadBtn);
        buttonContainer.appendChild(loadBtn);
        messagesContainer?.appendChild(buttonContainer);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    downloadQuizFile(quizData, topic) {
        const filename = `${topic.replace(/[^a-zA-Z0-9]/g, '_')}_quiz.json`;
        const dataStr = JSON.stringify(quizData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.addMessage(`📁 Downloaded: ${filename}`, 'bot');
    }

    loadIntoApp(quizData) {
        // Store the generated quiz in the app state
        if (typeof window.appState !== 'undefined') {
            window.appState.loadedDatabase = {
                name: 'Generated Quiz',
                quiz_name: quizData.metadata?.quiz_name || 'Generated Quiz',
                questions: quizData.questions.map(q => this.normalizeQuestion(q)),
                sectionCounts: this.calculateSectionCounts(quizData.questions),
                totalQuestions: quizData.questions.length
            };
            window.appState.databaseLoaded = true;
            
            // Update the file name display
            const fileNameSpan = document.getElementById('file-name');
            if (fileNameSpan) {
                fileNameSpan.textContent = 'Generated Quiz (from AI)';
            }
            
            // Trigger form validation
            if (typeof window.validateForm === 'function') {
                window.validateForm();
            }
            
            // Show database info
            if (typeof window.showDatabaseInfo === 'function') {
                window.showDatabaseInfo();
            }
            
            this.addMessage('✅ Quiz loaded into the application! You can now start the test.', 'bot');
            this.closeChat();
        } else {
            this.addMessage('❌ Could not load into app. Please download and upload manually.', 'bot');
        }
    }

    normalizeQuestion(question) {
        return {
            id: question.id || Math.random().toString(36).substr(2, 9),
            section: question.section,
            subsection: question.subsection || '',
            question: question.question,
            options: question.choices.map((choice, index) => ({
                letter: String.fromCharCode(65 + index),
                text: choice
            })),
            correctAnswer: question.correct_answer,
            explanation: question.explanation || 'No explanation provided.',
            source: question.source || 'AI Generated'
        };
    }

    calculateSectionCounts(questions) {
        const counts = {};
        questions.forEach(q => {
            counts[q.section] = (counts[q.section] || 0) + 1;
        });
        return counts;
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        messagesContainer?.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showLoading() {
        const loadingDiv = document.getElementById('loading');
        loadingDiv?.classList.remove('hidden');
        document.getElementById('send-btn').disabled = true;
        document.getElementById('generate-quiz-btn').disabled = true;
    }

    hideLoading() {
        const loadingDiv = document.getElementById('loading');
        loadingDiv?.classList.add('hidden');
        document.getElementById('send-btn').disabled = false;
        document.getElementById('generate-quiz-btn').disabled = false;
    }
}

// Initialize the chat widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PerplexityChatWidget();
});