/**
 * ai.js
 * Ce module gère l'analyse des rapports RETEX via l'API Google Gemini
 * et la génération du PDF correspondant.
 * VERSION MODIFIÉE POUR LIRE DES FICHIERS LOCAUX.
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * Lit le contenu d'un fichier local en tant que texte.
 * @param {File} file - L'objet fichier sélectionné par l'utilisateur.
 * @param {HTMLElement} statusElement - L'élément HTML pour les mises à jour de statut.
 * @returns {Promise<string|null>} Le contenu du fichier, joliment formaté si c'est du JSON, ou null en cas d'erreur.
 */
function readFileAsText(file, statusElement) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                // On essaie de parser le JSON pour le reformater de manière lisible
                const jsonObject = JSON.parse(reader.result);
                // On convertit l'objet JSON en une chaîne de caractères bien formatée
                resolve(JSON.stringify(jsonObject, null, 2)); 
            } catch (error) {
                // Si ce n'est pas du JSON valide, on renvoie le texte brut
                resolve(reader.result);
            }
        };
        reader.onerror = () => {
            statusElement.textContent = `Erreur de lecture du fichier ${file.name}.`;
            console.error("FileReader error", reader.error);
            reject(null);
        };
        reader.readAsText(file);
    });
}


/**
 * Envoie les rapports collectés à l'API Gemini pour analyse.
 * (Cette fonction reste inchangée)
 * @param {string[]} reports - Un tableau contenant le texte de chaque rapport.
 * @param {string} apiKey - La clé API de l'utilisateur pour Google Gemini.
 * @param {HTMLElement} statusElement - L'élément HTML où afficher les mises à jour de statut.
 * @returns {Promise<string|null>} Le résultat de l'analyse au format HTML, ou null en cas d'erreur.
 */
async function analyzeReportsWithGemini(reports, apiKey, statusElement) {
    const prompt = `
    Tu es un analyste tactique de la Gendarmerie Française.
    Ton rôle est de synthétiser des rapports de retour d'expérience (RETEX) suite à des opérations de police judiciaire.
    L'objectif est de produire une analyse impartiale et objective, en te basant uniquement sur les faits rapportés, sans émettre de jugement personnel.

    **Tâche :**
    Prends en compte les comptes-rendus RETEX fournis ci-dessous.
    Identifie les points clés et les enseignements à tirer de l'opération.
    Classe et structure ta synthèse en trois sections principales, chacune avec des sous-sections claires :
    1.  **Points Forts :** Ce qui a bien fonctionné.
        * Coordination :
        * Matériel/Équipement :
        * Tactique :
    2.  **Points Faibles :** Ce qui a posé problème.
        * Communication :
        * Préparation :
        * Exécution :
    3.  **Axe d'Amélioration :** Recommandations concrètes et concises pour de futures opérations.
        * Formation :
        * Procédure :
        * Équipement :

    **Contenu des rapports RETEX :**
    ${reports.join('\n\n--- Rapport suivant ---\n\n')}

    **Format de la réponse :**
    Utilise le format Markdown pour ta réponse. Respecte scrupuleusement les en-têtes et sous-en-têtes demandés.
    Ne te base que sur les informations que je te donne et ne spécule pas sur des éléments extérieurs.
    S'il n'y a pas d'informations pour une section, écris "RAS" (Rien À Signaler).
    Reste professionnel et factuel. N'utilise pas de phrases trop longues.
    Commence ta réponse par "### Rapport d'Analyse Opérationnelle".
    `;

    try {
        statusElement.textContent = "Analyse en cours par l'IA...";
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur API: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textOutput) {
            statusElement.textContent = "Analyse terminée.";
            return marked.parse(textOutput);
        } else {
            statusElement.textContent = "Analyse terminée, mais aucune réponse significative n'a été reçue.";
            return "<p>Aucune réponse significative de l'IA.</p>";
        }
    } catch (error) {
        console.error("Erreur lors de la génération de l'analyse:", error);
        statusElement.textContent = `Erreur: ${error.message}`;
        return null;
    }
}


/**
 * NOUVELLE FONCTION PRINCIPALE : Orchestre l'analyse à partir d'une liste de fichiers.
 * @param {FileList} fileList - La liste des fichiers sélectionnés par l'utilisateur.
 * @param {HTMLElement} statusElement - L'élément pour les messages de statut.
 * @param {HTMLElement} outputElement - L'élément où afficher le rapport final.
 * @param {HTMLElement} pdfButtonElement - Le bouton pour générer le PDF.
 */
export async function handleRetexAnalysisFromFiles(fileList, statusElement, outputElement, pdfButtonElement) {
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        statusElement.textContent = "Erreur: Clé API Gemini non configurée. Allez dans Paramètres.";
        return;
    }

    if (fileList.length === 0) {
        statusElement.textContent = "Veuillez sélectionner au moins un fichier .json.";
        return;
    }

    // Réinitialise l'interface utilisateur
    outputElement.innerHTML = '';
    outputElement.style.display = 'none';
    pdfButtonElement.style.display = 'none';
    statusElement.textContent = 'Initialisation de la lecture des fichiers...';

    const allReports = [];
    // On utilise Promise.all pour lire tous les fichiers en parallèle
    const fileReadPromises = Array.from(fileList).map(file => readFileAsText(file, statusElement));
    
    try {
        const reportsContents = await Promise.all(fileReadPromises);
        allReports.push(...reportsContents.filter(content => content !== null));

        if (allReports.length > 0) {
            const htmlOutput = await analyzeReportsWithGemini(allReports, apiKey, statusElement);
            if (htmlOutput) {
                outputElement.innerHTML = htmlOutput;
                outputElement.style.display = 'block';
                pdfButtonElement.style.display = 'inline-block';
            } else {
                outputElement.innerHTML = "<p>Impossible de générer le rapport d'analyse.</p>";
                outputElement.style.display = 'block';
            }
        } else {
            outputElement.innerHTML = "<p>Aucun rapport valide n'a pu être lu.</p>";
            outputElement.style.display = 'block';
            statusElement.textContent = "Échec de la lecture des fichiers.";
        }
    } catch (error) {
        statusElement.textContent = "Une erreur est survenue lors de la lecture des fichiers.";
        console.error(error);
    }
}


/**
 * Génère un document PDF à partir du contenu d'un élément HTML.
 * (Cette fonction reste inchangée)
 * @param {string} elementId - L'ID de l'élément HTML à convertir en PDF.
 */
export async function generateRetexPdfFromElement(elementId) {
    const { jsPDF } = window.jspdf;
    const content = document.getElementById(elementId);
    if (!content) {
        alert("Erreur : L'élément de contenu pour le PDF est introuvable.");
        return;
    }

    const doc = new jsPDF('p', 'pt', 'a4');
    
    const originalDisplay = content.style.display;
    content.style.display = 'block';

    doc.html(content, {
        callback: function (doc) {
            doc.save('Rapport_Analyse_Retex.pdf');
            content.style.display = originalDisplay;
        },
        x: 20,
        y: 20,
        width: 550,
        windowWidth: 800,
    });
}
