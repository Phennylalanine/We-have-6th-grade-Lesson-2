let questions = [];
let currentQuestion = null;
let score = 0;
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
  questionDisplay.textContent = currentQuestion.jp;
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

function showFeedback(correct, expected, userInput) {
  if (correct) {
    feedback.innerHTML = "✅ 正解！Good job!";
    score++;
    scoreDisplay.textContent = "Score: " + score;
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
