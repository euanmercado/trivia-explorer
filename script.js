const CATEGORY_URL = 'https://opentdb.com/api_category.php';
const QUESTIONS_URL = 'https://opentdb.com/api.php';

const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const amountSelect = document.getElementById('amount');
const drawBtn = document.getElementById('draw-btn');
const statusEl = document.getElementById('status');
const deckEl = document.getElementById('deck');

// Decode HTML entities that OpenTDB encodes into its text (e.g. &quot;, &#039;)
function decodeHtml(str) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

// Fisher-Yates shuffle so the correct answer isn't always in the same spot
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function loadCategories() {
  try {
    const res = await fetch(CATEGORY_URL);
    if (!res.ok) throw new Error(`Category request failed (${res.status})`);
    const data = await res.json();

    data.trivia_categories.forEach((cat) => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Could not load categories — you can still draw cards from "Any category".';
  }
}

function buildQuestionsUrl() {
  const params = new URLSearchParams();
  params.set('amount', amountSelect.value);
  if (categorySelect.value) params.set('category', categorySelect.value);
  if (difficultySelect.value) params.set('difficulty', difficultySelect.value);
  params.set('type', 'multiple');
  return `${QUESTIONS_URL}?${params.toString()}`;
}

function renderCard(item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-expanded', 'false');

  const allAnswers = shuffle([...item.incorrect_answers, item.correct_answer]);

  card.innerHTML = `
    <div class="card-meta">
      <span>${decodeHtml(item.category)}</span>
      <span class="difficulty-stamp difficulty-${item.difficulty}">${item.difficulty}</span>
    </div>
    <p class="card-question">${decodeHtml(item.question)}</p>
    <p class="card-hint">Click to reveal answer choices</p>
    <ul class="answers">
      ${allAnswers.map((a) => `
        <li><button type="button" class="answer-btn" data-correct="${a === item.correct_answer}">${decodeHtml(a)}</button></li>
      `).join('')}
    </ul>
  `;

  const hint = card.querySelector('.card-hint');

  // Clicking the card body reveals the (unmarked) answer choices
  const reveal = () => {
    if (card.classList.contains('revealed')) return;
    card.classList.add('revealed');
    card.setAttribute('aria-expanded', 'true');
    hint.textContent = 'Pick an answer';
  };

  card.addEventListener('click', reveal);
  card.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
      e.preventDefault();
      reveal();
    }
  });

  // Clicking an answer button locks in a guess: correct turns green,
  // a wrong pick turns red and the correct choice lights up green too
  card.querySelectorAll('.answer-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (card.classList.contains('answered')) return;

      card.classList.add('answered');
      const isCorrect = btn.dataset.correct === 'true';
      btn.classList.add(isCorrect ? 'correct' : 'incorrect');

      if (!isCorrect) {
        card.querySelector('.answer-btn[data-correct="true"]').classList.add('correct');
      }
    });
  });

  return card;
}

async function drawCards() {
  drawBtn.disabled = true;
  statusEl.textContent = 'Shuffling the deck…';
  deckEl.innerHTML = '';

  try {
    const res = await fetch(buildQuestionsUrl());
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const data = await res.json();

    // OpenTDB response_code: 0 = success, 1 = not enough questions for that filter combo
    if (data.response_code === 1) {
      deckEl.innerHTML = '<p class="empty-state">Not enough questions for that combination — try a different category or difficulty.</p>';
      statusEl.textContent = '';
      return;
    }
    if (data.response_code !== 0) {
      throw new Error(`API returned response_code ${data.response_code}`);
    }

    data.results.forEach((item) => deckEl.appendChild(renderCard(item)));
    statusEl.textContent = `${data.results.length} cards drawn. Click a card to reveal the answers.`;
  } catch (err) {
    console.error(err);
    deckEl.innerHTML = '<p class="error-state">Something went wrong fetching trivia questions. Please try again in a moment.</p>';
    statusEl.textContent = '';
  } finally {
    drawBtn.disabled = false;
  }
}

drawBtn.addEventListener('click', drawCards);

loadCategories().then(drawCards);