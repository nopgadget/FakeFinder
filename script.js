class FakeFinderQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = 5;  // Changed from 20 to 5
        this.questions = [];  // Start with empty questions
        this.selectedOption = null;
        this.imagePairs = null;
        this.fullMapping = null;
        
        this.initializeEventListeners();
        this.initializeQuiz();
    }

    async initializeQuiz() {
        // Load the image mapping first
        await this.loadImageMapping();
        
        // Now generate questions with the loaded mapping
        this.questions = this.generateQuestions();
        
        console.log(`Quiz initialized with ${this.questions.length} questions`);
    }

    generateQuestions() {
        // Wait for image mapping to be loaded
        if (!this.imagePairs || this.imagePairs.length === 0) {
            console.log('Image pairs not loaded yet, waiting...');
            return [];
        }
        
        const questions = [];
        
        for (let i = 0; i < this.totalQuestions; i++) {
            // Randomly decide which position (1 = A, 2 = B) will contain the deepfake
            const deepfakePosition = Math.random() < 0.5 ? 1 : 2;
            
            // Get a random image pair from the available pairs
            const pairIndex = Math.floor(Math.random() * this.imagePairs.length);
            const imagePair = this.imagePairs[pairIndex];
            
            // IMPORTANT: imagePair.primary is ALWAYS the real image, secondary is ALWAYS the fake image
            // We just randomize which position (A or B) gets the real vs fake
            const realImage = imagePair.primary;      // Always the real image
            const fakeImage = imagePair.secondary;    // Always the fake image
            
            // Debug: Log question setup for first few questions
            if (i < 3) {
                console.log(`Question ${i + 1}: Deepfake at position ${deepfakePosition} (${deepfakePosition === 1 ? 'A' : 'B'})`);
                console.log(`  Real image: ${realImage}`);
                console.log(`  Fake image: ${fakeImage}`);
                console.log(`  Position A: ${deepfakePosition === 1 ? fakeImage : realImage}`);
                console.log(`  Position B: ${deepfakePosition === 1 ? realImage : fakeImage}`);
            }
            
            questions.push({
                id: i + 1,
                deepfakePosition: deepfakePosition, // Position of the deepfake (1 = A, 2 = B)
                correctAnswer: deepfakePosition, // The correct answer is the deepfake position
                image1: deepfakePosition === 1 ? fakeImage : realImage,  // Position A
                image2: deepfakePosition === 1 ? realImage : fakeImage,  // Position B
                deepfakeImage: fakeImage,
                realImage: realImage,
                explanation: `Question ${i + 1}: Look for subtle inconsistencies in facial features, unusual patterns, or artifacts that might indicate AI generation.`
            });
        }
        return questions;
    }

    getImagePairs() {
        // This will be populated when the mapping is loaded
        return this.imagePairs || [];
    }

    async loadImageMapping() {
        try {
            const response = await fetch('image_mapping.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const mapping = await response.json();
            
            // Validate the mapping structure
            if (!mapping.pairs || !Array.isArray(mapping.pairs)) {
                throw new Error('Invalid mapping format: missing or invalid pairs array');
            }
            
            // Create pairs for quiz questions
            // IMPORTANT: Each pair contains exactly one real and one fake image
            // - primary = the REAL image (always)
            // - secondary = the FAKE image (always)
            this.imagePairs = mapping.pairs.map(pair => ({
                primary: pair.real,      // The real image
                secondary: pair.fake,    // The fake image
                key: pair.id,
                realPath: pair.real,
                fakePath: pair.fake
            }));
            
            // Store the full mapping for reference
            this.fullMapping = mapping;
            
            console.log(`Loaded ${this.imagePairs.length} image pairs`);
            
            // Debug: Log first few pairs to verify mapping
            console.log('First 3 pairs for debugging:');
            this.imagePairs.slice(0, 3).forEach((pair, index) => {
                console.log(`Pair ${index}: Real=${pair.primary}, Fake=${pair.secondary}`);
            });
            
            // Validate that we have the expected structure
            if (this.imagePairs.length === 0) {
                throw new Error('No image pairs found in mapping');
            }
            
            console.log(`✅ Mapping validation: ${this.imagePairs.length} pairs loaded successfully`);
            console.log('✅ Each pair contains exactly 1 real and 1 fake image');
            
            return this.imagePairs;
        } catch (error) {
            console.error('Error loading image mapping:', error);
            
            // Show user-friendly error message
            this.showMappingError(error.message);
            
            // Fallback to a few hardcoded pairs if loading fails
            this.imagePairs = [
                { primary: 'images/real_0.jpg', secondary: 'images/fake_0.jpg', key: 'fallback_0' },
                { primary: 'images/real_1.jpg', secondary: 'images/fake_1.jpg', key: 'fallback_1' },
                { primary: 'images/real_2.jpg', secondary: 'images/fake_2.jpg', key: 'fallback_2' }
            ];
            return this.imagePairs;
        }
    }

    showMappingError(errorMessage) {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const startBtn = document.getElementById('startBtn');
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mapping-error';
        errorDiv.innerHTML = `
            <div style="background: #fee; border: 1px solid #fcc; padding: 15px; margin: 20px 0; border-radius: 5px; color: #c33;">
                <strong>⚠️ Image Mapping Error</strong><br>
                Could not load image mapping: ${errorMessage}<br><br>
                <strong>To fix this:</strong><br>
                1. Run the Python script: <code>python generate_image_mapping.py --rename</code><br>
                2. Make sure <code>image_mapping.json</code> is created<br>
                3. Refresh this page
            </div>
        `;
        
        // Insert error message before the start button
        startBtn.parentNode.insertBefore(errorDiv, startBtn);
        
        startBtn.textContent = 'Quiz Unavailable';
        startBtn.disabled = true;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    startQuiz() {
        // Check if questions are ready
        if (!this.questions || this.questions.length === 0) {
            console.log('Questions not ready yet, showing loading...');
            this.showLoadingState();
            return;
        }
        
        // Hide welcome screen and show quiz
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';
        
        // Show score display when quiz starts
        document.getElementById('scoreDisplay').style.display = 'flex';
        
        // Load first question
        this.loadQuestion();
        
        // Add entrance animation for quiz
        const quizContainer = document.getElementById('quizContainer');
        quizContainer.style.opacity = '0';
        quizContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            quizContainer.style.transition = 'all 0.8s ease';
            quizContainer.style.opacity = '1';
            quizContainer.style.transform = 'translateY(0)';
        }, 100);
    }

    showLoadingState() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const startBtn = document.getElementById('startBtn');
        
        startBtn.textContent = 'Loading...';
        startBtn.disabled = true;
        
        // Check every 100ms if questions are ready
        const checkInterval = setInterval(() => {
            if (this.questions && this.questions.length > 0) {
                clearInterval(checkInterval);
                startBtn.textContent = 'Start Quiz';
                startBtn.disabled = false;
                console.log('Questions loaded, quiz ready to start');
            }
        }, 100);
    }

    initializeEventListeners() {
        // Start button
        document.getElementById('startBtn').addEventListener('click', () => this.startQuiz());

        // Image selection
        document.querySelectorAll('.image-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectOption(e.currentTarget));
        });

        // Next button
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());

        // Restart button
        document.getElementById('restartBtn').addEventListener('click', () => this.restartQuiz());

        // Home button
        document.getElementById('homeBtn').addEventListener('click', () => this.goHome());
    }

    selectOption(selectedElement) {
        if (this.selectedOption !== null) return; // Prevent multiple selections

        this.selectedOption = parseInt(selectedElement.dataset.option);
        
        // Add selected class
        selectedElement.classList.add('selected');

        // Check answer
        this.checkAnswer();
    }

    checkAnswer() {
        const currentQ = this.questions[this.currentQuestion];
        const isCorrect = this.selectedOption === currentQ.correctAnswer;
        
        if (isCorrect) {
            this.score++;
            this.showFeedback('Correct! 🎉 You identified the deepfake!', 'correct');
        } else {
            // Show which image was actually the deepfake
            const deepfakeLabel = currentQ.deepfakePosition === 1 ? 'A' : 'B';
            this.showFeedback(`Image ${deepfakeLabel} was the deepfake. Keep practicing! 💪`, 'incorrect');
        }

        // Update score display
        this.updateScoreDisplay();

        // Show next button after a short delay
        setTimeout(() => {
            document.getElementById('nextBtn').style.display = 'block';
        }, 1500);

        // Show which image was the deepfake and disable further selections
        document.querySelectorAll('.image-option').forEach(option => {
            option.style.pointerEvents = 'none';
            
            // Highlight the correct deepfake image
            const optionNumber = parseInt(option.dataset.option);
            if (optionNumber === currentQ.deepfakePosition) {
                option.classList.add('correct');
            } else if (optionNumber === this.selectedOption && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion >= this.totalQuestions) {
            this.showResults();
        } else {
            this.loadQuestion();
        }
    }

    loadQuestion() {
        // Reset state
        this.selectedOption = null;
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';

        // Update question counter
        this.updateScoreDisplay();

        // Load new images
        const currentQ = this.questions[this.currentQuestion];
        document.getElementById('image1').src = currentQ.image1;
        document.getElementById('image2').src = currentQ.image2;

        // Reset image options
        document.querySelectorAll('.image-option').forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
            option.style.pointerEvents = 'auto';
        });

        // Update question text
        document.getElementById('questionText').textContent = `Question ${this.currentQuestion + 1}: Which portrait image is the deepfake? (One image is designated as the deepfake)`;
    }

    showResults() {
        document.querySelector('.quiz-container').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('finalScore').textContent = this.score;
        
        // Calculate and display final score percentage
        const finalPercentage = Math.round((this.score / this.totalQuestions) * 100);
        document.getElementById('finalScorePercent').textContent = `${finalPercentage}%`;
        
        // Add motivational message based on score
        const resultsDiv = document.getElementById('results');
        let message = '';
        
        if (this.score >= 4) {
            message = 'Excellent! You have a keen eye for spotting deepfakes! 🔍';
        } else if (this.score >= 3) {
            message = 'Good job! You\'re getting better at detecting deepfakes! 👍';
        } else if (this.score >= 2) {
            message = 'Not bad! Keep practicing to improve your deepfake detection skills! 💪';
        } else {
            message = 'Keep practicing! Deepfake detection takes time and attention to detail! 📚';
        }
        
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.fontSize = '1.2rem';
        messageElement.style.color = '#4a5568';
        messageElement.style.marginBottom = '20px';
        
        resultsDiv.insertBefore(messageElement, document.getElementById('restartBtn'));
    }

    restartQuiz() {
        // Reset state
        this.currentQuestion = 0;
        this.score = 0;
        
        // Regenerate questions using the loaded mapping
        if (this.imagePairs && this.imagePairs.length > 0) {
            this.questions = this.generateQuestions();
        }
        
        this.selectedOption = null;
        
        // Reset displays
        this.updateScoreDisplay();
        
        // Hide results and show quiz with new questions
        document.getElementById('results').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';
        
        // Load first question of new quiz
        this.loadQuestion();
        
        // Add entrance animation for quiz
        const quizContainer = document.getElementById('quizContainer');
        quizContainer.style.opacity = '0';
        quizContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            quizContainer.style.transition = 'all 0.8s ease';
            quizContainer.style.opacity = '1';
            quizContainer.style.transform = 'translateY(0)';
        }, 100);
    }

    goHome() {
        // Reset state
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedOption = null;
        
        // Reset displays
        this.updateScoreDisplay();
        
        // Show welcome screen, hide quiz and results
        document.getElementById('welcomeScreen').style.display = 'block';
        document.getElementById('quizContainer').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        
        // Hide score display when returning to welcome screen
        document.getElementById('scoreDisplay').style.display = 'none';
        
        // Add entrance animation for welcome screen
        const welcomeScreen = document.getElementById('welcomeScreen');
        welcomeScreen.style.opacity = '0';
        welcomeScreen.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            welcomeScreen.style.transition = 'all 0.8s ease';
            welcomeScreen.style.opacity = '1';
            welcomeScreen.style.transform = 'translateY(0)';
        }, 100);
    }

    updateScoreDisplay() {
        // Update raw score
        document.getElementById('score').textContent = this.score;
        
        // Calculate and update percentage
        const percentage = Math.round((this.score / this.totalQuestions) * 100);
        document.getElementById('scorePercent').textContent = `${percentage}%`;
        
        // Update question count
        document.getElementById('questionCount').textContent = this.currentQuestion + 1;
    }
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FakeFinderQuiz();
});

// Add some fun animations
document.addEventListener('DOMContentLoaded', () => {
    // Add entrance animation to header
    const header = document.querySelector('header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        header.style.transition = 'all 0.8s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 100);

    // Add entrance animation to welcome screen
    const welcomeScreen = document.getElementById('welcomeScreen');
    welcomeScreen.style.opacity = '0';
    welcomeScreen.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        welcomeScreen.style.transition = 'all 0.8s ease';
        welcomeScreen.style.opacity = '1';
        welcomeScreen.style.transform = 'translateY(0)';
    }, 300);
});
