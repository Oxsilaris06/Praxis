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
        // On charge un pipeline de "text-generation" avec une version de Gemma optimisée pour Transformers.js
        status.textContent = 'Chargement du modèle (peut prendre plusieurs minutes)...';
        generator = await pipeline('text-generation', 'Xenova/gemma-2b-it', {
            progress_callback: (progress) => {
                // Met à jour l'état du chargement
                status.textContent = `${progress.status} - ${progress.file} (${Math.round(progress.progress)}%)`;
            }
        });

        status.textContent = 'Modèle chargé ! Vous pouvez discuter.';
        promptInput.disabled = false;
        sendButton.disabled = false;
        promptInput.focus();

    } catch (error) {
        status.textContent = 'Erreur lors du chargement du modèle.';
        console.error(error);
    }
}

// Fonction pour générer une réponse
async function getResponse() {
    const prompt = promptInput.value.trim();
    if (!prompt || !generator || sendButton.disabled) return;

    appendMessage('Vous', prompt);
    const userPrompt = `Réponds en français à la question suivante : ${prompt}`; // On guide le modèle
    promptInput.value = '';
    sendButton.disabled = true;

    // Affiche un placeholder pour la réponse
    const gemmaMessageDiv = appendMessage('Gemma', '...');

    try {
        // On génère la réponse en mode "streaming"
        const stream = await generator(userPrompt, {
            max_new_tokens: 512, // Limite de sécurité
            temperature: 0.7,
            do_sample: true,
            // Fonction appelée pour chaque nouveau morceau de texte (token)
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
