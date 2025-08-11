class FakeFinderQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.totalQuestions = 10;
        this.questions = this.generateQuestions();
        this.selectedOption = null;
        
        this.initializeEventListeners();
        // Don't load question immediately - wait for start button
    }

    generateQuestions() {
        // Generate 10 questions with random images
        const questions = [];
        for (let i = 0; i < this.totalQuestions; i++) {
            // Randomly decide which position (1 = A, 2 = B) will contain the deepfake
            const deepfakePosition = Math.random() < 0.5 ? 1 : 2;
            
            questions.push({
                id: i + 1,
                deepfakePosition: deepfakePosition, // Position of the deepfake (1 = A, 2 = B)
                correctAnswer: deepfakePosition, // The correct answer is the deepfake position
                image1: `https://picsum.photos/400/300?random=${i * 2 + 1}`,
                image2: `https://picsum.photos/400/300?random=${i * 2 + 2}`,
                explanation: `Question ${i + 1}: Look for subtle inconsistencies in facial features, unusual patterns, or artifacts that might indicate AI generation.`
            });
        }
        return questions;
    }

    startQuiz() {
        // Hide welcome screen and show quiz
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('quizContainer').style.display = 'block';
        
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
        document.getElementById('score').textContent = this.score;
        document.getElementById('questionCount').textContent = this.currentQuestion + 1;

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
        document.getElementById('questionCount').textContent = this.currentQuestion + 1;

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
        
        // Add motivational message based on score
        const resultsDiv = document.getElementById('results');
        let message = '';
        
        if (this.score >= 8) {
            message = 'Excellent! You have a keen eye for spotting deepfakes! 🔍';
        } else if (this.score >= 6) {
            message = 'Good job! You\'re getting better at detecting deepfakes! 👍';
        } else if (this.score >= 4) {
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
        this.questions = this.generateQuestions();
        this.selectedOption = null;
        
        // Reset displays
        document.getElementById('score').textContent = '0';
        document.getElementById('questionCount').textContent = '0';
        
        // Show welcome screen, hide quiz and results
        document.getElementById('welcomeScreen').style.display = 'block';
        document.getElementById('quizContainer').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        
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
