import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1";

env.allowLocalModels = false;

const status = document.getElementById('status');
const output = document.getElementById('output');
const promptInput = document.getElementById('prompt');
const sendButton = document.getElementById('send-button');

let generator = null;

function appendMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    output.appendChild(messageDiv);
    output.scrollTop = output.scrollHeight;
    return messageDiv;
}

async function initializeModel() {
    try {
        // --- MODIFICATION : On charge le modèle Microsoft Phi-2 ---
        status.textContent = 'Chargement de Phi-2 (long)...';
        generator = await pipeline('text-generation', 'Xenova/phi-2', {
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

async function getResponse() {
    const prompt = promptInput.value.trim();
    if (!prompt || !generator || sendButton.disabled) return;

    appendMessage('Vous', prompt);
    promptInput.value = '';
    sendButton.disabled = true;

    const botMessageDiv = appendMessage('Phi-2', '...');
    
    // Formatage du prompt optimisé pour les modèles d'instruction comme Phi-2
    const formattedPrompt = `Instruct: ${prompt}\nOutput:`;

    try {
        const result = await generator(formattedPrompt, {
            max_new_tokens: 512,
            temperature: 0.7,
            do_sample: true
        });

        const text = result[0].generated_text;
        // Nettoyage pour enlever le prompt de la réponse
        const cleanText = text.replace(formattedPrompt, ""); 
        botMessageDiv.innerHTML = `<strong>Phi-2:</strong> ${cleanText}`;
        output.scrollTop = output.scrollHeight;

    } catch (error) {
        botMessageDiv.innerHTML = `<strong>Système:</strong> Erreur - ${error.message}`;
        console.error(error);
    } finally {
        sendButton.disabled = false;
        promptInput.focus();
    }
}

sendButton.addEventListener('click', getResponse);
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getResponse();
    }
});

initializeModel();
