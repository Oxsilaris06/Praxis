import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1";

env.allowLocalModels = false;

const status = document.getElementById('status');
const output = document.getElementById('output');
const promptInput = document.getElementById('prompt');
const sendButton = document.getElementById('send-button');

let generator = null;

// Fonction pour ajouter un message dans l'interface
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
        status.textContent = 'Chargement de Microsoft Phi-2 (long)...';
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
    
    // --- NOUVEAU : Formatage du prompt pour le modèle Phi-2
    const formattedPrompt = `Chat\n\nHuman: ${prompt}\n\nAI:`;

    try {
        const result = await generator(formattedPrompt, {
            max_new_tokens: 512,
            temperature: 0.7,
            do_sample: true,
            callback_function: (outputs) => {
                const text = outputs[0].generated_text;
                const cleanText = text.replace(formattedPrompt, "");
                botMessageDiv.innerHTML = `<strong>Phi-2:</strong> ${cleanText}`;
                output.scrollTop = output.scrollHeight;
            },
            return_full_text: false, 
        });
        
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
