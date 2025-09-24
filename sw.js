import { CreateWebWorkerMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm";

// --- Sélection des éléments HTML ---
const output = document.getElementById("output");
const promptInput = document.getElementById("prompt");
const sendButton = document.getElementById("send-button");

// Éléments de la barre de chargement
const loadingContainer = document.getElementById("loading-container");
const progressLabel = document.getElementById("progress-label");
const progressBar = document.getElementById("progress-bar");


// --- Configuration du modèle ---
const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";

let engine; // Variable qui contiendra le moteur du modèle

// --- Fonctions de l'application ---

/**
 * Affiche un message dans la boîte de dialogue.
 * @param {string} sender - L'expéditeur du message (ex: "Vous", "Gemma").
 * @param {string} message - Le contenu du message.
 */
function appendMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    output.appendChild(messageDiv);
    output.scrollTop = output.scrollHeight;
    return messageDiv;
}

/**
 * Initialise le moteur WebLLM et charge le modèle.
 */
async function initializeModel() {
    engine = await CreateWebWorkerMLCEngine(
        new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
        SELECTED_MODEL,
        {
            // Callback pour suivre la progression du chargement du modèle
            initProgressCallback: (progress) => {
                // Met à jour le texte descriptif de l'étape en cours
                progressLabel.textContent = progress.text;
                
                // Calcule le pourcentage de progression
                const percentage = (progress.progress * 100).toFixed(2);
                
                // Met à jour la barre de progression visuelle et son texte
                progressBar.style.width = `${percentage}%`;
                progressBar.textContent = `${percentage}%`;
            }
        }
    );

    // Cache la barre de chargement
    loadingContainer.style.display = 'none';
    
    // Affiche l'interface de chat
    output.style.display = 'block';
    appendMessage("Système", "Modèle chargé ! Vous pouvez maintenant discuter.");
    
    // Active les contrôles du chat
    sendButton.disabled = false;
    promptInput.disabled = false;
    promptInput.focus();
}

/**
 * Gère l'envoi du prompt et la réception de la réponse.
 */
async function getResponse() {
    const prompt = promptInput.value.trim();
    if (!prompt || sendButton.disabled) return;

    appendMessage("Vous", prompt);
    promptInput.value = "";
    sendButton.disabled = true;

    const gemmaMessageDiv = appendMessage("Gemma", "...");

    try {
        const chunks = await engine.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            stream: true,
        });

        let reply = "";
        for await (const chunk of chunks) {
            const delta = chunk.choices[0]?.delta?.content || "";
            reply += delta;
            gemmaMessageDiv.innerHTML = `<strong>Gemma:</strong> ${reply}`;
            output.scrollTop = output.scrollHeight;
        }
    } catch (error) {
        gemmaMessageDiv.innerHTML = `<strong>Système:</strong> Une erreur est survenue. ${error.message}`;
        console.error(error);
    } finally {
        sendButton.disabled = false;
        promptInput.focus();
    }
}

// --- Écouteurs d'événements ---
sendButton.addEventListener("click", getResponse);
promptInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        getResponse();
    }
});

// --- Démarrage de l'application ---
initializeModel();