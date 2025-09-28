/**
 * Analyse des rapports RETEX en utilisant l'API Gemini via le SDK.
 * @param {Array} reports - Un tableau d'objets JSON représentant les rapports.
 * @param {HTMLElement} statusElement - L'élément pour afficher les messages de statut.
 * @param {HTMLElement} outputElement - L'élément pour afficher le résultat de l'analyse.
 * @returns {string|null} Le contenu HTML du rapport ou null en cas d'erreur.
 */
export async function generateRetexAnalysis(reports, statusElement, outputElement) {
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        statusElement.textContent = "Erreur: Clé API Gemini non configurée. Allez dans Paramètres.";
        return null;
    }

    const formattedReports = reports.map(report => JSON.stringify(report, null, 2)).join('\n\n--- Rapport suivant ---\n\n');
    const prompt = `
    Tu es un analyste tactique de la Gendarmerie Française.
    Ton rôle est de synthétiser des rapports de retour d'expérience (RETEX) suite à des opérations de police judiciaire.
    L'objectif est de produire une analyse impartiale et objective, en te basant uniquement sur les faits rapportés, sans émettre de jugement personnel.

    **Tâche:**
    Prends en compte les comptes-rendus RETEX fournis ci-dessous.
    Identifie les points clés et les enseignements à tirer de l'opération.
    Classe et structure ta synthèse en trois sections principales, chacune avec des sous-sections claires:
    1.  **Points Forts:** Ce qui a bien fonctionné.
        * Coordination:
        * Matériel/Équipement:
        * Tactique:
    2.  **Points Faibles:** Ce qui a posé problème.
        * Communication:
        * Préparation:
        * Exécution:
    3.  **Axe d'Amélioration:** Recommandations concrètes et concises pour de futures opérations.
        * Formation:
        * Procédure:
        * Équipement:

    **Contenu des rapports RETEX:**
    ${formattedReports}

    **Format de la réponse:**
    Utilise le format Markdown pour ta réponse. Respecte scrupuleusement les en-têtes et sous-en-têtes demandés.
    Ne te base que sur les informations que je te donne et ne spécule pas sur des éléments extérieurs.
    S'il n'y a pas d'informations pour une section, écris "RAS" (Rien À Signaler).
    Reste professionnel et factuel. N'utilise pas de phrases trop longues.
    Commence ta réponse par "### Rapport d'Analyse Opérationnelle".
    `;

    try {
        statusElement.textContent = "Analyse en cours par l'IA...";
        
        const { GoogleGenerativeAI } = window;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text();

        if (textOutput) {
            statusElement.textContent = "Analyse terminée.";
            const htmlOutput = marked.parse(textOutput);
            outputElement.innerHTML = htmlOutput;
            return htmlOutput;
        } else {
            statusElement.textContent = "Analyse terminée, mais aucune réponse significative n'a été reçue.";
            outputElement.innerHTML = "<p>Aucune réponse significative de l'IA.</p>";
            return null;
        }
    } catch (error) {
        console.error("Erreur lors de la génération de l'analyse avec le SDK:", error);
        statusElement.textContent = `Erreur: ${error.message}`;
        outputElement.innerHTML = `<p>Une erreur est survenue: ${error.message}</p>`;
        return null;
    }
}