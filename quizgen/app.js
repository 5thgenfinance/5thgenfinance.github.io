// Application State
let appState = {
    databaseLoaded: false,
    loadedDatabase: null,
    questionCount: 130,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 10800, // 3 hours in seconds
    timerInterval: null,
    suspended: false,
    testStartTime: null,
    testCompleted: false,
	elapsedTime: 0,          // seconds spent in current test
	elapsedInterval: null    // interval ID for stopwatch	
};

// Section Distribution
const sectionDistribution = {
    "Economic Factors and Business Information": 0.15,
    "Investment Vehicle Characteristics": 0.25,
    "Client Investment Recommendations and Strategies": 0.30,
    "Laws, Regulations and Guidelines": 0.30
};

// Alternative section names mapping
const sectionMapping = {
    "Economic Factors": "Economic Factors and Business Information",
    "Investment Vehicles": "Investment Vehicle Characteristics",
    "Client Recommendations": "Client Investment Recommendations and Strategies",
    "Laws & Regulations": "Laws, Regulations and Guidelines"
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
});

function initializeApp() {
    console.log('Initializing application...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize form state
    validateForm();
    
    // Show home page
    showPage('home-page');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // File input handling
    const fileInput = document.getElementById('database-file');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Question count selection
    const questionCountSelect = document.getElementById('question-count');
    if (questionCountSelect) {
        questionCountSelect.addEventListener('change', function(e) {
            console.log('Question count changed to:', e.target.value);
            appState.questionCount = parseInt(e.target.value);
            validateForm();
        });
        
        // Ensure dropdown is functional
        questionCountSelect.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Start test button
    const startTestBtn = document.getElementById('start-test');
    if (startTestBtn) {
        startTestBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Start test clicked, database loaded:', appState.databaseLoaded);
            if (appState.databaseLoaded) {
                startTest();
            } else {
                showError('Please select and load a database file first.');
            }
        });
    }
    
    // Test page navigation
    const prevBtn = document.getElementById('prev-question');
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            previousQuestion();
        });
    }
    
    const nextBtn = document.getElementById('next-question');
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            nextQuestion();
        });
    }
    
    // Test controls
    const suspendBtn = document.getElementById('suspend-test');
    if (suspendBtn) {
        suspendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            suspendTest();
        });
    }
    
    const submitBtn = document.getElementById('submit-test');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            submitTest();
        });
    }
    
    // Modal controls
    const resumeBtn = document.getElementById('resume-test');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            resumeTest();
        });
    }
    
    const endTestBtn = document.getElementById('end-test');
    if (endTestBtn) {
        endTestBtn.addEventListener('click', function(e) {
            e.preventDefault();
            endTest();
        });
    }
    
    // Results page controls
    const viewCorrectionsBtn = document.getElementById('view-corrections');
    if (viewCorrectionsBtn) {
        viewCorrectionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showCorrections();
        });
    }
    
    const printResultsBtn = document.getElementById('print-results');
    if (printResultsBtn) {
        printResultsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            printResults();
        });
    }
    
    const newTestBtn = document.getElementById('new-test');
    if (newTestBtn) {
        newTestBtn.addEventListener('click', function(e) {
            e.preventDefault();
            newTest();
        });
    }
    
    // Corrections page controls
    const backToResultsBtn = document.getElementById('back-to-results');
    if (backToResultsBtn) {
        backToResultsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            backToResults();
        });
    }
    
    const printCorrectionsBtn = document.getElementById('print-corrections');
    if (printCorrectionsBtn) {
        printCorrectionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            printCorrections();
        });
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileNameSpan = document.getElementById('file-name');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const databaseInfo = document.getElementById('database-info');
    
    console.log('File selected:', file ? file.name : 'none');
    
    // Reset UI state
    hideError();
    hideDatabaseInfo();
    
    if (!file) {
        fileNameSpan.textContent = 'No file selected';
        appState.databaseLoaded = false;
        appState.loadedDatabase = null;
        validateForm();
        return;
    }
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.json')) {
        showError('Please select a JSON file.');
        event.target.value = '';
        fileNameSpan.textContent = 'No file selected';
        appState.databaseLoaded = false;
        appState.loadedDatabase = null;
        validateForm();
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size too large. Please select a file smaller than 10MB.');
        event.target.value = '';
        fileNameSpan.textContent = 'No file selected';
        appState.databaseLoaded = false;
        appState.loadedDatabase = null;
        validateForm();
        return;
    }
    
    fileNameSpan.textContent = file.name;
    showLoading();
    
    // Read and parse the file
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            validateAndLoadDatabase(jsonData, file.name);
        } catch (error) {
            console.error('JSON parsing error:', error);
            showError('Invalid JSON file. Please check the file format.');
            hideLoading();
            event.target.value = '';
            fileNameSpan.textContent = 'No file selected';
            appState.databaseLoaded = false;
            appState.loadedDatabase = null;
            validateForm();
        }
		displaySectionTopics();
    };
    
    reader.onerror = function() {
        showError('Error reading file. Please try again.');
        hideLoading();
        event.target.value = '';
        fileNameSpan.textContent = 'No file selected';
        appState.databaseLoaded = false;
        appState.loadedDatabase = null;
        validateForm();
    };
    
    reader.readAsText(file);
}

function validateAndLoadDatabase(jsonData, fileName) {
    try {
        // Check if data has questions array
        let questions = jsonData.questions || jsonData;
        
        if (!Array.isArray(questions)) {
            throw new Error('Database must contain an array of questions');
        }
        
        if (questions.length === 0) {
            throw new Error('Database contains no questions');
        }
        
        // Validate question structure
        const sampleQuestion = questions[0];
        const requiredFields = ['question', 'section'];
        
        for (let field of requiredFields) {
            if (!sampleQuestion[field]) {
                throw new Error(`Questions must have a '${field}' field`);
            }
        }
        
        // Check for answer choices (either format)
        if (!sampleQuestion.choices && (!sampleQuestion.optionA || !sampleQuestion.optionB)) {
            throw new Error('Questions must have answer choices (either "choices" array or "optionA", "optionB", etc.)');
        }
        
        // Check for correct answer
        if (!sampleQuestion.correct_answer && !sampleQuestion.correctAnswer) {
            throw new Error('Questions must have a correct answer field');
        }
        
        // Normalize questions
        const normalizedQuestions = questions.map(normalizeQuestion);
        
        // Group questions by section
        const sectionCounts = {};
        normalizedQuestions.forEach(q => {
            const section = mapSection(q.section);
            sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        });
        
        // Store loaded database
        appState.loadedDatabase = {
            name: fileName,
		    quiz_name: jsonData.metadata.quiz_name || "Quiz",
			section_topics: jsonData.section_topics || [],	
            questions: normalizedQuestions,
            sectionCounts: sectionCounts,
            totalQuestions: normalizedQuestions.length
        };
        
		// *** INSERT OPTION 2 CODE HERE ***
		// Create CSS class mapping once
		appState.sectionTopics = appState.loadedDatabase.section_topics || [];
		appState.sectionCSSClasses = {};
		const cssClassRotation = ['status--info', 'status--success', 'status--warning', 'status--error'];

		if (appState.sectionTopics.length > 0) {
			appState.sectionTopics.forEach((topic, index) => {
				appState.sectionCSSClasses[topic.name] = cssClassRotation[index % cssClassRotation.length];
			});
		} else {
			// Fallback for legacy JSON
			appState.sectionCSSClasses = {
				'Economic Factors and Business Information': 'status--info',
				'Investment Vehicle Characteristics': 'status--success',
				'Client Investment Recommendations and Strategies': 'status--warning',
				'Laws, Regulations and Guidelines': 'status--error'
			};
		}
		// *** END OPTION 2 CODE ***
		
        appState.databaseLoaded = true;
        console.log('Database loaded successfully:', fileName, 'with', normalizedQuestions.length, 'questions');
        
        hideLoading();
        showDatabaseInfo();
        validateForm();
        
    } catch (error) {
        console.error('Database validation error:', error);
        showError(`Database validation failed: ${error.message}`);
        hideLoading();
        appState.databaseLoaded = false;
        appState.loadedDatabase = null;
        validateForm();
    }
}

function normalizeQuestion(question) {
    // Handle both formats: optionA/B/C/D and choices array
    let options = [];
    let correctAnswer = '';
    
    if (question.optionA) {
        // Format 1: optionA, optionB, optionC, optionD
        options = [
            { letter: 'A', text: question.optionA },
            { letter: 'B', text: question.optionB },
            { letter: 'C', text: question.optionC },
            { letter: 'D', text: question.optionD }
        ];
        correctAnswer = question.correctAnswer;
    } else if (question.choices) {
        // Format 2: choices array
        options = question.choices.map((choice, index) => ({
            letter: String.fromCharCode(65 + index), // A, B, C, D
            text: choice
        }));
        correctAnswer = question.correct_answer;
    }
    
    return {
        id: question.id || Math.random().toString(36).substr(2, 9),
        section: question.section,
        subsection: question.subsection || '',
        question: question.question,
        options: options,
        correctAnswer: correctAnswer,
        explanation: question.explanation || 'No explanation provided.',
		source: question.source || 'No source provided.'
    };
}

function mapSection(sectionName) {
    // Map alternative section names to standard ones
    return sectionMapping[sectionName] || sectionName;
}

function showDatabaseInfo() {
    const databaseInfo = document.getElementById('database-info');
    const totalQuestions = document.getElementById('total-questions');
    const sectionsBreakdown = document.getElementById('sections-breakdown');
    
    if (databaseInfo && appState.loadedDatabase) {
        totalQuestions.textContent = appState.loadedDatabase.totalQuestions;
        
        // Show sections breakdown
        sectionsBreakdown.innerHTML = '';
        Object.entries(appState.loadedDatabase.sectionCounts).forEach(([section, count]) => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'section-count';
            sectionElement.innerHTML = `
                <span class="section-count-name">${section}</span>
                <span class="section-count-value">${count} questions</span>
            `;
            sectionsBreakdown.appendChild(sectionElement);
        });
        
        databaseInfo.style.display = 'block';
    }
}

function hideDatabaseInfo() {
    const databaseInfo = document.getElementById('database-info');
    if (databaseInfo) {
        databaseInfo.style.display = 'none';
    }
}

function showLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function hideError() {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

function validateForm() {
    const isValid = appState.databaseLoaded && appState.loadedDatabase;
    const startTestBtn = document.getElementById('start-test');
    
    console.log('Validating form. Database loaded:', appState.databaseLoaded, 'Is valid:', isValid);
    
    if (startTestBtn) {
        startTestBtn.disabled = !isValid;
        
        // Update button styling for disabled state
        if (isValid) {
            startTestBtn.classList.remove('btn--disabled');
            startTestBtn.style.opacity = '1';
            startTestBtn.style.cursor = 'pointer';
        } else {
            startTestBtn.classList.add('btn--disabled');
            startTestBtn.style.opacity = '0.5';
            startTestBtn.style.cursor = 'not-allowed';
        }
    }
}

function startTest() {
    console.log('Starting test...');
    
    if (!appState.databaseLoaded || !appState.loadedDatabase) {
        showError('Please load a valid database file first.');
        return;
    }
    
    // --- START ELAPSED TIME STOPWATCH ------------------------
	appState.elapsedTime = 0;
	if (appState.elapsedInterval) clearInterval(appState.elapsedInterval);
	appState.elapsedInterval = setInterval(() => {
	  // pause counting if test is suspended
	  if (!appState.suspended) appState.elapsedTime += 1;
	}, 1000);
	// --- END ELAPSED TIME STOPWATCH --------------------------
	
	const count = appState.questionCount;
    
    // Reset state
    appState.currentQuestionIndex = 0;
    appState.answers = {};
    appState.timeRemaining = 10800; // 3 hours
    appState.suspended = false;
    appState.testStartTime = Date.now();
    appState.testCompleted = false;
	appState.quizName = appState.loadedDatabase.quiz_name || "Quiz";
	elapsedTime: 0;          // seconds spent in current test
	elapsedInterval: null;
	
    
    // Generate test questions
    appState.questions = distributeQuestions(appState.loadedDatabase.questions, count);
    
    console.log('Test started with', appState.questions.length, 'questions');
    
    showPage('test-page');
    startTimer();
    displayQuestion();
    updateNavigation();
}

function distributeQuestions(questions, count) {
    const sections = Object.keys(sectionDistribution);
    const distributed = [];
    
    // Group questions by section
    const questionsBySection = {};
    sections.forEach(section => {
        questionsBySection[section] = questions.filter(q => mapSection(q.section) === section);
    });
    
    // Calculate questions per section
    sections.forEach(section => {
        const sectionCount = Math.round(count * sectionDistribution[section]);
        const sectionQuestions = questionsBySection[section];
        
        if (sectionQuestions.length > 0) {
            // Randomly select questions from this section
            const selected = shuffleArray(sectionQuestions).slice(0, Math.min(sectionCount, sectionQuestions.length));
            distributed.push(...selected);
        }
    });
    
    // If we don't have enough questions, fill with random questions
    while (distributed.length < count && distributed.length < questions.length) {
        const remaining = questions.filter(q => !distributed.find(d => d.id === q.id));
        if (remaining.length > 0) {
            distributed.push(remaining[Math.floor(Math.random() * remaining.length)]);
        } else {
            break;
        }
    }
    
    // Shuffle the final question set
    return shuffleArray(distributed).slice(0, count);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function displayQuestion() {
    const question = appState.questions[appState.currentQuestionIndex];
    if (!question) return;
    
    const quizTitle = document.getElementById('quiz-title'); // Assumes you have <h2 id="quiz-title">...</h2>
	if (quizTitle) quizTitle.textContent = appState.quizName;
	
	// Update question info
    const questionCounter = document.getElementById('question-counter');
    if (questionCounter) {
        questionCounter.textContent = `Question ${appState.currentQuestionIndex + 1} of ${appState.questions.length}`;
    }
    
    const questionSection = document.getElementById('question-section');
    if (questionSection) {
        questionSection.textContent = question.section;
        const sectionClass = getSectionClass(question.section);
        questionSection.className = `status ${sectionClass}`;
    }
    
    const questionNumber = document.getElementById('question-number');
    if (questionNumber) {
        questionNumber.textContent = `Question ${appState.currentQuestionIndex + 1}`;
    }
    
    const questionText = document.getElementById('question-text');
    if (questionText) {
        questionText.textContent = question.question;
    }
    
    // Display options
    const questionOptions = document.getElementById('question-options');
    if (questionOptions) {
        questionOptions.innerHTML = '';
        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'question-option';
            optionElement.setAttribute('data-answer', option.letter);
            
            const isSelected = appState.answers[question.id] === option.letter;
            if (isSelected) {
                optionElement.classList.add('selected');
            }
            
            optionElement.innerHTML = `
                <span class="option-letter">${option.letter}.</span>
                <span class="option-text">${option.text}</span>
            `;
            
            optionElement.addEventListener('click', () => selectAnswer(question.id, option.letter));
            questionOptions.appendChild(optionElement);
        });
    }
    
    // Update progress
    updateProgress();
}

function getSectionClass(section) {
    const mappedSection = mapSection(section);
    return appState.sectionCSSClasses[mappedSection] || 'status--info';
}


function selectAnswer(questionId, answer) {
    appState.answers[questionId] = answer;
    
    // Update visual selection
    const options = document.querySelectorAll('.question-option');
    options.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.answer === answer) {
            option.classList.add('selected');
        }
    });
    
    updateProgress();
}

function displaySectionTopics() {
  const topics = appState.loadedDatabase.section_topics || [];
  const container = document.getElementById('section-topics');
  if (!container) return;

  // Clear any old content
  container.innerHTML = '';

  if (topics.length === 0) {
    container.textContent = 'No section topics specified';
    return;
  }

  // Build list
  const ul = document.createElement('ul');
  topics.forEach(topic => {
    const li = document.createElement('li');
    // Show percent if available
    li.textContent = topic.percent !== undefined
      ? `${topic.name}: ${topic.percent}%`
      : topic.name;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}


function updateProgress() {
    const answered = Object.keys(appState.answers).length;
    const total = appState.questions.length;
    const percentage = Math.round((answered / total) * 100);
    
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    const progressText = document.getElementById('progress-text');
    if (progressText) {
        progressText.textContent = `${percentage}% Complete`;
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prev-question');
    const nextBtn = document.getElementById('next-question');
    
    if (prevBtn) {
        prevBtn.disabled = appState.currentQuestionIndex === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = appState.currentQuestionIndex === appState.questions.length - 1;
    }
}

function previousQuestion() {
    if (appState.currentQuestionIndex > 0) {
        appState.currentQuestionIndex--;
        displayQuestion();
        updateNavigation();
    }
}

function nextQuestion() {
    if (appState.currentQuestionIndex < appState.questions.length - 1) {
        appState.currentQuestionIndex++;
        displayQuestion();
        updateNavigation();
    }
}

function startTimer() {
    appState.timerInterval = setInterval(() => {
        if (!appState.suspended) {
            appState.timeRemaining--;
            updateTimerDisplay();
            
            if (appState.timeRemaining <= 0) {
                submitTest();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timer = document.getElementById('timer');
    if (timer) {
        const hours = Math.floor(appState.timeRemaining / 3600);
        const minutes = Math.floor((appState.timeRemaining % 3600) / 60);
        const seconds = appState.timeRemaining % 60;
        
        timer.textContent = `Time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function suspendTest() {
    appState.suspended = true;
    showModal();
}

function resumeTest() {
    appState.suspended = false;
    hideModal();
}

// Format hh:mm:ss
function formatSeconds(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2,'0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2,'0');
  const s = String(sec % 60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function endTest() {
    clearInterval(appState.timerInterval);
    hideModal();
	stopElapsedTimer();
    showPage('home-page');
}

function stopElapsedTimer() {
  if (appState.elapsedInterval) {
    clearInterval(appState.elapsedInterval);
    appState.elapsedInterval = null;
  }
}

function submitTest() {
    if (!appState.testCompleted) {
        appState.testCompleted = true;
        clearInterval(appState.timerInterval);
		stopElapsedTimer();
        calculateResults();
		const timeSpentSpan = document.getElementById('time-spent');
		if (timeSpentSpan) timeSpentSpan.textContent = formatSeconds(appState.elapsedTime);
        showPage('results-page');
    }
}


function calculateResults() {
    console.log("=== calculateResults DEBUG ===");
    console.log("appState.sectionTopics:", appState.sectionTopics);
    console.log("sectionDistribution keys:", Object.keys(sectionDistribution || {}));


    const results = {
        overall: { correct: 0, total: appState.questions.length },
        sections: {}
    };
    
    // Initialize section results DYNAMICALLY from loaded quiz
    if (appState.sectionTopics && appState.sectionTopics.length > 0) {
        // Use sections from the loaded JSON
        appState.sectionTopics.forEach(topic => {
            results.sections[topic.name] = { correct: 0, total: 0 };
        });
    } else {
        // Fallback: use sectionDistribution for legacy quizzes
        Object.keys(sectionDistribution).forEach(section => {
            results.sections[section] = { correct: 0, total: 0 };
        });
    }
	console.log("Initialized results.sections:", Object.keys(results.sections));
    
    // Calculate scores
    appState.questions.forEach(question => {
        const section = mapSection(question.section);
		console.log("Processing question:", question.id, "section:", section, "question.section:", question.section);
        const userAnswer = appState.answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        
        // Ensure section exists (safety check)
        if (!results.sections[section]) {
			console.error("ERROR: Section not found in results:", section);
			console.log("Available sections:", Object.keys(results.sections));
            results.sections[section] = { correct: 0, total: 0 };
        }
        
        results.sections[section].total++;
        if (isCorrect) {
            results.overall.correct++;
            results.sections[section].correct++;
        }
    });
    
    // Display results
    displayResults(results);
}


function displayResults(results) {
    const overallPercentage = Math.round((results.overall.correct / results.overall.total) * 100);
    const passed = overallPercentage >= 70;
    
    // Overall result
    const overallResult = document.getElementById('overall-result');
    if (overallResult) {
        overallResult.textContent = passed ? 'PASS' : 'FAIL';
        overallResult.className = `result-status ${passed ? 'pass' : 'fail'}`;
    }
    
    const overallScore = document.getElementById('overall-score');
    if (overallScore) {
        overallScore.textContent = `${overallPercentage}%`;
    }
    
    const scoreFraction = document.getElementById('score-fraction');
    if (scoreFraction) {
        scoreFraction.textContent = `${results.overall.correct}/${results.overall.total}`;
    }
    
    // Section results
    const sectionResults = document.getElementById('section-results');
    if (sectionResults) {
        sectionResults.innerHTML = '';
        Object.keys(results.sections).forEach(section => {
            const sectionResult = results.sections[section];
            if (sectionResult.total > 0) {
                const percentage = Math.round((sectionResult.correct / sectionResult.total) * 100);
                const sectionPassed = percentage >= 70;
                
                const sectionElement = document.createElement('div');
                sectionElement.className = 'section-result';
                sectionElement.innerHTML = `
                    <span class="section-name">${section}</span>
                    <span class="section-score ${sectionPassed ? 'pass' : 'fail'}">${percentage}% (${sectionResult.correct}/${sectionResult.total})</span>
                `;
                sectionResults.appendChild(sectionElement);
            }
        });
    }
    
    // Store results for corrections
    appState.results = results;
}

function showCorrections() {
    const correctionsList = document.getElementById('corrections-list');
    if (correctionsList) {
        correctionsList.innerHTML = '';
        
        const incorrectQuestions = appState.questions.filter(question => {
            const userAnswer = appState.answers[question.id];
            return userAnswer !== question.correctAnswer;
        });
        
        incorrectQuestions.forEach((question, index) => {
            const userAnswer = appState.answers[question.id];
            const correctionElement = document.createElement('div');
            correctionElement.className = 'correction-item card';
            correctionElement.innerHTML = `
                <div class="card__body">
                    <div class="correction-question">
                        <h4>Question ${appState.questions.indexOf(question) + 1}: ${question.section}</h4>
                        <p>${question.question}</p>
                    </div>
                    <div class="correction-options">
                        ${question.options.map(option => `
                            <div class="correction-option ${
                                option.letter === question.correctAnswer ? 'correct' : 
                                option.letter === userAnswer ? 'incorrect' : 'neutral'
                            }">
                                <span class="option-letter">${option.letter}.</span>
                                <span class="option-text">${option.text}</span>
                                ${option.letter === question.correctAnswer ? ' ✓' : ''}
                                ${option.letter === userAnswer && userAnswer !== question.correctAnswer ? ' ✗' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="correction-explanation">
                        <h5>Explanation:</h5>
                        <p>${question.explanation}</p>
                    </div>
					<div class="correction-explanation">
                        <h5>Source:</h5>
                        <p>${question.source}</p>
                    </div>
                </div>
            `;
            correctionsList.appendChild(correctionElement);
        });
    }
    
    showPage('corrections-page');
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function showModal() {
    const suspendModal = document.getElementById('suspend-modal');
    if (suspendModal) {
        suspendModal.classList.add('show');
    }
}

function hideModal() {
    const suspendModal = document.getElementById('suspend-modal');
    if (suspendModal) {
        suspendModal.classList.remove('show');
    }
}

function printResults() {
    window.print();
}

function printCorrections() {
    window.print();
}

function newTest() {
    // Reset state
    appState.currentQuestionIndex = 0;
    appState.answers = {};
    appState.timeRemaining = 10800;
    appState.suspended = false;
    appState.testStartTime = null;
    appState.testCompleted = false;
    
    if (appState.timerInterval) {
        clearInterval(appState.timerInterval);
        appState.timerInterval = null;
    }
    
    // Clear form
    const questionCountSelect = document.getElementById('question-count');
    if (questionCountSelect) {
        questionCountSelect.value = '130';
    }
    
    appState.questionCount = 130;
    
    // Show home page
    showPage('home-page');
    
    // Validate form
    validateForm();
}

function backToResults() {
    showPage('results-page');
}