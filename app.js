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

async function getResponse() {
    const prompt = promptInput.value.trim();
    if (!prompt || !generator || sendButton.disabled) return;

    appendMessage('Vous', prompt);
    promptInput.value = '';
    sendButton.disabled = true;

    const gemmaMessageDiv = appendMessage('Gemma', '...');

    try {
        await generator(prompt, {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true,
            callback_function: (chunks) => {
                // --- DIAGNOSTIC : On affiche l'objet "chunks" brut ---
                const debug_text = JSON.stringify(chunks);
                gemmaMessageDiv.innerHTML = `<strong>Gemma:</strong> ${debug_text}`;
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

sendButton.addEventListener('click', getResponse);
promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getResponse();
    }
});

initializeModel();
