// worker.js
// Ce script importe et exécute le gestionnaire de WebLLM dans un thread séparé (Worker).
// Cela permet au modèle de langage d'effectuer des calculs intensifs 
// sans jamais bloquer l'interface utilisateur principale de la page web.

import { WebWorkerMLCEngineHandler } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm";

// Le handler est l'objet qui écoute les messages provenant de app.js et les transmet au moteur MLC.
const handler = new WebWorkerMLCEngineHandler();

// "self.onmessage" est l'écouteur d'événement standard dans un Web Worker.
// Il se déclenche chaque fois que le script principal (app.js) envoie un message au worker.
self.onmessage = msg => {
    handler.onmessage(msg);
};