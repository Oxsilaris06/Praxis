// web-llm-worker.js
// Ce fichier est essentiel pour exécuter le modèle d'IA dans un thread séparé,
// évitant ainsi de bloquer l'interface utilisateur principale pendant les calculs intensifs.

try {
    // Il importe simplement le script worker principal de la bibliothèque WebLLM.
    self.importScripts("https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/lib/wasm/web-llm-worker.js");
} catch (e) {
    console.error("Erreur critique : Impossible de charger le script du worker WebLLM.", e);
    // On peut envoyer un message à la page principale pour signaler l'échec
    self.postMessage({ type: 'error', payload: 'Failed to load WebLLM worker script.' });
}



