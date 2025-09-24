// On importe les fonctions de la nouvelle bibliothèque
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1";

// Configuration pour que la bibliothèque fonctionne bien dans le navigateur
env.allowLocalModels = false;

// --- Sélection des éléments HTML ---
const status = document.getElementById('status');
const output = document.getElementById('output');
const promptInput = document.getElementById('prompt');
const sendButton = document.getElementById('send-button');

let generator = null; // Variable qui contiendra notre modèle

// --- Fonctions de l'application ---

function appendMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    output.appendChild(messageDiv);
    output.scrollTop = output.scrollHeight;
    return messageDiv;
}

// Fonction principale qui charge le modèle
async function initializeModel() {
    try {
        // --- MODIFICATION : On utilise un modèle 100% public pour le test ---
        status.textContent = 'Chargement du modèle de test (distilgpt2)...';
        generator = await pipeline('text-generation', 'Xenova/distilgpt2', {
            progress_callback: (progress) => {
                status.textContent = `${progress.status} - ${progress.file} (${Math.round(progress.progress)}%)`;
            }
        });

        status.textContent = 'Modèle chargé ! Vous pouvez discuter.';
        promptInput.disabled = false;
        sendButton.disabled = false;
        promptInput.focus();

    } catch (error) {
        status.textContent = `Erreur: ${error.message}`;
        console.error(error);
    }
}

// Fonction pour générer une réponse
async function getResponse() {
    const prompt = promptInput.value.trim();
    if (!prompt || !generator || sendButton.disabled) return;

    appendMessage('Vous', prompt);
    promptInput.value = '';
    sendButton.disabled = true;

    const gemmaMessageDiv = appendMessage('Gemma', '...');

    try {
        const stream = await generator(prompt, {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true,
            callback_function: (chunks) => {
                const text = chunks[0].output_text;
                gemmaMessageDiv.innerHTML = `<strong>Gemma:</strong> ${text}`;
                output.scrollTop = output.scrollHeight;
            }
        });

    } catch (error) {
        gemmaMessageDiv.innerHTML = `<strong>Système:</strong> Une erreur est survenue durant la génération.`;
        console.error(error);
    } finally {
        sendButton.disabled = false;
        promptInput.focus();
    }
}

// --- Écouteurs d'événements ---
sendButton.addEventListener('click', getResponse);
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getResponse();
    }
});

// --- Démarrage ---
initializeModel();
