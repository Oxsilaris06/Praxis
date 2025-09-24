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

const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";
let engine;
let lastGemmaMessageDiv = null;

function appendMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    output.appendChild(messageDiv);
    output.scrollTop = output.scrollHeight;
    if (sender === "Gemma") {
        lastGemmaMessageDiv = messageDiv;
    }
    return messageDiv;
}

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

async function getResponse() {
    const prompt = promptInput.value.trim();
    if (!prompt || sendButton.disabled) return;

    appendMessage("Vous", prompt);
    promptInput.value = "";
    sendButton.disabled = true;
    stopButton.disabled = false;

    const gemmaMessageDiv = appendMessage("Gemma", "...");
    
    try {
        const chunks = await engine.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            stream: true,
            max_gen_len: 1024
        });

        let reply = "";
        for await (const chunk of chunks) {
            const delta = chunk.choices[0]?.delta?.content || "";
            reply += delta;
            gemmaMessageDiv.innerHTML = `<strong>Gemma:</strong> ${reply}`;
            output.scrollTop = output.scrollHeight;
        }
    } catch (error) {
        // La méthode reset() peut aussi lancer une erreur d'interruption, on la gère ici
        if (error.message.includes("interrupted")) {
            gemmaMessageDiv.innerHTML += " (stoppé)";
        } else {
            gemmaMessageDiv.innerHTML = `<strong>Système:</strong> Une erreur est survenue. ${error.message}`;
            console.error(error);
        }
    } finally {
        sendButton.disabled = false;
        stopButton.disabled = true;
        promptInput.focus();
    }
}

// --- Logique des nouveaux boutons ---
function handleStop() {
    // --- CORRECTION FINALE : La bonne méthode est engine.reset() ---
    engine.reset();
    console.log("Moteur réinitialisé.");
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
stopButton.disabled = true;
initializeModel();
