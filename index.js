document.addEventListener("DOMContentLoaded", () => {
// Select DOM elements
const questionText = document.getElementById("question-text");
const choicesContainer = document.getElementById("choices-container");
const nextBtn = document.getElementById("next-btn");
const feedback = document.getElementById("feedback");
const summarySection = document.getElementById("summary-section");
const scoreText = document.getElementById("score-text");

let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Load questions from db.json
fetch("http://localhost:3000/flashcards")
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion(); // Start quiz
  });


function showQuestion() {
  resetState();

  const current = questions[currentQuestionIndex];

  // Set the question and answer (front/back of card)
  document.getElementById("question-text").textContent = current.question;
  document.getElementById("answer-text").textContent = current.correctAnswer;

    // 💡 Add fade-in animation classes
  card.classList.add("fade-in");
  choicesContainer.classList.add("fade-in");

  // 👇 Remove them after animation is done (matches CSS timing)
  setTimeout(() => {
    card.classList.remove("fade-in");
    choicesContainer.classList.remove("fade-in");
  }, 400); 

  // Ensure card is not flipped at start
  document.getElementById("flashcard").classList.remove("flip");

  // Generate answer choices
  current.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.classList.add("choice-btn");
    btn.addEventListener("click", () => selectAnswer(btn, current.correctAnswer));
    choicesContainer.appendChild(btn);
  });
}

// Reset state before showing next question
function resetState() {
  choicesContainer.innerHTML = "";
  feedback.textContent = "";
  nextBtn.disabled = true;
  document.getElementById("flashcard").classList.remove("flip");
}

// Handle answer click
function selectAnswer(selectedBtn, correctAnswer) {
  const allButtons = document.querySelectorAll(".choice-btn");
  allButtons.forEach(btn => btn.disabled = true); // prevent more clicks

  const isCorrect = selectedBtn.textContent === correctAnswer;

  if (isCorrect) {
    selectedBtn.classList.add("correct");
    feedback.textContent = "✅ Correct!";
    score++;
  } else {
    selectedBtn.classList.add("wrong");
    feedback.textContent = `❌ Incorrect!`;
  }

  // 💡 Flip the card after answer
  document.getElementById("flashcard").classList.add("flip");

  nextBtn.disabled = false;
}


// Handle "Next" button click
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showSummary();
  }
});

// Show summary at end of quiz
function showSummary() {
  const quizContainer = document.getElementById("quiz-container");
  const summarySection = document.getElementById("summary-section");
  const scoreText = document.getElementById("score-text");

  quizContainer.style.display = "none";       // Hide the quiz
  summarySection.hidden = false;              // Show summary

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  let message;
  if (percentage >= 80) {
    message = " Great job!";
  } else if (percentage >= 50) {
    message = " Not bad, keep practicing!";
  } else {
    message = " Try again!";
  }

  scoreText.textContent = `You got ${score} out of ${total} correct (${percentage}%). ${message}`;
}

document.getElementById("restart-btn").addEventListener("click", () => {
  currentQuestionIndex = 0;
  score = 0;
  summarySection.hidden = true;
  document.getElementById("quiz-container").style.display = "block";
  showQuestion();
});


const themeSwitch = document.getElementById("theme-switch");

themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
});


const card = document.getElementById("flashcard");

card.addEventListener("click", () => {
  card.classList.toggle("flip");
});

});