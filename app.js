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
        status.textContent = 'Chargement de StableLM (long)...';
        generator = await pipeline('text-generation', 'Xenova/stablelm-2-zephyr-1_6b', {
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

    const botMessageDiv = appendMessage('StableLM', '...');
    
    // --- MODIFICATION MAJEURE : Formatage du prompt pour le modèle StableLM
    const formattedPrompt = `<|user|>\n${prompt}<|endoftext|>\n<|assistant|>`;

    try {
        const result = await generator(formattedPrompt, {
            max_new_tokens: 512,
            temperature: 0.7,
            do_sample: true,
            // --- NOUVEAU : Option pour le streaming
            callback_function: (outputs) => {
                // On récupère le texte généré et on enlève le prompt initial
                const text = outputs[0].generated_text;
                const cleanText = text.replace(formattedPrompt, "");
                // On met à jour le contenu de la div
                botMessageDiv.innerHTML = `<strong>StableLM:</strong> ${cleanText}`;
                output.scrollTop = output.scrollHeight;
            },
            // On s'assure de ne pas retourner le prompt dans le résultat final
            return_full_text: false, 
        });

        // Le texte final est déjà affiché via la fonction de rappel
        // On n'a donc plus besoin de cette ligne :
        // const cleanText = result[0].generated_text;
        
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
