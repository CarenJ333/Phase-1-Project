document.addEventListener("DOMContentLoaded", () => {
  // Select DOM elements
  const topicSection = document.getElementById("topic-section");
  const quizContainer = document.getElementById("quiz-container");
  const questionText = document.getElementById("question-text");
  const choicesContainer = document.getElementById("choices-container");
  const nextBtn = document.getElementById("next-btn");
  const feedback = document.getElementById("feedback");
  const summarySection = document.getElementById("summary-section");
  const scoreText = document.getElementById("score-text");
  const backBtn = document.createElement("button");
  
  let currentQuestionIndex = 0;
  let score = 0;
  let currentTopic = "";
  let questions = [];
  let quizStartTime;
  let questionTimes = [];
  let correctStreak = 0;
  let maxStreak = 0;

  // Create and add back button
  backBtn.id = "back-btn";
  backBtn.textContent = "← Back to Topics";
  quizContainer.insertBefore(backBtn, quizContainer.firstChild);

  // Topic selection
  document.querySelectorAll(".topic-card").forEach(card => {
    card.addEventListener("click", () => {
      currentTopic = card.dataset.topic;
      loadTopicQuestions(currentTopic);
    });
  });

  // Back button functionality
  backBtn.addEventListener("click", () => {
    quizContainer.hidden = true;
    summarySection.hidden = true;
    topicSection.style.display = "block";
    
    // Reset quiz state
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
  });

  // Load questions for specific topic
  function loadTopicQuestions(topic) {
    // Show loading state
    feedback.textContent = `Loading ${topic} questions...`;
    topicSection.style.display = "none";
    quizContainer.hidden = false;
    summarySection.hidden = true;

    // Fetch ALL flashcards, then filter by topic
    fetch("db.json")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(allFlashcards => {
        // Filter flashcards by the selected topic
        questions = allFlashcards.filter(card => card.topic === topic);
        
        if (questions.length === 0) {
          feedback.textContent = `No questions found for "${topic}". Please try another topic.`;
          
          // Add a button to go back
          const backButton = document.createElement("button");
          backButton.textContent = "← Back to Topics";
          backButton.classList.add("choice-btn");
          backButton.addEventListener("click", () => {
            quizContainer.hidden = true;
            topicSection.style.display = "block";
          });
          choicesContainer.appendChild(backButton);
          return;
        }
        
        showQuestion();
      })
      .catch(error => {
        feedback.textContent = `Error loading questions: ${error.message}`;
        console.error("Fetch error:", error);
        
        // Optionally show back button on error too
        const backButton = document.createElement("button");
        backButton.textContent = "← Back to Topics";
        backButton.classList.add("choice-btn");
        backButton.addEventListener("click", () => {
          quizContainer.hidden = true;
          topicSection.style.display = "block";
        });
        choicesContainer.appendChild(backButton);
      });
  }

  // Show question
  function showQuestion() {
    if (currentQuestionIndex === 0) {
      quizStartTime = Date.now();
      questionTimes = [];
    }
    resetState();
    
    const current = questions[currentQuestionIndex];
    const card = document.getElementById("flashcard");
    
    // Update card content
    document.getElementById("question-text").textContent = current.question;
    document.getElementById("answer-text").textContent = current.correctAnswer;
    
    // Update counter if elements exist
    const questionCounter = document.getElementById("question-counter");
    const answerCounter = document.getElementById("answer-counter");
    if (questionCounter) {
      questionCounter.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
    }
    if (answerCounter) {
      answerCounter.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
    }
    
    // Add fade-in animation
    card.classList.add("fade-in");
    choicesContainer.classList.add("fade-in");
    
    setTimeout(() => {
      card.classList.remove("fade-in");
      choicesContainer.classList.remove("fade-in");
    }, 400);
    
    // Reset card flip state
    card.classList.remove("flip");
    
    // Generate answer choices with letters
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    current.choices.forEach((choice, index) => {
      const btn = document.createElement("button");
      btn.textContent = choice;
      btn.classList.add("choice-btn");
      btn.setAttribute("data-letter", letters[index]);
      btn.addEventListener("click", () => selectAnswer(btn, current.correctAnswer));
      choicesContainer.appendChild(btn);
    });
  }

  // Reset state 
  function resetState() {
    choicesContainer.innerHTML = "";
    feedback.textContent = "";
    feedback.style.background = "";
    feedback.style.color = "";
    nextBtn.disabled = true;
    const card = document.getElementById("flashcard");
    card.classList.remove("flip");
  }

  // Select answer 
  function selectAnswer(selectedBtn, correctAnswer) {
  const startTime = Date.now(); // Track when answer was selected
  const allButtons = document.querySelectorAll(".choice-btn");
  allButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.transform = 'none';
  });
  
  const isCorrect = selectedBtn.textContent === correctAnswer;
  
  if (isCorrect) {
    selectedBtn.classList.add("correct");
    feedback.textContent = "✨ Correct! Well done!";
    feedback.style.background = "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)";
    feedback.style.color = "#155724";
    score++;
    
    // Track streaks
    correctStreak++;
    if (correctStreak > maxStreak) {
      maxStreak = correctStreak;
    }
    
    // Launch confetti for correct answers
    launchConfetti();
    
  } else {
    selectedBtn.classList.add("wrong");
    feedback.textContent = `💡 The correct answer is: ${correctAnswer}`;
    feedback.style.background = "linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%)";
    feedback.style.color = "#721c24";
    
    // Reset streak on wrong answer
    correctStreak = 0;
    
    // Highlight the correct answer
    allButtons.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct");
      }
    });
  }
  
  // Track time per question (in seconds)
  const questionTime = (Date.now() - startTime) / 1000;
  questionTimes.push(questionTime);
  
  // Flip the card
  const card = document.getElementById("flashcard");
  setTimeout(() => {
    card.classList.add("flip");
  }, 300);
  
  nextBtn.disabled = false;
  card.style.animation = '';
}

  // Next button 
  nextBtn.addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showSummary();
    }
  });
  

  // Show summary
  function showSummary() {
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  
  // Calculate total time
  const totalTime = ((Date.now() - quizStartTime) / 1000).toFixed(1);
  const avgTime = (questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length).toFixed(1);
  
  // Update all summary elements
  document.getElementById('percentage-text').textContent = `${percentage}%`;
  document.getElementById('correct-count').textContent = score;
  document.getElementById('total-count').textContent = total;
  document.getElementById('time-taken').textContent = `${totalTime}s`;
  document.getElementById('streak-count').textContent = maxStreak;
  document.getElementById('avg-time').textContent = `${avgTime}s`;
  
  // Update performance message
  const performanceTitle = document.getElementById('performance-title');
  const performanceText = document.getElementById('performance-text');
  
  if (percentage >= 90) {
    performanceTitle.textContent = "Perfect Score! 🎯";
    performanceText.textContent = "Outstanding! You've mastered this topic completely!";
  } else if (percentage >= 80) {
    performanceTitle.textContent = "Excellent Work! 🌟";
    performanceText.textContent = "You have a strong understanding of this material!";
  } else if (percentage >= 70) {
    performanceTitle.textContent = "Great Job! 👍";
    performanceText.textContent = "Good progress! Keep up the practice!";
  } else if (percentage >= 60) {
    performanceTitle.textContent = "Good Effort! 💪";
    performanceText.textContent = "You're getting there! Review and try again!";
  } else {
    performanceTitle.textContent = "Keep Practicing! 📚";
    performanceText.textContent = "Don't give up! Review the material and try again!";
  }
  
  // Animate the progress circle
  const circle = document.querySelector('.progress-ring-circle');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;
  
  // Animate the circle
  setTimeout(() => {
    circle.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
    circle.style.strokeDashoffset = offset;
  }, 300);
  
  // Show summary and hide quiz
  quizContainer.style.display = "none";
  summarySection.hidden = false;
  
  // Launch celebration confetti for good scores
  if (percentage >= 70) {
    setTimeout(() => launchConfetti(), 500);
  }
}

// Add event listener for topics button
document.getElementById('topics-btn').addEventListener('click', () => {
  summarySection.hidden = true;
  topicSection.style.display = "block";
  currentQuestionIndex = 0;
  score = 0;
  correctStreak = 0;
  maxStreak = 0;
});

// Update restart button
document.getElementById("restart-btn").addEventListener("click", () => {
  summarySection.hidden = true;
  quizContainer.style.display = "block";
  currentQuestionIndex = 0;
  score = 0;
  correctStreak = 0;
  maxStreak = 0;
  showQuestion();
});

// Share button functionality (optional)
document.getElementById('share-btn').addEventListener('click', () => {
  const percentage = Math.round((score / questions.length) * 100);
  const shareText = `🎯 I scored ${score}/${questions.length} (${percentage}%) on the flashcard quiz! Try it yourself!`;
  
  if (navigator.share) {
    navigator.share({
      title: 'My Quiz Score',
      text: shareText,
      url: window.location.href
    });
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Score copied to clipboard! 📋');
    });
  }
});


  // Restart button
  document.getElementById("restart-btn").addEventListener("click", () => {
    summarySection.hidden = true;
    topicSection.style.display = "block";
    quizContainer.style.display = "none";
    currentQuestionIndex = 0;
    score = 0;
  });

  // Theme toggle 
  const themeSwitch = document.getElementById("theme-switch");
  themeSwitch.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Remove Space/Enter flip if you don't want manual flipping
    // if (e.code === 'Space' || e.code === 'Enter') {
    //   e.preventDefault();
    //   const card = document.getElementById("flashcard");
    //   card.classList.toggle("flip");
    // }
    
    // Number keys 1-4 for selecting answers
    if (e.code >= 'Digit1' && e.code <= 'Digit4') {
      const index = parseInt(e.code.slice(-1)) - 1;
      const buttons = document.querySelectorAll('.choice-btn');
      if (buttons[index] && !buttons[index].disabled) {
        buttons[index].click();
      }
    }
    
    // 'N' key for next question
    if (e.code === 'KeyN' && !nextBtn.disabled) {
      nextBtn.click();
    }
  });
}); // End of DOMContentLoaded

// Confetti function (outside DOMContentLoaded so it's globally available)
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    console.error("Confetti canvas not found!");
    return;
  }
  
  // Make canvas visible
  canvas.style.display = 'block';
  
  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const ctx = canvas.getContext('2d');
  const confettiPieces = [];
  const colors = ['#667eea', '#764ba2', '#43e97b', '#38f9d7', '#ff6b6b', '#ffa8a8'];
  
  // Create confetti pieces
  for (let i = 0; i < 150; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 10 + 5,
      d: Math.random() * 5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncrement: Math.random() * 0.05 + 0.05,
      tiltAngle: 0
    });
  }
  
  let animationFrame;
  
  function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiPieces.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
      ctx.fillStyle = p.color;
      ctx.fill();
      
      p.y += p.d;
      p.tiltAngle += p.tiltAngleIncrement;
      p.x += Math.sin(p.tiltAngle);
      
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
    
    animationFrame = requestAnimationFrame(drawConfetti);
  }
  
  // Start animation
  drawConfetti();
  
  // Stop after 3 seconds and hide canvas
  setTimeout(() => {
    cancelAnimationFrame(animationFrame);
    canvas.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 3000);
}