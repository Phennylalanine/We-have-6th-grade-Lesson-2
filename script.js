let questions = [];
let currentQuestion = null;
let score = 0;
let streak = 0; // Add streak variable
let userInteracted = false;

// Start screen elements
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

// DOM elements
const questionDisplay = document.getElementById("question");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("コンボ"); // Add streak display (assume you add an element with id="streak" in HTML)

// Track user interaction to allow audio playback
startBtn.addEventListener("click", () => {
  userInteracted = true;
  startScreen.style.display = "none"; // Hide start screen
  showQuestion(); // Start the quiz
});

// Load CSV with PapaParse
Papa.parse("questions.csv", {
  download: true,
  header: true,
  complete: function(results) {
   questions = results.data.filter(q => q.jp && q.en); // Remove empty rows
    // Wait for user interaction, so showQuestion isn't called yet
  }
});

function getRandomQuestion() {
  return questions[Math.floor(Math.random() * questions.length)];
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

function showQuestion() {
  currentQuestion = getRandomQuestion();
 questionDisplay.textContent = `${currentQuestion.en} ${currentQuestion.jp}`;
  answerInput.value = "";
  answerInput.disabled = false;
  feedback.innerHTML = "";
  nextBtn.style.display = "none";
  answerInput.focus();

  // Speak the English word automatically after interaction
  if (userInteracted && currentQuestion.en) {
    speak(currentQuestion.en);
  }
}

function updateScoreAndStreakDisplay() {
  scoreDisplay.textContent = "Score: " + score;
  streakDisplay.textContent = "Streak: " + streak;
}

function showFeedback(correct, expected, userInput) {
  if (correct) {
    feedback.innerHTML = "✅ 正解！Good job!";
    score++;
    streak++; // Increment streak
    updateScoreAndStreakDisplay();
  } else {
    let mismatchIndex = [...expected].findIndex((char, i) => char !== userInput[i]);
    if (mismatchIndex === -1 && userInput.length > expected.length) {
      mismatchIndex = expected.length;
    }

    const correctPart = expected.slice(0, mismatchIndex);
    const wrongPart = expected.slice(mismatchIndex);

    feedback.innerHTML = `
      ❌ 間違いがあります<br/>
      <strong>正解:</strong> ${expected}<br/>
      <strong>あなたの答え:</strong> ${userInput}<br/>
      <strong>ここが間違い:</strong> ${correctPart}<span style="color:red">${wrongPart}</span>
    `;
    streak = 0; // Reset streak on incorrect answer
    updateScoreAndStreakDisplay();
  }

  answerInput.disabled = true;
  nextBtn.style.display = "inline-block";
}

answerInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    if (answerInput.disabled) {
      showQuestion();
    } else {
      const userAnswer = answerInput.value.trim();
      const expected = currentQuestion.en.trim();
      const isCorrect = userAnswer === expected;
      showFeedback(isCorrect, expected, userAnswer);
    }
  }
});

nextBtn.addEventListener("click", showQuestion);

// Optional: Manual speak button
const speakBtn = document.getElementById("speakBtn");
if (speakBtn) {
  speakBtn.addEventListener("click", function() {
    if (currentQuestion && currentQuestion.en) {
      speak(currentQuestion.en);
    }
  });
}

// Initialize displays when the page loads
if (scoreDisplay) scoreDisplay.textContent = "Score: 0";
if (streakDisplay) streakDisplay.textContent = "Streak: 0";
