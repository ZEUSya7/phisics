// DOM элементы (соответствуют HTML из предыдущих шагов)
const questionText = document.getElementById("question");
const optionsWrap = document.getElementById("options");
const progressText = document.getElementById("progress");
const progressFill = document.getElementById("progress-fill");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

// параметры викторины
let selectedQuestions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswerIndex = null; // индекс выбранного варианта (null — не выбран)

// утилиты
function shuffle(arr) {
  return arr
    .map(v => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(x => x.v);
}

function pickRandomThree() {
  const shuffled = shuffle(allQuestions_2);
  return shuffled.slice(0, 10);
}

// Плавное изменение шрифта: устанавливаем transition в JS (падают/возвращаются значения)
function setQuestionFontSize(vwValue) {
  questionText.style.transition = "font-size 280ms ease";
  questionText.style.fontSize = vwValue;
}
function setOptionFontSize(el, vwValue) {
  el.style.transition = "font-size 220ms ease";
  el.style.fontSize = vwValue;
}

// вычисление целевого размера шрифта в зависимости от длины
function computeQuestionFontSize(len) {
  // возвращаем строку с единицей 'vw'
  if (len > 400) return "0.9vw";
  if (len > 300) return "1.0vw";
  if (len > 220) return "1.1vw";
  if (len > 160) return "1.2vw";
  return "1.35vw"; // короткие вопросы — чуть крупнее
}
function computeOptionFontSize(len) {
  if (len > 140) return "0.75vw";
  if (len > 100) return "0.85vw";
  if (len > 70) return "0.95vw";
  return "1.02vw";
}

// Обновление прогресса (текст и полоса)
// progressFill ширину ставим от текущего индекса (0..N) / total *100
function updateProgress() {
  const total = selectedQuestions.length;
  progressText.textContent = `${Math.min(currentIndex + 1, total)} / ${total}`;
  const pct = (currentIndex / total) * 100;
  progressFill.style.width = `${pct}%`;
}

// загрузка вопроса (с анимацией уменьшения шрифта перед сменой)
function loadQuestionWithAnimation() {
  // перед сменой слегка уменьшим шрифт (плавно), чтобы при установке нового размера было мягко
  questionText.style.transition = "font-size 180ms ease";
  questionText.style.fontSize = "0.9vw";
  // также уменьшим шрифт опций
  document.querySelectorAll(".option").forEach(opt => {
    opt.style.transition = "font-size 160ms ease";
    opt.style.fontSize = "0.8vw";
  });

  // через короткий таймаут подгружаем новый контент и устанавливаем вычисленные размеры
  setTimeout(loadQuestion, 180);
}

function loadQuestion() {
  selectedAnswerIndex = null;
  nextBtn.disabled = true;

  const q = selectedQuestions[currentIndex];
  // set text
  questionText.textContent = q.question;

  // render options
  optionsWrap.innerHTML = "";
  q.answers.forEach((optText, idx) => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.tabIndex = 0; // для фокусировки клавишами
    btn.textContent = optText;
    // начальный стиль шрифта (будет плавно меняться)
    btn.style.fontSize = computeOptionFontSize(optText.length);
    btn.addEventListener("click", () => {
      // отметка выбранного варианта
      document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
      btn.classList.add("selected");
      selectedAnswerIndex = idx;
      nextBtn.disabled = false;
    });
    // поддержка выбора через Enter/Space
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
    optionsWrap.appendChild(btn);
  });

  // плавно выставляем размер шрифта для вопроса и вариантов, считая реальные длины
  const qFont = computeQuestionFontSize(q.question.length);
  // чуть задержим, чтобы переход был мягче (не резко)
  setTimeout(() => {
    setQuestionFontSize(qFont);
    document.querySelectorAll(".option").forEach(optEl => {
      const len = optEl.textContent.length;
      setOptionFontSize(optEl, computeOptionFontSize(len));
    });
  }, 60);

  updateProgress();

  // кнопка Next на последнем вопросе — менять текст
  if (currentIndex === selectedQuestions.length - 1) {
    nextBtn.textContent = "Завершити тест";
  } else {
    nextBtn.textContent = "Наступне питання";
  }
}

// обработчик на Next
nextBtn.addEventListener("click", () => {
  if (selectedAnswerIndex === null) return; // защита

  // проверяем ответ и увеличиваем счёт только при нажатии Next
  const currentQ = selectedQuestions[currentIndex];
  if (selectedAnswerIndex === currentQ.correct) score++;

  currentIndex++;

  if (currentIndex >= selectedQuestions.length) {
    // завершение - показать результат
    showResult();
  } else {
    // загрузка следующего вопроса с анимацией
    loadQuestionWithAnimation();
  }
});

// показать результат и кнопку перезапуска
function showResult() {
  progressText.textContent = `Ваш результат: ${score} / ${selectedQuestions.length}`;
  progressFill.style.width = "100%";
  questionText.textContent = "Дякуємо! Ви завершили тест.";
  optionsWrap.innerHTML = "";
  nextBtn.style.display = "none";
  restartBtn.style.display = "inline-block";
}

// перезапуск викторины (новые случайные 3 вопроса)
restartBtn.addEventListener("click", () => {
  initQuiz();
  nextBtn.style.display = "inline-block";
  restartBtn.style.display = "none";
});

// инициализация
function initQuiz() {
  selectedQuestions = pickRandomThree();
  currentIndex = 0;
  score = 0;
  selectedAnswerIndex = null;
  nextBtn.disabled = true;
  // сброс прогресс-бар
  progressFill.style.width = "0%";
  // загружаем первый вопрос (без предварительного сжатия, но с небольшим эффектом)
  loadQuestionWithAnimation();
}

// старт

initQuiz();
