// On importe une fonction différente car nous n'utilisons plus de Worker.
import { CreateMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm";

// --- Sélection des éléments HTML ---
const output = document.getElementById("output");
const promptInput = document.getElementById("prompt");
const sendButton = document.getElementById("send-button");
const stopButton = document.getElementById("stop-button");
const copyButton = document.getElementById("copy-button");
const loadingContainer = document.getElementById("loading-container");
const progressLabel = document.getElementById("progress-label");
const progressBar = document.getElementById("progress-bar");

// --- MODIFICATION ICI : On utilise le modèle compatible f32 ---
const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";
// -----------------------------------------------------------

let engine;
let lastGemmaMessageDiv = null; // Variable pour garder en mémoire le dernier message du bot

/**
 * Affiche un message dans la boîte de dialogue.
 */
function appendMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    output.appendChild(messageDiv);
    output.scrollTop = output.scrollHeight;
    if (sender === "Gemma") {
        lastGemmaMessageDiv = messageDiv; // Met à jour la référence au dernier message de Gemma
    }
    return messageDiv;
}

/**
 * Initialise le moteur WebLLM directement sur le thread principal.
 */
async function initializeModel() {
    engine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (progress) => {
            progressLabel.textContent = progress.text;
            const percentage = (progress.progress * 100).toFixed(2);
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `${percentage}%`;
        }
    });

    loadingContainer.style.display = 'none';
    output.style.display = 'block';
    appendMessage("Système", "Modèle chargé ! Vous pouvez maintenant discuter.");
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
    stopButton.disabled = false; // Active le bouton stop

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
        if (error.message.includes("interrupted")) {
            gemmaMessageDiv.innerHTML += " (stoppé)";
        } else {
            gemmaMessageDiv.innerHTML = `<strong>Système:</strong> Une erreur est survenue. ${error.message}`;
            console.error(error);
        }
    } finally {
        sendButton.disabled = false;
        stopButton.disabled = true; // Désactive le bouton stop
        promptInput.focus();
    }
}

// --- Logique des nouveaux boutons ---
function handleStop() {
    engine.interrupt();
    console.log("Interruption demandée.");
}

function handleCopy() {
    if (lastGemmaMessageDiv) {
        const textToCopy = lastGemmaMessageDiv.innerText.replace("Gemma:", "").trim();
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyButton.textContent = "✅ Copié !";
                setTimeout(() => { copyButton.textContent = "📋 Copier la réponse"; }, 2000);
            })
            .catch(err => {
                console.error("Erreur de copie : ", err);
            });
    }
}

// --- Écouteurs d'événements ---
sendButton.addEventListener("click", getResponse);
promptInput.addEventListener("keypress", (e) => { e.key === "Enter" && getResponse(); });
stopButton.addEventListener("click", handleStop);
copyButton.addEventListener("click", handleCopy);

// --- Démarrage de l'application ---
stopButton.disabled = true; // Désactivé au démarrage
initializeModel();
