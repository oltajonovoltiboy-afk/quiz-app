// Global holat o'zgaruvchilari (State)
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 60;
let timerInterval = null;
let selectedAnswer = null;
let summary = [];

// DOM Elementlarni ushlab olish
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const endScreen = document.getElementById("end-screen");
const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const questionCounter = document.getElementById("question-counter");
const timerEl = document.getElementById("timer");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextContainer = document.getElementById("next-container");
const feedbackText = document.getElementById("feedback-text");
const finalScoreEl = document.getElementById("final-score");
const summaryContainer = document.getElementById("summary-container");

// Hodisalarni tinglash
startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);

// Quizni boshlash
async function startQuiz() {
    // 1. JSON fayldan ma'lumotlarni yuklab olish
    try {
        const response = await fetch("quizData.json");
        quizData = await response.json();
    } catch (error) {
        alert("Savollarni yuklashda xatolik yuz berdi!");
        return;
    }

    // 2. Ekranlarni almashtirish va stateni nollash
    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    endScreen.classList.add("hidden");

    currentQuestionIndex = 0;
    score = 0;
    summary = [];

    loadQuestion();
}

// Savolni ekranga chiqarish
function loadQuestion() {
    selectedAnswer = null;
    timeLeft = 60;
    nextContainer.classList.add("hidden");

    const currentQuestion = quizData[currentQuestionIndex];

    questionCounter.textContent = `Savol: ${currentQuestionIndex + 1}/${quizData.length}`;
    questionText.textContent = currentQuestion.question;

    updateTimerUI();
    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);

    // Variant tugmalarini dinamik joylash
    optionsContainer.innerHTML = "";
    currentQuestion.options.forEach((option) => {
        const button = document.createElement("button");
        button.textContent = option;
        button.className = "option-btn";
        button.addEventListener("click", () => selectOption(option));
        optionsContainer.appendChild(button);
    });
}

// Taymer har soniyada urishi
function tick() {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
    }
}

// Taymer vizual qismini yangilash
function updateTimerUI() {
    timerEl.textContent = `⏳ ${timeLeft}s qoldi`;
    if (timeLeft <= 10) {
        timerEl.className =
            "text-sm font-bold px-3 py-1 rounded-full bg-red-100 text-red-600 animate-pulse";
    } else {
        timerEl.className =
            "text-sm font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700";
    }
}

// Foydalanuvchi javob tanlaganda
function selectOption(option) {
    if (selectedAnswer !== null) return;

    clearInterval(timerInterval);
    selectedAnswer = option;
    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
        score++;
        feedbackText.innerHTML =
            "<span class='text-green-600 font-semibold'>✨ To'g'ri!</span>";
    } else {
        feedbackText.innerHTML =
            "<span class='text-red-600 font-semibold'>❌ Noto'g'ri.</span>";
    }

    revealAnswers(option, currentQuestion.correctAnswer);

    summary.push({
        ...currentQuestion,
        selectedAnswer: option,
        isCorrect: isCorrect,
    });

    nextBtn.textContent =
        currentQuestionIndex === quizData.length - 1
            ? "Natijalarni ko'rish"
            : "Keyingi savol →";
    nextContainer.classList.remove("hidden");
}

// Vaqt tugab qolganda (Timeout)
function handleTimeout() {
    selectedAnswer = "TIMEOUT";
    score--;
    const currentQuestion = quizData[currentQuestionIndex];

    feedbackText.innerHTML =
        "<span class='text-red-600 font-semibold'>⚠️ Vaqt tugadi! (-1 ochko)</span>";
    revealAnswers(null, currentQuestion.correctAnswer);

    summary.push({
        ...currentQuestion,
        selectedAnswer: null,
        isCorrect: false,
    });

    nextBtn.textContent =
        currentQuestionIndex === quizData.length - 1
            ? "Natijalarni ko'rish"
            : "Keyingi savol →";
    nextContainer.classList.remove("hidden");
}

// Ranglarni yangilash qoidasi
function revealAnswers(chosenOption, correctOption) {
    const buttons = optionsContainer.querySelectorAll("button");
    buttons.forEach((btn) => {
        btn.disabled = true;

        if (btn.textContent === correctOption) {
            btn.className = "option-btn option-correct";
        } else if (btn.textContent === chosenOption) {
            btn.className = "option-btn option-wrong";
        } else {
            btn.className = "option-btn option-disabled";
        }
    });
}

// Keyingi savolga o'tish
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// Yakuniy natijalar
function showResults() {
    quizScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");

    finalScoreEl.textContent = score;
    summaryContainer.innerHTML = "";

    summary.forEach((item, index) => {
        const resCard = document.createElement("div");
        resCard.className =
            "p-4 rounded-lg bg-gray-50 border border-gray-200 text-sm";

        let userAnsText =
            item.selectedAnswer === null
                ? `<span class="text-red-500 font-semibold">Vaqt o'tib ketdi (-1)</span>`
                : `<span class="${item.isCorrect ? "text-green-600" : "text-red-600"} font-semibold">${item.selectedAnswer}</span>`;

        let correctAnsText = !item.isCorrect
            ? `<p><span class="text-gray-500">To'g'ri javob: </span><span class="text-green-600 font-semibold">${item.correctAnswer}</span></p>`
            : "";

        resCard.innerHTML = `
            <p class="font-medium text-gray-900 mb-2">${index + 1}. ${item.question}</p>
            <div class="space-y-1">
                <p><span class="text-gray-500">Sizning javobingiz: </span>${userAnsText}</p>
                ${correctAnsText}
            </div>
        `;
        summaryContainer.appendChild(resCard);
    });
}
