import { Tensor, InferenceSession } from "https://cdn.jsdelivr.net/npm/onnxruntime-web@latest";

const status = document.getElementById('status');
const output = document.getElementById('output');
const promptInput = document.getElementById('prompt');
const sendButton = document.getElementById('send-button');

let session = null;
let tokenizer = null;

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
        status.textContent = 'Étape 1/3: Connexion au modèle...';
        
        // --- CHARGEMENT DU MODÈLE ONNX DEPUIS GOOGLE DRIVE ---
        const modelUrl = 'https://drive.google.com/uc?export=download&id=1RaUANltYSe11xZ7q3nqvi1em-pwsbU3D';

        // --- CHARGEMENT DU TOKENIZER DEPUIS GITHUB ---
        const tokenizerUrl = 'https://raw.githubusercontent.com/Oxsilaris06/Praxis/refs/heads/main/tokenizer.json';

        // Charge le modèle ONNX
        status.textContent = 'Étape 2/3: Chargement du modèle depuis le cloud...';
        session = await InferenceSession.create(modelUrl);

        // Charge le tokenizer
        status.textContent = 'Étape 3/3: Initialisation de l\'IA...';
        const tokenizerFiles = await (await fetch(tokenizerUrl)).json();

        tokenizer = new (class {
            constructor(data) {
                this.vocab = data.vocab;
            }
            encode(text) {
                // Cette logique de tokenization est très simple et ne fonctionnera pas
                // avec un vrai modèle d'IA. Elle est juste là pour éviter une erreur.
                return text.split('').map(char => this.vocab[char] || 0);
            }
        })(tokenizerFiles);

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
    if (!prompt || !session || !tokenizer || sendButton.disabled) return;

    appendMessage('Vous', prompt);
    promptInput.value = '';
    sendButton.disabled = true;

    const botMessageDiv = appendMessage('AI', '...');

    try {
        // Encodage du prompt
        const encoded = tokenizer.encode(prompt);
        const inputTensor = new Tensor('int64', BigInt64Array.from(encoded), [1, encoded.length]);

        // Exécution du modèle
        const outputs = await session.run({ input: inputTensor });
        const outputTensor = outputs.output.data;

        // Décoder la réponse (exemple très simple)
        const generatedText = outputTensor.join(''); 
        botMessageDiv.innerHTML = `<strong>AI:</strong> ${generatedText}`;

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
