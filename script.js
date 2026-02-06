let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = []; 

const STORAGE_KEY = 'quiz_app_progress'; 

const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const reviewScreen = document.getElementById('review-screen');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const feedbackSection = document.getElementById('feedback-section');
const explanationText = document.getElementById('explanation-text');
const referenceText = document.getElementById('reference-text');
const progressBar = document.getElementById('progress-bar');
const questionCount = document.getElementById('question-count');
const scoreLive = document.getElementById('score-live');


fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
     
        checkProgressAndStart();
    })
    .catch(error => {
        console.error('Error loading JSON:', error);
    });

function checkProgressAndStart() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
        const progress = JSON.parse(savedData);
   
        if (progress && progress.index < questions.length) {
     
            currentQuestionIndex = progress.index;
            score = progress.score;
            userAnswers = progress.history;
            
       
            showScreen(quizScreen);
            loadQuestion();
        } else {
          
            startQuiz();
        }
    } else {
        startQuiz();
    }
}

function startQuiz() {

    localStorage.removeItem(STORAGE_KEY);
    
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    showScreen(quizScreen);
    loadQuestion();
}

function saveProgress() {
    const progress = {
        index: currentQuestionIndex,
        score: score,
        history: userAnswers
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    
    questionText.textContent = currentQuestion.question;
    questionCount.textContent = `سؤال ${currentQuestionIndex + 1} من ${questions.length}`;
    scoreLive.textContent = `النتيجة: ${score}`;
    
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;

    optionsContainer.innerHTML = '';
    feedbackSection.classList.add('hidden');
    nextBtn.classList.add('hidden');
    submitBtn.classList.remove('hidden');
    submitBtn.disabled = true;

    currentQuestion.options.forEach(option => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.classList.add('option-btn');
        btn.onclick = () => selectOption(btn);
        optionsContainer.appendChild(btn);
    });
}

let selectedOptionBtn = null;

function selectOption(btn) {
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(opt => opt.classList.remove('selected'));
    btn.classList.add('selected');
    selectedOptionBtn = btn;
    submitBtn.disabled = false;
}

submitBtn.addEventListener('click', () => {
    if (!selectedOptionBtn) return;

    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = selectedOptionBtn.textContent;
    const isCorrect = userAnswer === currentQuestion.answer;

    userAnswers.push({
        questionObj: currentQuestion,
        userSelected: userAnswer,
        isCorrect: isCorrect
    });

    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === currentQuestion.answer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        score++;
    } else {
        selectedOptionBtn.classList.add('wrong');
    }

    
    scoreLive.textContent = `النتيجة: ${score}`;

    explanationText.textContent = currentQuestion.explanation;
    referenceText.textContent = currentQuestion.reference_text;
    feedbackSection.classList.remove('hidden');

    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');

});

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        saveProgress();
        loadQuestion();
    } else {
        finishQuiz();
    }
});

function finishQuiz() {
    localStorage.removeItem(STORAGE_KEY);

    showScreen(resultScreen);
    
    const percentage = Math.round((score / questions.length) * 100);
    const finalScoreEl = document.getElementById('final-score');
    const resultMessage = document.getElementById('result-message');
    
    finalScoreEl.textContent = `${percentage}%`;
    document.querySelector('.score-circle').style.setProperty('--percentage', `${percentage}%`);

    if (percentage >= 80) resultMessage.textContent = "ممتاز! 🏆";
    else if (percentage >= 50) resultMessage.textContent = "جيد  💪";
    else resultMessage.textContent = "حاول مرة أخرى  📚";
}

function showScreen(screen) {
    quizScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    reviewScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}

document.getElementById('restart-btn').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY); // تأكيد المسح
    startQuiz();
});

document.getElementById('review-btn').addEventListener('click', () => {
    showScreen(reviewScreen);
    const container = document.getElementById('review-container');
    container.innerHTML = '';

    userAnswers.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('review-item');
        div.classList.add(item.isCorrect ? 'correct-item' : 'wrong-item');

        const statusBadge = item.isCorrect 
            ? '<span class="badge bg-green">إجابة صحيحة</span>' 
            : '<span class="badge bg-red">إجابة خاطئة</span>';

        div.innerHTML = `
            <span class="review-q">س ${index + 1}: ${item.questionObj.question}</span>
            ${statusBadge}
            <div class="review-detail">
                <strong>إجابتك:</strong> ${item.userSelected}
            </div>
            ${!item.isCorrect ? `
            <div class="review-detail" style="color: var(--success-color)">
                <strong>الإجابة الصحيحة:</strong> ${item.questionObj.answer}
            </div>` : ''}
            <div class="review-detail" style="margin-top:10px; font-size:0.85rem; color:#666;">
                <strong>الشرح:</strong> ${item.questionObj.explanation}
            </div>
        `;
        container.appendChild(div);
    });
});

document.getElementById('back-to-result').addEventListener('click', () => {
    showScreen(resultScreen);
});