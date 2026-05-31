// ==========================================
// CONFIGURATION & API KEY LOADING
// ==========================================
let GROQ_API_KEY = "";
const GROQ_MODEL = "openai/gpt-oss-120b"; // Modifiez le modèle ici si nécessaire (ex: llama-3.3-70b-versatile)

// DOM Elements
const textInput = document.getElementById('text-input');
const btnCorrect = document.getElementById('btn-correct');
const btnBack = document.getElementById('btn-back');

// Settings Elements
const btnSettings = document.getElementById('btn-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const settingsModal = document.getElementById('settings-modal');
const btnSaveSettings = document.getElementById('btn-save-settings');
const inputApiKey = document.getElementById('input-api-key');

// Load API key from local environment or local storage
async function initApiKey() {
  // 1. Try local storage first
  const savedKey = localStorage.getItem('GROQ_API_KEY');
  if (savedKey) {
    GROQ_API_KEY = savedKey;
    inputApiKey.value = savedKey;
    return;
  }

  // 2. Try fetching from .env file
  try {
    const response = await fetch('.env');
    if (response.ok) {
      const text = await response.text();
      const match = text.match(/GROQ_API_KEY\s*=\s*([^\s#]+)/);
      if (match && match[1]) {
        GROQ_API_KEY = match[1].replace(/['"]/g, '').trim(); // Remove quotes and spaces
        inputApiKey.value = GROQ_API_KEY;
        return;
      }
    }
  } catch (err) {
    console.log("Impossible de charger le fichier .env, utilisation de la clé de secours.");
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', initApiKey);

// Settings Modal Event Listeners
btnSettings.addEventListener('click', () => {
  settingsModal.classList.add('show');
});

btnCloseSettings.addEventListener('click', () => {
  settingsModal.classList.remove('show');
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.remove('show');
  }
});

btnSaveSettings.addEventListener('click', () => {
  const key = inputApiKey.value.trim();
  if (key) {
    localStorage.setItem('GROQ_API_KEY', key);
    GROQ_API_KEY = key;
    showToast("Clé API enregistrée ! ⚙️");
    settingsModal.classList.remove('show');
  } else {
    localStorage.removeItem('GROQ_API_KEY');
    GROQ_API_KEY = "";
    showToast("Clé supprimée, rechargement...");
    initApiKey().then(() => {
      settingsModal.classList.remove('show');
    });
  }
});

const inputView = document.getElementById('input-view');
const resultView = document.getElementById('result-view');

const highlightedText = document.getElementById('highlighted-text');
const detailsBox = document.getElementById('details-box');
const detailType = document.getElementById('detail-type');
const detailOriginal = document.getElementById('detail-original');
const detailCorrected = document.getElementById('detail-corrected');
const detailReason = document.getElementById('detail-reason');

const ideasSection = document.getElementById('ideas-section');
const ideasList = document.getElementById('ideas-list');
const fullCorrectedText = document.getElementById('full-corrected-text');
const reformulatedText = document.getElementById('reformulated-text');

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toast-msg');
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Navigation back to edit mode
btnBack.addEventListener('click', () => {
  resultView.style.display = 'none';
  inputView.style.display = 'flex';
  closeDetails();
  // Reset textarea height to fit content nicely or default
  textInput.style.height = 'auto';
  textInput.style.height = textInput.scrollHeight + 'px';
});

// Close interactive tooltip box
function closeDetails() {
  detailsBox.style.display = 'none';
}

// Auto-grow textarea as user types
textInput.addEventListener('input', () => {
  textInput.style.height = 'auto';
  textInput.style.height = textInput.scrollHeight + 'px';
});

// Trigger correction when Enter is pressed (Shift+Enter inserts a new line)
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // Prevent standard enter key newline
    btnCorrect.click();  // Click the correction button
  }
});

// Global tokens cache for details view
let currentTokens = [];

// Main submission action
btnCorrect.addEventListener('click', async () => {
  const text = textInput.value.trim();

  if (!GROQ_API_KEY) {
    showToast("Veuillez configurer votre clé API Groq (icône ⚙️ en haut à droite).");
    settingsModal.classList.add('show');
    return;
  }

  if (!text) {
    showToast("Veuillez écrire du texte à corriger.");
    return;
  }

  btnCorrect.disabled = true;
  btnCorrect.innerText = "Correction en cours... ⏳";

  try {
    const data = await analyzeTextWithGroq(text);
    renderResults(data);
    showToast("Analyse terminée ! Cliquez sur les mots en rouge ou bleu.");
  } catch (error) {
    console.error(error);
    showToast(`Erreur : ${error.message}`);
  } finally {
    btnCorrect.disabled = false;
    btnCorrect.innerText = "✨ Analyser et corriger";
  }
});

// Fetch API via Groq
async function analyzeTextWithGroq(text) {
  const url = `https://api.groq.com/openai/v1/chat/completions`;

  const systemInstruction = `Tu es un assistant correcteur de français ultra-précis. 
  L'utilisateur va te soumettre un texte. Tu dois analyser et découper l'INTEGRALITÉ du texte original sous forme d'un tableau de segments successifs (tokens) au format JSON. La reconstruction de tous les segments dans l'ordre de l'index doit former EXACTEMENT le texte original fourni par l'utilisateur (espaces et ponctuation compris).
  
  Renvoie obligatoirement la réponse dans ce format JSON exact :
  {
    "tokens": [
      {
        "text": "la portion exacte du texte original de ce segment (par exemple 'Je ', 'doit', ' manger ', 'apple', '.')",
        "type": "correct" | "error" | "english",
        "corrected": "la correction recommandée (ou la traduction si type=english). Laisse vide si type=correct",
        "explanation": "explication claire et courte en français de la faute ou de la traduction"
      }
    ],
    "reformulated_text": "La phrase de l'utilisateur entièrement reformulée et réécrite de manière fluide, élégante, naturelle et bien structurée en français correct, en conservant le sens d'origine.",
    "ideas": [
      "Idée/proposition 1 pour améliorer le texte ou suggérer de la créativité",
      "Idée/proposition 2 pour enrichir le vocabulaire"
    ]
  }

  Règles importantes :
  1. "type" doit être "error" pour les fautes d'orthographe, de grammaire ou de conjugaison.
  2. "type" doit être "english" pour les mots ou expressions insérés en anglais.
  3. "type" doit être "correct" pour tout le reste du texte valide (y compris les espaces, la ponctuation, et les mots corrects).
  4. La concaténation de tous les champs "text" dans l'ordre du tableau doit recréer à l'identique la chaîne d'origine.
  5. Propose 2 à 3 idées d'écriture intéressantes dans le tableau "ideas".
  6. Renvoie uniquement le JSON brut.`;

  const payload = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erreur serveur (${response.status})`);
  }

  const data = await response.json();
  try {
    const rawText = data.choices[0].message.content;
    return JSON.parse(rawText);
  } catch (e) {
    throw new Error("La réponse de l'IA n'est pas au format attendu.");
  }
}

// Render Results on Screen
function renderResults(data) {
  highlightedText.innerHTML = '';
  ideasList.innerHTML = '';
  closeDetails();

  currentTokens = data.tokens || [];

  // Render tokens
  currentTokens.forEach((token, index) => {
    if (token.type === 'correct') {
      const span = document.createElement('span');
      span.innerText = token.text;
      highlightedText.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.innerText = token.text;
      span.className = token.type === 'error' ? 'token-error' : 'token-english';
      span.dataset.index = index;

      // Click event to show error details
      span.addEventListener('click', () => showTokenDetails(index));
      highlightedText.appendChild(span);
    }
  });

  // Reconstruct and display full corrected text
  const fullText = currentTokens.map(t => t.type === 'correct' ? t.text : (t.corrected || t.text)).join('');
  fullCorrectedText.innerText = fullText.trim();

  // Display reformulated text
  reformulatedText.innerText = (data.reformulated_text || "").trim();

  // Render ideas
  if (data.ideas && data.ideas.length > 0) {
    ideasSection.style.display = 'block';
    data.ideas.forEach(idea => {
      const li = document.createElement('li');
      li.innerText = idea;
      ideasList.appendChild(li);
    });
  } else {
    ideasSection.style.display = 'none';
  }

  // Switch UI views
  inputView.style.display = 'none';
  resultView.style.display = 'flex';
}

// Show interactive box with error details
function showTokenDetails(index) {
  const token = currentTokens[index];
  if (!token) return;

  detailType.innerText = token.type === 'error' ? '❌ Correction Orthographe / Grammaire' : '🇬🇧 Traduction Anglais';
  detailOriginal.innerText = token.text.trim();
  detailCorrected.innerText = token.corrected;
  detailReason.innerText = token.explanation || 'Aucune explication supplémentaire.';

  detailsBox.style.display = 'block';

  // Scroll to detail box smoothly
  detailsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
