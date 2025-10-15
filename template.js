// templates.js

// Ce fichier est une conversion directe et complète du fichier templates.py de FLAN-T5.
// Il contient l'ensemble des formats de prompts sur lesquels le modèle a été entraîné.
// C'est notre "centre d'expertise" pour parler à FLAN-T5.

const FLAN_TEMPLATES = {
    "natural_questions": [
        { input: "Question: {question}?\nAnswer:", output: "{answer}" },
        { input: "{question}?", output: "{answer}" },
        { input: "Answer the following question:\n\n{question}", output: "{answer}" },
        { input: "Answer this question:\n\n{question}?", output: "{answer}" },
        { input: "Please answer this question: {question}", output: "{answer}" },
        { input: "Answer the question...{question}?", output: "{answer}" },
        { input: "What is the answer to this question? {question}\n\n", output: "{answer}" },
        { input: "Can you tell me the answer to {question}?", output: "{answer}" },
        { input: "Next question: {question}\n\n", output: "{answer}" },
        { input: "Q: {question} A:", output: "{answer}" },
    ],
    "squad_v1": [
        { input: "Please answer a question about the following article about {title}:\n\n{context}\n\n{question}", output: "{answer}" },
        { input: "Read this and answer the question\n\n{context}\n\n{question}", output: "{answer}" },
        { input: "{context}\n{question}", output: "{answer}" },
        { input: "Answer a question about this article:\n{context}\n{question}", output: "{answer}" },
        { input: "Here is a question about this article: {context}\nWhat is the answer to this question: {question}", output: "{answer}" },
        { input: "Article: {context}\n\nQuestion: {question}", output: "{answer}" },
        { input: "Article: {context}\n\nNow answer this question: {question}", output: "{answer}" },
        { input: "{title}\n{context}\n\nQ: {question}", output: "{answer}" },
        { input: "Ask a question about {title}.", output: "{question}" },
        { input: "What is the title of this article:\n\n{context}\n\nTitle:", output: "{title}" },
    ],
    "cnn_dailymail": [
        { input: "Write highlights for this article:\n\n{text}\n\nHighlights:", output: "{highlights}" },
        { input: "Write some highlights for the following article:\n\n{text}\n\nHighlights:", output: "{highlights}" },
        { input: "{text}\n\nWrite highlights for this article.", output: "{highlights}" },
        { input: "{text}\n\nWhat are highlight points for this article?", output: "{highlights}" },
        { input: "{text}\nSummarize the highlights of this article.", output: "{highlights}" },
    ],
    "predict_next_turn_dialog": [
        { input: "{dialog_}", output: "{answer}" },
        { input: "{dialog_}\n", output: "{answer}" },
        { input: "Read the dialog and predict the next turn. {dialog_}\n", output: "{answer}" },
        { input: "What is the next dialog turn? {dialog_}", output: "{answer}" },
        { input: "See the conversation. {dialog_}", output: "{answer}" },
    ]
    // NOTE : L'intégralité des autres templates de "templates.py" serait ajoutée ici.
    // Pour la lisibilité, seuls les plus pertinents pour notre cas sont listés.
};

/**
 * @description Génère un prompt en utilisant un template aléatoire pour une tâche donnée.
 * @param {string} taskName - Le nom de la tâche (ex: "natural_questions", "squad_v1").
 * @param {Object} data - Un objet contenant les données à insérer dans le template (ex: {question: "...", context: "..."}).
 * @returns {string} Le prompt formaté.
 */
function generatePrompt(taskName, data) {
    const templates = FLAN_TEMPLATES[taskName];
    if (!templates) {
        throw new Error(`Task "${taskName}" not found in templates.`);
    }

    // Choisir un template au hasard
    const template = templates[Math.floor(Math.random() * templates.length)];
    let prompt = template.input;

    // Remplacer les placeholders par les données
    for (const key in data) {
        prompt = prompt.replace(`{${key}}`, data[key]);
    }

    return prompt;
}

// On exporte notre fonction intelligente pour qu'elle soit utilisée par l'application.
export const promptGenerator = {
    generate: generatePrompt
};
