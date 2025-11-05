// Your web app's Firebase configuration (Kept for context, but not changed)
var firebaseConfig = {
    apiKey: "AIzaSyCt1B4Rjaa-nGeJJBtyoIKI7yRCbN2Tr5A",
    authDomain: "quiz-app-fmp-beaa5.firebaseapp.com",
    databaseURL: "https://quiz-app-fmp-beaa5-default-rtdb.firebaseio.com",
    projectId: "quiz-app-fmp-beaa5",
    storageBucket: "quiz-app-fmp-beaa5.firebasestorage.app",
    messagingSenderId: "493593405965",
    appId: "1:493593405965:web:0ac342d734955695a6c344"
};

// Initialize Firebase (Kept for context, but not changed)
var app = firebase.initializeApp(firebaseConfig);
var db = firebase.database();


// Array of quiz questions (Unchanged)
const questions = [
    {
        question: "What is the main programming language for the web?",
        answers: [
            { text: "Python", correct: false },
            { text: "Java", correct: false },
            { text: "JavaScript", correct: true },
            { text: "C++", correct: false }
        ]
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: [
            { text: "Earth", correct: false },
            { text: "Mars", correct: true },
            { text: "Jupiter", correct: false },
            { text: "Saturn", correct: false }
        ]
    },
    {
        question: "What is the largest ocean on Earth?",
        answers: [
            { text: "Atlantic Ocean", correct: false },
            { text: "Indian Ocean", correct: false },
            { text: "Arctic Ocean", correct: false },
            { text: "Pacific Ocean", correct: true }
        ]
    },
    {
        question: "What is the capital of France?",
        answers: [
            { text: "Berlin", correct: false },
            { text: "Madrid", correct: false },
            { text: "Paris", correct: true },
            { text: "Rome", correct: false }
        ]
        
    },
    {
        question: "In what year did the Titanic sink?",
        answers: [
            { text: "1912", correct: true },
            { text: "1905", correct: false },
            { text: "1918", correct: false },
            { text: "1923", correct: false }
        ]
    }
];

var questionTextElement = document.getElementById('question-text');
var answerButtonsElement = document.getElementById('answer-buttons');
var nextButton = document.getElementById('next-btn');
var progressText = document.getElementById('progress-text');
var resultArea = document.getElementById('result-area');
var finalScoreText = document.getElementById('final-score');
var restartButton = document.getElementById('restart-btn');
var quizContent = document.getElementById('quiz-content'); 

var currentQuestionIndex = 0;
var score = 0;
var answerSelected = false;

// Variable to store the user's results for each question
var quizResults = []; 



function handleNextQuestion() {
    // Only proceed if an answer has been selected
    if (answerSelected) {
        currentQuestionIndex++;
        
        // Check if there are more questions
        if (currentQuestionIndex < questions.length) {
            showQuestion(); // Function to display the next question
        } else {
            showResult(); // Function to display the final score
        }
    }
}

// Event Listener using the function
nextButton.addEventListener('click', handleNextQuestion);
restartButton.addEventListener('click', startQuiz);


// Core Functions

// starts the first question
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    answerSelected = false;
    // Clear previous results when starting a new quiz
    quizResults = []; 
    
    // Hide results, show quiz content
    resultArea.classList.add('hidden');
    quizContent.classList.remove('hidden');
    
    // Reset next button state
    nextButton.textContent = 'Next Question';
    nextButton.disabled = true;

    showQuestion();
}


function showQuestion() {
    // Reset the answer area for the new question
    resetState(); 

    const currentQuestion = questions[currentQuestionIndex];
    
    // Update question text and progress counter below
    questionTextElement.textContent = currentQuestion.question;
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    // Create buttons for each answer choice
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.textContent = answer.text;
        button.classList.add('btn');
        
        // Store the correct answer status on the button itself
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}


// Clears old answers and resets button states
function resetState() {
    
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
    
    // Reset buttons state 
    nextButton.disabled = true;
    answerSelected = false;
}

/**
  Handles the logic when a user clicks an answer button.
  @param {Event} e 	The click event object
*/
function selectAnswer(e) {
    if (answerSelected) return; // solve double clicking or selecting

    const selectedBtn = e.target;
    
    const isCorrect = selectedBtn.dataset.correct === 'true';
    const currentQuestion = questions[currentQuestionIndex];

    // Find the correct answer text
    const correctAnswerText = currentQuestion.answers.find(a => a.correct).text;
    
    // Store the result for the current question
    quizResults.push({
        question: currentQuestion.question,
        userAnswer: selectedBtn.textContent, 
        correctAnswer: correctAnswerText,
        isCorrect: isCorrect
    });
    
    // Update Score
    if (isCorrect) {
        score++;
        selectedBtn.classList.add('correct');
    } else {
        selectedBtn.classList.add('incorrect');
    }

    //Disable all buttons and show correct answer
    Array.from(answerButtonsElement.children).forEach(button => {
        button.disabled = true;
    
        if (button.dataset.correct === 'true') {
          
            if (!button.classList.contains('incorrect')) {
                 button.classList.add('correct');
            }
        }
    });

    // Enable the 'Next' button
    nextButton.disabled = false;
    answerSelected = true;

    // Change text for the last question
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.textContent = 'See Results';
    }
}

// Saves the user's quiz results to FRD.
function saveQuizResults() {
    const totalQuestions = questions.length;
    
    // Structure the data to be saved
    const sessionData = {
        timestamp: new Date().toLocaleString(),
        score: score,
        totalQuestions: totalQuestions,
        detailedResults: quizResults // The array containing question, user answer, etc.
    };
    
    // Save the data to the 'quiz_sessions' node in Firebase
    // .push() creates a unique ID for each session
    db.ref('quiz_sessions').push(sessionData)
        .then(() => {
            console.log("Quiz results successfully saved to Firebase.");
            // Show the pop up for saving to the user
            Swal.fire({
                icon: 'success',
                title: 'Results Saved!',
                text: 'Your quiz results have been successfully saved.',
            });
        })
        .catch((error) => {
            console.error("Error saving quiz results to Firebase: ", error);
            //  Show the pop up for error to the user
            Swal.fire({
                icon: 'error',
                title: 'Results Cannot be Saved!',
                text: 'Your quiz results could not be saved. Please try again later.',
            });
        });
}



/**
 * Displays the final score and result screen, including question details.
 */
/**
 * Displays the final score and result screen, including question details.
 */
function showResult() {
    // Set the required score to pass (e.g., 3 out of 5)
    const PASSING_SCORE = 3; 
    const totalQuestions = questions.length;

    // Hide the main quiz content area
    quizContent.classList.add('hidden');
    
    // Clear previous content
    finalScoreText.innerHTML = ''; 

    // Create the overall score summary
    const scoreSummary = document.createElement('h5');
    scoreSummary.textContent = `Total Marks Obtained: ${score} / ${totalQuestions}`;
    finalScoreText.appendChild(scoreSummary);

    // 🏆 Logic to show Pass/Fail message
    if (score >= PASSING_SCORE) {
        const passMessage = document.createElement('p');
        passMessage.textContent = "Congratulations! You have passed the quiz.";
        finalScoreText.appendChild(passMessage);
        passMessage.style.color = 'green';
        passMessage.style.marginTop = '10px';
    } else {
  
        const failMessage = document.createElement('p');
        failMessage.textContent = "You did not pass the quiz. Better luck next time!";
        finalScoreText.appendChild(failMessage);
        failMessage.style.color = 'red';
        failMessage.style.marginTop = '10px';


    }
    
    // Update and show the result area
    resultArea.classList.remove('hidden');

    // Save the results to Firebase
    saveQuizResults(); 
}

//Start the quiz again
startQuiz();