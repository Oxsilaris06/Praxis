function showStep(n) {
    steps.forEach((step, index) => step.classList.toggle('active', index === n));
    progressSteps.forEach((pStep, index) => {
        pStep.classList.toggle('active', index === n);
        if(visitedSteps.has(index) && index !== n) pStep.classList.add('completed');
        else pStep.classList.remove('completed');
    });
    prevBtn.style.display = n === 0 ? "none" : "inline-block";
    const isLastStep = n === (steps.length - 1);
    nextBtn.style.display = isLastStep ? "none" : "inline-block";
    if (isLastStep) {
        previewBtn.style.display = "inline-block";
        generatePdfBtn.style.display = "inline-block";
    } else {
        previewBtn.style.display = "none";
        generatePdfBtn.style.display = "none";
    }
}
function goToStep(n) {
    if (n >= 0 && n < steps.length) {
        visitedSteps.add(currentStep);
        saveFormData();
        currentStep = n;

        if (n === 6) {
            if (activeMemberId) {
                const oldActive = document.getElementById(activeMemberId);
                if (oldActive) oldActive.classList.remove('member-active');
                activeMemberId = null;
            }
            if (window.innerWidth >= 768) {
                document.getElementById('quickEditPanel').style.display = 'none';
            }
        }

        showStep(n);
    }
}
function changeStep(n) { goToStep(currentStep + n); }
function addPhotoInput(containerId, isSingle = false) {
    const container = document.getElementById(containerId);
    if (isSingle) container.innerHTML = '';
    const itemWrapper = document.createElement('div');
    itemWrapper.className = 'photo-input-wrapper';
    const uniqueId = `photo_${Date.now()}_${Math.random()}`;
    const previewId = `preview_${uniqueId}`;
    itemWrapper.innerHTML = `
        <div class="dynamic-list-item">
            <input type="file" id="${uniqueId}" class="photo-input" accept="image/png, image/jpeg" onchange="handleFileChange(this, 'span_${uniqueId}', '${previewId}')">
            <label for="${uniqueId}" class="file-upload-label">Choisir une photo</label>
            <span id="span_${uniqueId}" class="file-name-display">Aucun fichier</span>
            <button type="button" class="add-btn annotate-btn" style="display:none; margin-left:5px; background-color: var(--accent-blue);" onclick="openAnnotationModal('${previewId}')">Annoter</button>
            ${!isSingle ? '<button type="button" class="remove-btn" onclick="this.closest(\'.photo-input-wrapper\').remove()">❌</button>' : ''}
        </div>
        <img id="${previewId}" class="image-preview" style="display:none;" alt="Aperçu"/>`;
    container.appendChild(itemWrapper);
}
function handleFileChange(input, spanId, previewId) {
    const fileNameSpan = document.getElementById(spanId);
    const previewImg = document.getElementById(previewId);
    const annotateBtn = input.parentElement.querySelector('.annotate-btn');

    if (input.files.length > 0) {
        fileNameSpan.textContent = input.files[0].name;
        const reader = new FileReader();
        reader.onload = e => {
            previewImg.src = e.target.result;
            previewImg.dataset.originalSrc = e.target.result;
            previewImg.style.display = 'block';
            if (annotateBtn) annotateBtn.style.display = 'inline-block';
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        fileNameSpan.textContent = 'Aucun fichier';
        previewImg.src = '';
        previewImg.dataset.originalSrc = '';
        previewImg.style.display = 'none';
        if (annotateBtn) annotateBtn.style.display = 'none';
    }
}
function addDynamicField(containerId, value = '') {
    const container = document.getElementById(containerId);
    const item = document.createElement('div');
    item.className = 'dynamic-list-item';
    item.innerHTML = `<input type="text" class="dynamic-input" value="${value}" oninput="saveFormData()"><button type="button" class="remove-btn" onclick="this.parentElement.remove(); saveFormData();">❌</button>`;
    container.appendChild(item);
}
function addDynamicFieldWithSelect(containerId, options, value = '') {
    const container = document.getElementById(containerId);
    const item = document.createElement('div');
    item.className = 'dynamic-list-item';
    const selectId = `select_${containerId}_${Math.random().toString(36).substr(2, 9)}`;
    const inputId = `input_${containerId}_${Math.random().toString(36).substr(2, 9)}`;
    item.innerHTML = `<select id="${selectId}" onchange="document.getElementById('${inputId}').value = this.value; saveFormData();"><option value="">Sélection</option>${options.map(o => `<option value="${o}" ${o === value ? 'selected':''}>${o}</option>`).join('')}</select><input type="text" id="${inputId}" class="dynamic-input" placeholder="Ou personnalisé" value="${value}" oninput="document.getElementById('${selectId}').value = ''; saveFormData();"><button type="button" class="remove-btn" onclick="this.parentElement.remove(); saveFormData();">❌</button>`;
    container.appendChild(item);
}
function addMeField(value = '') {
    const container = document.getElementById('me_container');
    if (container.children.length >= 3) return;
    const item = document.createElement('div');
    item.className = 'dynamic-list-item';
    item.innerHTML = `<label>ME${container.children.length + 1}:</label><input type="text" class="me-input" value="${value}" oninput="saveFormData()"><button type="button" class="remove-btn" onclick="this.parentElement.remove(); saveFormData();">❌</button>`;
    container.appendChild(item);
}

function addTimeEvent(type_from_load, hour_from_load = '', desc_from_load) {
    const container = document.getElementById('time_events_container');
    const isLoadingFromFile = type_from_load !== undefined;

    let type, hour = hour_from_load, desc;

    if (isLoadingFromFile) {
        type = type_from_load;
        desc = desc_from_load;
    } else {
        const currentEventCount = container.children.length;
        const prefilledData = [
            { type: 'T0', desc: 'Rasso PSIG' }, { type: 'T1', desc: 'Départ PR' },
            { type: 'T2', desc: 'Départ LE' }, { type: 'T3', desc: 'MEP TERMINÉ' },
            { type: 'T4', desc: 'TOP ACTION' },
        ];
        const defaultValues = prefilledData[currentEventCount] || { type: `T${currentEventCount}`, desc: ''};
        type = defaultValues.type;
        desc = defaultValues.desc;
    }

    const item = document.createElement('div');
    item.className = 'dynamic-list-item time-item draggable';
    item.id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    item.setAttribute('draggable', 'true');
    const optionsHtml = ['T0','T1','T2','T3','T4','T5'].map(t => 
        `<option value="${t}" ${t === type ? 'selected' : ''}>${t}</option>`
    ).join('');
    item.innerHTML = `<select class="time-type-select" onchange="saveFormData()">${optionsHtml}</select><input type="time" class="time-hour-input" value="${hour}" onchange="saveFormData()"><input type="text" class="time-description-input" placeholder="Description" value="${desc || ''}" oninput="saveFormData()"><button type="button" class="remove-btn" onclick="this.parentElement.remove(); saveFormData();">❌</button>`;
    container.appendChild(item);
}
function addPatracdvrRow(vehicleName, members = []) {
    const container = document.getElementById('patracdvr_container');
    // Vérifie si un véhicule avec ce nom existe déjà
    if (container.querySelector(`[data-vehicle-name="${vehicleName}"]`)) {
        alert(`Le véhicule "${vehicleName}" existe déjà. Veuillez choisir un nom unique.`);
        return;
    }
    const row = document.createElement('div');
    row.className = 'patracdvr-vehicle-row';
    row.dataset.vehicleName = vehicleName;

    row.innerHTML = `
        <div class="vehicle-header">
            <span class="vehicle-name">${vehicleName}</span>
            <button type="button" class="remove-btn" title="Supprimer le véhicule">❌</button>
        </div>
        <div class="patracdvr-members-container"></div>`;
    
    container.appendChild(row);

    const membersContainer = row.querySelector('.patracdvr-members-container');
    row.querySelector('.remove-btn').addEventListener('click', () => {
        const confirmation = confirm(`Voulez-vous vraiment supprimer le véhicule "${vehicleName}" et désattribuer ses membres ?`);
        if (confirmation) {
            membersContainer.querySelectorAll('.patracdvr-member-btn').forEach(memberBtn => {
                memberBtn.dataset.cellule = 'Sans';
                memberBtn.dataset.fonction = 'Sans';
                updateMemberButtonVisuals(memberBtn);
                unassignedContainer.appendChild(memberBtn);
            });
            row.remove();
            saveFormData();
        }
    });
    
    // Attacher les gestionnaires de drag and drop au nouveau conteneur de membres
    membersContainer.addEventListener('dragenter', handleDragEnter);
    membersContainer.addEventListener('dragleave', handleDragLeave);
    membersContainer.addEventListener('dragover', handleDragOver);
    membersContainer.addEventListener('drop', handleDrop);

    members.forEach(memberData => addPatracdvrMember(membersContainer, memberData));
    saveFormData();
}

// --- NOUVELLE FONCTION : Ajout de véhicule manuel ---
function addManualVehicle() {
    let vehicleName = prompt("Veuillez saisir le nom du nouveau véhicule (ex: VW-Golf, VTC):");
    if (vehicleName) {
        vehicleName = vehicleName.trim();
        if (vehicleName.length > 0) {
            addPatracdvrRow(vehicleName);
        }
    }
}

// --- NOUVELLE FONCTION : Ajout de membre manuel ---
function addManualMember() {
    let trigramme = prompt("Veuillez saisir le trigramme du nouveau membre (ex: ABC):");
    if (trigramme) {
        trigramme = trigramme.trim().toUpperCase();
        // Vérifier si un membre avec ce trigramme existe déjà
        const existingMember = document.querySelector(`.patracdvr-member-btn[data-trigramme="${trigramme}"]`);
        if (existingMember) {
            alert(`Le membre avec le trigramme "${trigramme}" existe déjà. Veuillez en choisir un autre.`);
            return;
        }
        
        if (trigramme.length >= 2 && trigramme.length <= 4) {
            // Crée le nouveau membre
            addPatracdvrMember(unassignedContainer, { trigramme: trigramme, cellule: 'Sans', fonction: 'Sans' });
            
            // Sélectionne le nouveau membre pour édition rapide
            const newMemberBtn = unassignedContainer.lastChild;
            if (newMemberBtn) {
                handleMemberSelection({ target: newMemberBtn });
            }
            saveFormData();
        } else {
            alert("Le trigramme doit contenir entre 2 et 4 caractères.");
        }
    }
}

function addPatracdvrMember(containerElement, data = {}) {
    if (!containerElement) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'patracdvr-member-btn draggable';
    btn.id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    btn.setAttribute('draggable', 'true');
    const memberData = {
        trigramme: 'N/A', fonction: 'Sans', cellule: 'India 1', armement: 'Sans',
        equipement: 'Sans', equipement2: 'Sans',
        tenue: 'UBAS', gpb: 'GPBL', ...data
    };
    Object.keys(memberData).forEach(key => btn.dataset[key] = memberData[key]);
    updateMemberButtonVisuals(btn);
    containerElement.appendChild(btn);
}
function updateMemberButtonVisuals(btn) {
    const trigramme = btn.dataset.trigramme || 'N/A';
    const fonction = btn.dataset.fonction || '';
    const cellule = btn.dataset.cellule || '';
    // Si la cellule est "Sans", on affiche juste la fonction (ou rien si "Sans")
    const cellDisplay = cellule !== 'Sans' ? cellule : '';
    const functionDisplay = fonction !== 'Sans' ? ` / ${fonction}` : '';
    const separation = (cellDisplay && functionDisplay) ? '' : ''; // Si la cellule est Sans, on vire le /
    
    btn.innerHTML = `<span class="trigramme">${trigramme}</span><span class="fonction">${cellDisplay}${separation}${functionDisplay}</span>`;
    
    // Si le membre est dans la zone non assignée, on affiche uniquement le trigramme
    if (btn.closest('#unassigned_members_container')) {
        btn.innerHTML = `<span class="trigramme">${trigramme}</span>`;
    }
}

function openMemberModal(buttonId) {
    const modal = document.getElementById('editMemberModal');
    const form = document.getElementById('editMemberForm');
    const button = document.getElementById(buttonId);
    const deleteBtn = document.getElementById('modal_deleteBtn');
    
    if (!button) return;
    form.dataset.editingButtonId = buttonId;
    
    // Logique de modification du bouton de suppression/renvoi en attente/suppression définitive
    const isUnassigned = button.closest('#unassigned_members_container');
    
    if (isUnassigned) {
        deleteBtn.textContent = 'Supprimer Définitivement';
        deleteBtn.style.backgroundColor = '#FF0000'; // Rouge vif pour la suppression définitive
    } else {
        deleteBtn.textContent = 'Renvoyer en Attente';
        deleteBtn.style.backgroundColor = 'var(--danger-red)'; // Rouge normal
    }
    
    document.getElementById('modal_trigramme').value = button.dataset.trigramme;
    populateSelect('modal_fonction', memberConfig.fonctions, button.dataset.fonction);
    populateSelect('modal_cellule', memberConfig.cellules, button.dataset.cellule);
    populateSelect('modal_armement', memberConfig.armements, button.dataset.armement);
    populateSelect('modal_equipement', memberConfig.equipements, button.dataset.equipement);
    populateSelect('modal_equipement2', memberConfig.equipements2, button.dataset.equipement2);
    populateSelect('modal_tenue', memberConfig.tenues, button.dataset.tenue);
    populateSelect('modal_gpb', memberConfig.gpbs, button.dataset.gpb);
    modal.showModal();
}
function populateSelect(selectId, options, selectedValue) {
    const select = document.getElementById(selectId);
    select.innerHTML = options.map(o => `<option value="${o}" ${o === selectedValue ? 'selected':''}>${o}</option>`).join('');
}

// --- NOUVELLE FONCTION: Mise à jour de l'affichage de l'articulation ---
function updateArticulationDisplay() {
    const indiaContainer = document.getElementById('india_composition_display');
    const aoContainer = document.getElementById('ao_composition_display');
    
    const indiaMembersByCell = {};
    const aoMembersByCell = {};

    document.querySelectorAll('.patracdvr-member-btn').forEach(btn => {
        const trigramme = btn.dataset.trigramme;
        const cellule = btn.dataset.cellule;
        if (!trigramme || !cellule || cellule.toLowerCase() === 'sans') return;

        if (cellule.toLowerCase().startsWith('india')) {
            if (!indiaMembersByCell[cellule]) {
                indiaMembersByCell[cellule] = [];
            }
            indiaMembersByCell[cellule].push(trigramme);
        } else if (cellule.toLowerCase().startsWith('ao')) {
            if (!aoMembersByCell[cellule]) {
                aoMembersByCell[cellule] = [];
            }
            aoMembersByCell[cellule].push(trigramme);
        }
    });

    const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    
    let indiaHtml = '';
    const sortedIndiaKeys = Object.keys(indiaMembersByCell).sort(naturalSort);
    sortedIndiaKeys.forEach(cell => {
        indiaHtml += `<p><strong>${cell}:</strong> ${indiaMembersByCell[cell].join(', ')}</p>`;
    });
    indiaContainer.innerHTML = indiaHtml || `<p><i>Aucun membre assigné aux cellules India.</i></p>`;

    let aoHtml = '';
    const sortedAoKeys = Object.keys(aoMembersByCell).sort(naturalSort);
    sortedAoKeys.forEach(cell => {
        aoHtml += `<p><strong>${cell}:</strong> ${aoMembersByCell[cell].join(', ')}</p>`;
    });
    aoContainer.innerHTML = aoHtml || `<p><i>Aucun membre assigné aux cellules AO.</i></p>`;
}

// --- PANNEAU D'ÉDITION RAPIDE & MODALE LOGIC ---

function setupQuickEditPanel() {
    const contentContainer = document.querySelector('#quickEditPanel .quick-edit-content');
    
    for (const [title, config] of Object.entries(quickEditMapping)) {
        const tabPanel = document.createElement('div');
        tabPanel.className = 'quick-edit-tab-panel active';
        
        const panelTitle = document.createElement('h5');
        panelTitle.textContent = title;
        tabPanel.appendChild(panelTitle);
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'quick-edit-options';
        
        memberConfig[config.key].forEach(option => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quick-edit-btn';
            btn.textContent = option;
            btn.dataset.attribute = config.attribute;
            btn.dataset.value = option;
            optionsContainer.appendChild(btn);
        });
        
        tabPanel.appendChild(optionsContainer);
        contentContainer.appendChild(tabPanel);
    }
}

function handleMemberSelection(event) {
    const clickedButton = event.target.closest('.patracdvr-member-btn');
    if (!clickedButton) return;

    if (activeMemberId === clickedButton.id) {
        clickedButton.classList.remove('member-active');
        activeMemberId = null;
        document.getElementById('quickEditPanel').style.display = 'none';
        return;
    }

    if (activeMemberId) {
        const oldActive = document.getElementById(activeMemberId);
        if (oldActive) oldActive.classList.remove('member-active');
    }
    
    activeMemberId = clickedButton.id;
    clickedButton.classList.add('member-active');
    
    if (window.innerWidth < 768) {
        openQuickEditModal(activeMemberId);
    } else {
        populateQuickEditPanel(activeMemberId);
        document.getElementById('quickEditPanel').style.display = 'block';
    }
}

function populateQuickEditPanel(memberId) {
    const member = document.getElementById(memberId);
    if (!member) return;
    document.getElementById('selectedMemberTrigramme').textContent = member.dataset.trigramme || 'N/A';
    document.querySelectorAll('#quickEditPanel .quick-edit-btn').forEach(btn => {
        const attribute = btn.dataset.attribute;
        const value = btn.dataset.value;
        btn.classList.toggle('selected', member.dataset[attribute] === value);
    });
}

function openQuickEditModal(memberId) {
    const modal = document.getElementById('quickEditModal');
    const title = document.getElementById('quick_modal_title');
    const content = document.getElementById('quick_modal_content');
    const member = document.getElementById(memberId);

    if (!member) return;

    title.textContent = `Édition Rapide: ${member.dataset.trigramme || 'N/A'}`;
    content.innerHTML = '';

    for (const [category, config] of Object.entries(quickEditMapping)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'quick-edit-category';
        
        const categoryTitle = document.createElement('h5');
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'quick-edit-options';
        
        memberConfig[config.key].forEach(option => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quick-edit-btn';
            btn.textContent = option;
            btn.dataset.attribute = config.attribute;
            btn.dataset.value = option;
            if (member.dataset[config.attribute] === option) {
                btn.classList.add('selected');
            }
            optionsContainer.appendChild(btn);
        });
        
        categoryDiv.appendChild(optionsContainer);
        content.appendChild(categoryDiv);
    }
    modal.showModal();
}

// --- DATA PERSISTENCE (SAVE/LOAD) ---
function saveFormData() {
    try {
        const data = {};
        document.querySelectorAll('#oi-form input:not([type="file"]), #oi-form textarea, #oi-form select').forEach(field => {
            if (field.id) data[field.id] = field.value;
        });
        document.querySelectorAll('.image-preview').forEach(img => {
            if(img.id && img.src.startsWith('data:image')) {
                data[img.id + '_src'] = img.src;
                data[img.id + '_original_src'] = img.dataset.originalSrc;
                data[img.id + '_annotations'] = img.dataset.annotations || '[]';
            }
        });
        data.me_list = Array.from(document.querySelectorAll('#me_container .me-input')).map(i => i.value).filter(Boolean);
        data.etat_esprit_list = Array.from(document.querySelectorAll(`#etat_esprit_container .dynamic-input`)).map(i => i.value).filter(Boolean);
        data.volume_list = Array.from(document.querySelectorAll(`#volume_adversaire_container .dynamic-input`)).map(i => i.value).filter(Boolean);
        data.vehicules_list = Array.from(document.querySelectorAll(`#vehicules_container .dynamic-input`)).map(i => i.value).filter(Boolean);
        data.patracdvr_unassigned = Array.from(unassignedContainer.querySelectorAll('.patracdvr-member-btn')).map(btn => ({ ...btn.dataset }));
        data.patracdvr_rows = Array.from(document.querySelectorAll('#patracdvr_container .patracdvr-vehicle-row')).map(row => ({
            vehicle: row.dataset.vehicleName,
            members: Array.from(row.querySelectorAll('.patracdvr-member-btn')).map(btn => ({ ...btn.dataset }))
        }));
        data.time_events = Array.from(document.querySelectorAll('#time_events_container .time-item')).map(item => ({
            type: item.querySelector('.time-type-select').value,
            hour: item.querySelector('.time-hour-input').value,
            description: item.querySelector('.time-description-input').value
        }));
        localStorage.setItem('oiFormData', JSON.stringify(data));
        
        updateArticulationDisplay();
    } catch (e) { console.error("Save error:", e); }
}
function loadFormData() {
    const dataString = localStorage.getItem('oiFormData');
    if (!dataString) {
        // Pas d'initialisation par défaut, le conteneur reste vide (selon la demande)
        return;
    }
    try {
        const data = JSON.parse(dataString);
        Object.keys(data).forEach(key => {
            if (key.endsWith('_src')) {
                const imgId = key.replace('_src', '');
                const img = document.getElementById(imgId);
                if (img) {
                   img.src = data[key];
                   img.dataset.originalSrc = data[imgId + '_original_src'];
                   img.dataset.annotations = data[imgId + '_annotations'] || '[]';
                   img.style.display = 'block';
                   const annotateBtn = img.closest('.photo-input-wrapper').querySelector('.annotate-btn');
                   if(annotateBtn) annotateBtn.style.display = 'inline-block';
                }
                return;
            }
            if (['patracdvr_rows', 'patracdvr_unassigned', 'time_events', 'me_list', 'etat_esprit_list', 'volume_list', 'vehicules_list'].includes(key)) return; 
            const el = document.getElementById(key);
            if (el && !Array.isArray(data[key]) && typeof data[key] !== 'object') {
                el.value = data[key];
            }
        });
        (data.me_list || []).forEach(val => addMeField(val));
        (data.etat_esprit_list || []).forEach(val => addDynamicFieldWithSelect('etat_esprit_container', ['Serein', 'Hostile', 'Conciliant', 'Sur ses gardes'], val));
        (data.volume_list || []).forEach(val => addDynamicFieldWithSelect('volume_adversaire_container', ['Seul', 'Famille', 'BO', 'Conjointe'], val));
        (data.vehicules_list || []).forEach(val => addDynamicField('vehicules_container', val));
        (data.time_events || []).forEach(ev => addTimeEvent(ev.type, ev.hour, ev.description));
        initializePatracdvr(data);

        updateArticulationDisplay();
    } catch (e) { console.error("Load error:", e); }
}
function initializePatracdvr(dataFromStorage) {
    unassignedContainer.innerHTML = '';
    patracdvrContainer.innerHTML = '';
    if (dataFromStorage && (dataFromStorage.patracdvr_rows?.length > 0 || dataFromStorage.patracdvr_unassigned?.length > 0)) {
        (dataFromStorage.patracdvr_unassigned || []).forEach(member => addPatracdvrMember(unassignedContainer, member));
        (dataFromStorage.patracdvr_rows || []).forEach(row => addPatracdvrRow(row.vehicle, row.members));
    }
}
function loadMembersFromJson(membersArray) {
    unassignedContainer.innerHTML = ''; 
    patracdvrContainer.innerHTML = '';
    membersArray.forEach(memberData => { 
        // Assure que les membres importés sans cellule/fonction sont "Sans"
        const defaultData = {
            cellule: memberData.cellule || 'Sans',
            fonction: memberData.fonction || 'Sans',
            ...memberData
        };
        addPatracdvrMember(unassignedContainer, defaultData); 
    });
    saveFormData(); 
}

// --- DRAG & DROP ---
let draggedItem = null;

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect(); const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) { return { offset: offset, element: child }; } 
        else { return closest; }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function handleDragEnter(e) {
    e.preventDefault();
    const targetContainer = e.currentTarget;
    if (draggedItem && draggedItem.classList.contains('patracdvr-member-btn')) {
        targetContainer.style.border = '2px dashed var(--accent-blue)';
    }
}

function handleDragOver(e) {
    e.preventDefault(); 
    const targetContainer = e.currentTarget;
    if (draggedItem && draggedItem.classList.contains('patracdvr-member-btn')) {
        const afterElement = getDragAfterElement(targetContainer, e.clientY);
        if (afterElement == null) { 
            targetContainer.appendChild(draggedItem); 
        } else { 
            targetContainer.insertBefore(draggedItem, afterElement); 
        }
    }
}

function handleDragLeave(e) {
    e.currentTarget.style.border = '1px dashed var(--border-color)';
}

function handleDrop(e) {
    e.preventDefault();
    const targetContainer = e.currentTarget;
    targetContainer.style.border = '1px dashed var(--border-color)';

    if (draggedItem && draggedItem.classList.contains('patracdvr-member-btn')) {
        // Déplace l'élément (déjà fait par handleDragOver, mais on le fait ici pour confirmer)
        targetContainer.appendChild(draggedItem);

        // Détermine si le membre est dans un véhicule ou dans la zone non assignée
        const isUnassignedZone = targetContainer.id === 'unassigned_members_container';
        
        // Met à jour l'attribut de cellule de l'élément déplacé
        if (isUnassignedZone) {
            draggedItem.dataset.cellule = 'Sans';
            draggedItem.dataset.fonction = 'Sans';
        } else {
            // Si le membre est déposé dans un véhicule
            if (draggedItem.dataset.cellule === 'Sans') {
                 draggedItem.dataset.cellule = 'India 1'; // Valeur par défaut si non définie
            }
        }
        
        updateMemberButtonVisuals(draggedItem);
        
        // Réinitialise l'état actif et l'affichage rapide si l'élément déplacé était sélectionné
        if (draggedItem.id === activeMemberId) {
            draggedItem.classList.remove('member-active');
            activeMemberId = null; 
            if (window.innerWidth >= 768) {
                document.getElementById('quickEditPanel').style.display = 'none';
            }
        }
        
        // Si on lâche dans un conteneur et qu'un panneau d'édition rapide était ouvert sur cet item
        // On clique dessus pour le réactiver et mettre à jour le panneau
        if (targetContainer.id !== 'unassigned_members_container' && window.innerWidth >= 768) {
            // Simuler une nouvelle sélection pour mettre à jour l'état actif et le panneau
            handleMemberSelection({ target: draggedItem });
        }
        
        saveFormData();
        draggedItem = null; // Réinitialiser après le dépôt
    }
}
// --- FIN DRAG & DROP ---

// --- TUTORIAL SYSTEM ---
function startTutorial() { 
    if (tutorialPopup.style.display === 'flex') { 
        hideTutorial(); 
        return; 
    } 
    goToStep(0); 
    currentTutorialStep = 0; 
    showTutorialStep(currentTutorialStep); 
}
function showTutorialStep(stepIndex) {
    if (stepIndex >= tutorialSteps.length) { hideTutorial(); return; }
    const step = tutorialSteps[stepIndex];
    if (step.step !== undefined && step.step !== currentStep) { goToStep(step.step); setTimeout(() => showTutorialStep(stepIndex), 600); return; }
    if (currentHighlightedElement) { currentHighlightedElement.classList.remove('highlight-element'); }
    popupText.textContent = step.text; nextPopupBtn.textContent = stepIndex === tutorialSteps.length - 1 ? 'Terminer' : 'Suivant';
    if (step.center) {
        tutorialPopup.style.top = '50%'; tutorialPopup.style.left = '50%'; tutorialPopup.style.transform = 'translate(-50%, -50%)';
        tutorialPopup.style.display = 'flex'; currentHighlightedElement = null; return;
    }
    const targetElement = document.querySelector(step.selector);
    if (!targetElement) { console.warn(`Element non trouvé: ${step.selector}`); currentTutorialStep++; showTutorialStep(currentTutorialStep); return; }
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetElement.classList.add('highlight-element'); currentHighlightedElement = targetElement;
    const rect = targetElement.getBoundingClientRect(); const popupWidth = tutorialPopup.offsetWidth; const popupHeight = tutorialPopup.offsetHeight;
    let popupX = rect.left + window.scrollX + (rect.width / 2) - (popupWidth / 2);
    let popupY = rect.top + window.scrollY - popupHeight - 20;
    if (popupY < window.scrollY + 10) { popupY = rect.bottom + window.scrollY + 20; }
    if (popupX < 10) popupX = 10;
    if (popupX + popupWidth > window.innerWidth - 10) { popupX = window.innerWidth - popupWidth - 10; }
    tutorialPopup.style.top = `${popupY}px`; tutorialPopup.style.left = `${popupX}px`;
    tutorialPopup.style.transform = 'none'; tutorialPopup.style.display = 'flex';
}
function hideTutorial() { 
    if (currentHighlightedElement) { 
        currentHighlightedElement.classList.remove('highlight-element'); 
    } 
    tutorialPopup.style.display = 'none'; 
}

// --- LOGIQUE D'ANNOTATION ---
function setContextualTools(selection) {
    const contextualTools = document.getElementById('contextual_tools');
    if (selection) {
        contextualTools.classList.add('active');
        contextualTools.classList.toggle('location-selected', selection.type === 'location');
        rotationInput.value = Math.round((selection.rotation || 0) * 180 / Math.PI) % 360;
        if (rotationInput.value < 0) rotationInput.value = 360 + parseInt(rotationInput.value);
    } else {
        contextualTools.classList.remove('active');
    }
}

function updateAnnotationRotation() {
    if (selectedAnnotation) {
        const degrees = parseFloat(rotationInput.value) || 0;
        selectedAnnotation.rotation = degrees * Math.PI / 180;
        redrawCanvas();
    }
}

function setActiveTool(toolId) {
    currentTool = toolId;
    document.querySelectorAll('.tool-btn.active, .tool-controls.active').forEach(el => el.classList.remove('active'));
    const toolButton = document.getElementById(`tool_${toolId}`);
    if (toolButton) toolButton.classList.add('active');
    const toolControls = document.getElementById(`controls_${toolId}`);
    if (toolControls) toolControls.classList.add('active');
    canvas.style.cursor = toolId === 'move' ? 'default' : 'crosshair';
    selectedAnnotation = null;
    setContextualTools(null);
}

function openAnnotationModal(previewImgId) {
    const previewImg = document.getElementById(previewImgId);
    if (!previewImg || !previewImg.src) return;
    baseImage.onload = () => {
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;
        annotations = JSON.parse(previewImg.dataset.annotations || '[]');
        setActiveTool('move');
        redrawCanvas();
        annotationModal.dataset.targetPreviewId = previewImgId;
        annotationModal.showModal();
    };
    baseImage.src = previewImg.dataset.originalSrc || previewImg.src;
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImage, 0, 0);
    annotations.forEach(drawAnnotation);
    if (isDrawing && currentAnnotation) {
        drawAnnotation(currentAnnotation);
    }
    if (selectedAnnotation) {
        drawSelectionBorder(selectedAnnotation);
    }
}

function drawSelectionBorder(annotation) {
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    let centerX, centerY;
    let x, y, width, height;

    if (annotation.type === 'location') {
        x = annotation.x - annotation.radius;
        y = annotation.y - annotation.radius;
        width = annotation.radius * 2;
        height = annotation.radius * 2;
        centerX = annotation.x;
        centerY = annotation.y;
    } else if (annotation.type === 'box') {
        x = annotation.x;
        y = annotation.y;
        width = annotation.width;
        height = annotation.height;
        centerX = annotation.x + annotation.width / 2;
        centerY = annotation.y + annotation.height / 2;
    } else if (annotation.type === 'arrow') {
        const minX = Math.min(annotation.startX, annotation.endX);
        const minY = Math.min(annotation.startY, annotation.endY);
        const maxX = Math.max(annotation.startX, annotation.endX);
        const maxY = Math.max(annotation.startY, annotation.endY);
        x = minX - 10;
        y = minY - 10;
        width = maxX - minX + 20;
        height = maxY - minY + 20;
        centerX = (annotation.startX + annotation.endX) / 2;
        centerY = (annotation.startY + annotation.endY) / 2;
    }

    if (annotation.rotation) {
        ctx.translate(centerX, centerY);
        ctx.rotate(annotation.rotation);
        ctx.translate(-centerX, -centerY);
    }
    
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
}

function drawAnnotation(annotation) {
    ctx.save();
    let centerX, centerY;
    if (annotation.type === 'location') {
        centerX = annotation.x;
        centerY = annotation.y;
    } else if (annotation.type === 'box') {
        centerX = annotation.x + annotation.width / 2;
        centerY = annotation.y + annotation.height / 2;
    } else if (annotation.type === 'arrow') {
        centerX = (annotation.startX + annotation.endX) / 2;
        centerY = (annotation.startY + annotation.endY) / 2;
    }

    if (annotation.rotation) {
        ctx.translate(centerX, centerY);
        ctx.rotate(annotation.rotation);
        ctx.translate(-centerX, -centerY);
    }

    switch (annotation.type) {
        case 'location': {
            const radius = annotation.radius || 0;
            if (radius < 2) {
                ctx.restore();
                return;
            }
            ctx.beginPath();
            ctx.arc(annotation.x, annotation.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(91, 155, 213, ${annotation.opacity || 0.5})`;
            ctx.fill();
            ctx.strokeStyle = '#5b9bd5';
            ctx.lineWidth = 2;
            ctx.stroke();
            if (annotation.text) {
                ctx.fillStyle = 'black';
                ctx.font = `bold ${Math.max(12, radius / 2)}px Oswald`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(annotation.text, annotation.x, annotation.y);
            }
            break;
        }
        case 'arrow': {
            drawArrow(annotation.startX, annotation.startY, annotation.endX, annotation.endY, annotation.thickness || 5);
            break;
        }
        case 'box': {
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = annotation.thickness || 5;
            ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
            break;
        }
    }
    ctx.restore();
}

// Fonction corrigée pour le dessin de la flèche
function drawArrow(fromx, fromy, tox, toy, lineWidth) {
    if (fromx === tox && fromy === toy) return;
    
    ctx.strokeStyle = '#c0392b';
    ctx.fillStyle = '#c0392b';
    ctx.lineWidth = lineWidth;
    
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    const headlen = Math.max(lineWidth * 3, 10); // Taille de la tête de flèche
    const arrowLength = Math.sqrt(dx * dx + dy * dy);

    // On s'assure que la ligne s'arrête un peu avant la pointe pour qu'elle ne dépasse pas
    const lineToX = tox - (headlen * 0.7) * Math.cos(angle);
    const lineToY = toy - (headlen * 0.7) * Math.sin(angle);
    
    // Si la flèche est trop courte pour la tête
    if (arrowLength < headlen * 1.5) {
        // Simplification pour les flèches très courtes, dessiner une simple ligne épaisse
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
        return;
    }

    // Dessin de la ligne
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(lineToX, lineToY);
    ctx.stroke();

    // Dessin de la tête de flèche
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));
    ctx.closePath();
    ctx.fill();
}

function getEventPos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function getAnnotationAtPosition(x, y) {
    for (let i = annotations.length - 1; i >= 0; i--) {
        const annotation = annotations[i];
        const angle = annotation.rotation || 0;
        let centerX, centerY;
        if (annotation.type === 'location') {
            centerX = annotation.x;
            centerY = annotation.y;
        } else if (annotation.type === 'box') {
            centerX = annotation.x + annotation.width / 2;
            centerY = annotation.y + annotation.height / 2;
        } else if (annotation.type === 'arrow') {
            centerX = (annotation.startX + annotation.endX) / 2;
            centerY = (annotation.startY + annotation.endY) / 2;
        }

        let testX = x;
        let testY = y;
        // Inverse de la rotation
        if (angle) {
            const translatedX = x - centerX;
            const translatedY = y - centerY;
            const cos = Math.cos(-angle);
            const sin = Math.sin(-angle);
            testX = translatedX * cos - translatedY * sin + centerX;
            testY = translatedX * sin + translatedY * cos + centerY;
        }

        const tolerance = 15;
        let isInside = false;

        switch (annotation.type) {
            case 'location':
                isInside = Math.sqrt(Math.pow(testX - annotation.x, 2) + Math.pow(testY - annotation.y, 2)) <= annotation.radius + tolerance / 2;
                break;
            case 'box':
                isInside = testX >= annotation.x - tolerance && testX <= annotation.x + annotation.width + tolerance &&
                    testY >= annotation.y - tolerance && testY <= annotation.y + annotation.height + tolerance;
                break;
            case 'arrow':
                const dx = annotation.endX - annotation.startX;
                const dy = annotation.endY - annotation.startY;
                const lenSq = dx * dx + dy * dy;
                if (lenSq === 0) break;
                const t = ((testX - annotation.startX) * dx + (testY - annotation.startY) * dy) / lenSq;
                const projX = annotation.startX + t * dx;
                const projY = annotation.startY + t * dy;
                if (t >= 0 && t <= 1) {
                    isInside = Math.pow(testX - projX, 2) + Math.pow(testY - projY, 2) <= Math.pow(annotation.thickness + tolerance, 2);
                }
                break;
        }

        if (isInside) return annotation;
    }
    return null;
}

function handleDrawStart(e) {
    e.preventDefault();
    const pos = getEventPos(canvas, e);
    startX = pos.x;
    startY = pos.y;
    if (currentTool === 'move') {
        selectedAnnotation = getAnnotationAtPosition(pos.x, pos.y);
        setContextualTools(selectedAnnotation);
        if (selectedAnnotation) {
            isDragging = true;
            document.body.style.overflow = 'hidden';
            let centerX, centerY;
            if (selectedAnnotation.type === 'location') {
                centerX = selectedAnnotation.x;
                centerY = selectedAnnotation.y;
            } else if (selectedAnnotation.type === 'box') {
                centerX = selectedAnnotation.x + selectedAnnotation.width / 2;
                centerY = selectedAnnotation.y + selectedAnnotation.height / 2;
            } else if (selectedAnnotation.type === 'arrow') {
                centerX = (selectedAnnotation.startX + selectedAnnotation.endX) / 2;
                centerY = (selectedAnnotation.startY + selectedAnnotation.endY) / 2;
            }
            dragOffsetX = pos.x - centerX;
            dragOffsetY = pos.y - centerY;
            redrawCanvas(); // Redraw with border
        }
    } else {
        isDrawing = true;
        selectedAnnotation = null;
        setContextualTools(null);
        currentAnnotation = {
            type: currentTool,
            startX: startX,
            startY: startY,
            endX: startX,
            endY: startY,
            rotation: 0
        };
    }
}

function handleDrawMove(e) {
    e.preventDefault();
    if (!isDrawing && !isDragging) return;
    const pos = getEventPos(canvas, e);
    if (isDragging && selectedAnnotation) {
        // Calcule le déplacement réel
        const deltaX = pos.x - startX;
        const deltaY = pos.y - startY;

        if (selectedAnnotation.type === 'arrow') {
            selectedAnnotation.startX += deltaX;
            selectedAnnotation.startY += deltaY;
            selectedAnnotation.endX += deltaX;
            selectedAnnotation.endY += deltaY;
        } else {
            selectedAnnotation.x += deltaX;
            selectedAnnotation.y += deltaY;
        }
        
        // Met à jour la position de départ pour le prochain mouvement
        startX = pos.x;
        startY = pos.y;
        redrawCanvas();
    } else if (isDrawing && currentAnnotation) {
        currentAnnotation.endX = pos.x;
        currentAnnotation.endY = pos.y;
        redrawCanvas();
    }
}

function handleDrawEnd(e) {
    e.preventDefault();
    document.body.style.overflow = '';
    if (isDragging) {
        isDragging = false;
        // Le redessin est fait dans handleDrawMove, juste pour être sûr
        redrawCanvas(); 
    } else if (isDrawing) {
        isDrawing = false;
        const final = { ...currentAnnotation };
        if (final.type === 'box') {
            final.x = Math.min(final.startX, final.endX);
            final.y = Math.min(final.startY, final.endY);
            final.width = Math.abs(final.startX - final.endX);
            final.height = Math.abs(final.startY - final.endY);
            final.thickness = document.getElementById('box_thickness').value;
            if (final.width < 5 || final.height < 5) return;
        } else if (final.type === 'arrow') {
            final.thickness = document.getElementById('arrow_thickness').value;
            if (Math.abs(final.startX - final.endX) < 5 && Math.abs(final.startY - final.endY) < 5) return;
        } else if (final.type === 'location') {
            final.x = final.startX;
            final.y = final.startY;
            final.radius = Math.sqrt(Math.pow(final.endX - final.startX, 2) + Math.pow(final.endY - final.startY, 2));
            final.text = document.getElementById('circle_text').value || 'Zone';
            final.opacity = document.getElementById('circle_opacity').value;
            if (final.radius < 5) return;
        }
        annotations.push(final);
        currentAnnotation = null;
        selectedAnnotation = final; // Sélectionne la nouvelle annotation après la création
        setContextualTools(selectedAnnotation);
        redrawCanvas();
    }
}

// --- PDF GENERATION ---
async function buildPdf() {
    const { PDFDocument, StandardFonts, rgb, PageSizes } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    saveFormData();
    const formDataString = localStorage.getItem('oiFormData');
    if (!formDataString) { alert("Aucune donnée à générer."); return null; }
    const formData = JSON.parse(formDataString);
    const getVal = (id) => formData[id] || '';
    const isDarkMode = document.body.classList.contains('dark-mode');
    const context = {
        pdfDoc, helveticaFont, helveticaBoldFont,
        currentPage: null, y: 0, pageWidth: 0, pageHeight: 0, margin: 40,
        colors: isDarkMode ? { background: rgb(30/255, 30/255, 30/255), text: rgb(1, 1, 1), accent: rgb(91/255, 155/255, 213/255) } : { background: rgb(1, 1, 1), text: rgb(0, 0, 0), accent: rgb(0, 51/255, 160/255) }
    };
    let backgroundImage = null;
    try {
        const bgImageUrl = 'Fd.png';
        const bgImageBytes = await fetch(bgImageUrl).then(res => res.arrayBuffer());
        backgroundImage = await pdfDoc.embedPng(bgImageBytes);
    } catch (e) { console.warn("L'image de fond 'Fd.png' n'a pas pu être chargée.", e); }
    
    const addNewPage = () => {
        context.currentPage = context.pdfDoc.addPage([PageSizes.A4[1], PageSizes.A4[0]]);
        const { width, height } = context.currentPage.getSize();
        context.pageWidth = width; context.pageHeight = height; context.y = height - context.margin;
        context.currentPage.drawRectangle({ x: 0, y: 0, width, height, color: context.colors.background });
    };
    const checkY = (spaceNeeded) => { if (context.y - spaceNeeded < context.margin) { addNewPage(); return true; } return false; };
    const drawTitle = (text) => { checkY(30); context.currentPage.drawText(text, { x: context.margin, y: context.y, font: helveticaBoldFont, size: 18, color: context.colors.accent }); context.y -= 30; };
    const drawSubTitle = (text) => { if (checkY(25)) { context.y -= 10; } context.currentPage.drawText(text, { x: context.margin, y: context.y, font: helveticaBoldFont, size: 14, color: context.colors.accent }); context.y -= 25; };
    const wrapText = (text, font, size, maxWidth) => {
        const words = String(text || '').replace(/\n/g, ' \n ').split(' ');
        let lines = []; let currentLine = '';
        for (const word of words) {
            if (word === '\n') { lines.push(currentLine); currentLine = ''; continue; }
            const lineWithWord = currentLine === '' ? word : `${currentLine} ${word}`;
            if (font.widthOfTextAtSize(lineWithWord, size) > maxWidth && currentLine !== '') { lines.push(currentLine); currentLine = word; } 
            else { currentLine = lineWithWord; }
        }
        lines.push(currentLine); return lines;
    };
    const drawWrappedText = (text, options = {}) => {
        const { font = helveticaFont, size = 12, color = context.colors.text, x = context.margin + 15 } = options;
        const maxWidth = context.pageWidth - x - context.margin;
        const lines = wrapText(text, font, size, maxWidth);
        const totalHeight = lines.length * (size + 4);
        if (checkY(totalHeight + 10)) { context.y -= (size + 4); }
        lines.forEach((line, index) => { context.currentPage.drawText(line, { x, y: context.y - (index * (size + 4)), font, size, color }); });
        context.y -= (totalHeight + 10);
    };
    // Fonction modifiée pour inclure la position de départ X
    const drawTable = (headers, rows, columnWidths, startX) => {
        let currentY = context.y; const rowPadding = 5; const headerFontSize = 10; const contentFontSize = 10;
        const drawRow = (rowData, isHeader) => {
            const font = isHeader ? helveticaBoldFont : helveticaFont; const size = isHeader ? headerFontSize : contentFontSize;
            const cellContents = rowData.map((text, i) => wrapText(text, font, size, columnWidths[i] - 2 * rowPadding));
            const maxLines = Math.max(...cellContents.map(lines => lines.length));
            const rowHeight = maxLines * (size + 2) + 2 * rowPadding;
            if (currentY - rowHeight < context.margin) { addNewPage(); currentY = context.y; drawRow(headers, true); }
            currentY -= rowHeight; let currentX = startX;
            rowData.forEach((_, i) => {
                context.currentPage.drawRectangle({ x: currentX, y: currentY, width: columnWidths[i], height: rowHeight, borderColor: context.colors.accent, borderWidth: 0.5 });
                const lines = cellContents[i];
                lines.forEach((line, lineIndex) => { context.currentPage.drawText(line, { x: currentX + rowPadding, y: currentY + rowHeight - rowPadding - (lineIndex + 1) * (size + 2) + 2, font, size, color: context.colors.text }); });
                currentX += columnWidths[i];
            });
        };
        drawRow(headers, true); rows.forEach(row => drawRow(row, false)); context.y = currentY - 20;
    };
    const processImage = async (source, maxWidth = 1280, quality = 0.85) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Important for canvas.toDataURL
            let objectUrl = null;
            if (source instanceof File) {
                if (!source.type.startsWith('image/')) { return reject(new Error('Le fichier fourni n\'est pas une image valide.')); }
                objectUrl = URL.createObjectURL(source);
                img.src = objectUrl;
            } else if (typeof source === 'string' && source.startsWith('data:image')) {
                img.src = source;
            } else { return reject(new Error('Source d\'image invalide.')); }
            
            img.onload = () => {
                if (objectUrl) URL.revokeObjectURL(objectUrl);
                const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                let { width, height } = img;
                if (width > maxWidth) { height = (maxWidth / width) * height; width = maxWidth; }
                canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(blob => {
                    if (!blob) return reject(new Error('La conversion de l\'image a échoué.'));
                    blob.arrayBuffer().then(resolve).catch(reject);
                }, 'image/jpeg', quality);
            };
            img.onerror = (err) => { if (objectUrl) URL.revokeObjectURL(objectUrl); reject(new Error(`Impossible de charger l'image: ${err.message}`)); };
        });
    };
    const drawImagesFromContainer = async (containerId, title) => {
        const imageSrcs = [];
        const wrappers = document.querySelectorAll(`#${containerId} .photo-input-wrapper`);
        wrappers.forEach(wrapper => {
            const previewImg = wrapper.querySelector('.image-preview');
            if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
                imageSrcs.push(previewImg.src);
            }
        });
        for (let i = 0; i < imageSrcs.length; i++) {
            const imageSource = imageSrcs[i];
            addNewPage();
            try {
                const imageBytes = await processImage(imageSource);
                const image = await pdfDoc.embedJpg(imageBytes);
                const { width, height } = context.currentPage.getSize();
                const paddedW = width - context.margin * 2; const paddedH = height - context.margin * 2 - 30;
                const scaled = image.scaleToFit(paddedW, paddedH);
                const x = (width - scaled.width) / 2; const y = (height - scaled.height) / 2 + 15;
                context.currentPage.drawImage(image, { x, y, width: scaled.width, height: scaled.height });
                const finalTitle = wrappers.length > 1 ? `${title} (${i+1})` : title;
                const textWidth = helveticaBoldFont.widthOfTextAtSize(finalTitle, 14);
                context.currentPage.drawText(finalTitle, { x: width / 2 - textWidth / 2, y: y - 20, font: helveticaBoldFont, size: 14, color: context.colors.text });
            } catch (e) {
                console.error(`Erreur d'intégration de l'image pour: ${title}`, e);
                drawTitle("Erreur d'image"); drawWrappedText(`Impossible de charger une image.\n\nErreur: ${e.message}`);
            }
        }
    };
    
    // --- NOUVELLES FONCTIONS POUR LA COMPOSITION STYLISÉE ---
    const getCompositionData = (teamPrefix) => {
        const membersByCell = {};
        const allMembers = (formData.patracdvr_rows || []).flatMap(row => row.members);
        
        allMembers.forEach(member => {
            if (member.cellule && member.cellule.toLowerCase().startsWith(teamPrefix)) {
                if (!membersByCell[member.cellule]) membersByCell[member.cellule] = [];
                membersByCell[member.cellule].push(member.trigramme);
            }
        });

        const naturalSort = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        const sortedKeys = Object.keys(membersByCell).sort(naturalSort);
        
        return sortedKeys.map(cell => ({ cell: cell, members: membersByCell[cell] }));
    };

    const drawCompositionList = (compositionData) => {
        const fontSize = 12;
        const lineHeight = fontSize + 4;
        if (checkY(lineHeight)) { context.y -= 10; }

        let currentX = context.margin + 15;
        const cellStyle = { font: helveticaBoldFont, color: rgb(1, 0, 0), size: fontSize };
        const trigrammeStyle = { font: helveticaBoldFont, color: context.colors.text, size: fontSize };
        const separatorStyle = { font: helveticaFont, color: context.colors.text, size: fontSize };
        
        compositionData.forEach((group, groupIndex) => {
            const cellShortName = group.cell.toLowerCase().replace('india ', 'I').replace('ao', 'AO').toUpperCase();
            
            const groupParts = [];
            groupParts.push({ text: cellShortName, style: cellStyle });
            groupParts.push({ text: ' : ', style: separatorStyle });
            group.members.forEach((member, memberIndex) => {
                groupParts.push({ text: member, style: trigrammeStyle });
                if (memberIndex < group.members.length - 1) {
                    groupParts.push({ text: ' - ', style: separatorStyle });
                }
            });
             if (groupIndex < compositionData.length - 1) {
                groupParts.push({ text: '    ', style: separatorStyle });
            }

            for(const part of groupParts) {
                const partWidth = part.style.font.widthOfTextAtSize(part.text, part.style.size);
                if (currentX + partWidth > context.pageWidth - context.margin) {
                    context.y -= lineHeight;
                    currentX = context.margin + 15;
                    if (checkY(lineHeight)) { context.y -= 10; }
                }
                context.currentPage.drawText(part.text, { x: currentX, y: context.y, ...part.style });
                currentX += partWidth;
            }
        });
        context.y -= (lineHeight + 10);
    };


    const pdfCreationLogic = async () => {
        addNewPage();
        if (backgroundImage) { context.currentPage.drawImage(backgroundImage, { x: 0, y: 0, width: context.pageWidth, height: context.pageHeight }); }
        const mainTitle = "OPÉRATION DE POLICE JUDICIAIRE";
        const dateTitle = `DU ${getVal('date_op') || '(DATE)'}`;
        const titleWidth = helveticaBoldFont.widthOfTextAtSize(mainTitle, 24);
        const dateTitleWidth = helveticaBoldFont.widthOfTextAtSize(dateTitle, 18);
        context.currentPage.drawText(mainTitle, { x: context.pageWidth / 2 - titleWidth / 2, y: context.pageHeight / 2 + 10, font: helveticaBoldFont, size: 24, color: context.colors.accent });
        context.currentPage.drawText(dateTitle, { x: context.pageWidth / 2 - dateTitleWidth / 2, y: context.pageHeight / 2 - 20, font: helveticaBoldFont, size: 18, color: context.colors.text });

        addNewPage();
        drawTitle("1. SITUATION");
        drawSubTitle("1.1 Situation Générale"); drawWrappedText(getVal('situation_generale'), { size: 14 });
        drawSubTitle("1.2 Situation Particulière"); drawWrappedText(getVal('situation_particuliere'), { size: 14 });
        
        addNewPage();
        drawTitle("1.3 ADVERSAIRE");
        const adversaireHeaders = ["Information", "Détail"];
        const meText = (formData.me_list || []).map((me, i) => `ME${i+1}: ${me}`).join(' | ');
        const adversaireRows = [
            ['Nom/Prénom', getVal('nom_adversaire')], ['Domicile', getVal('domicile_adversaire')],
            ['Naissance', `${getVal('date_naissance')} à ${getVal('lieu_naissance')}`],
            ['Description', `${getVal('stature_adversaire')} / ${getVal('ethnie_adversaire')}`],
            ['Signes particuliers', getVal('signes_particuliers')], ['Profession', getVal('profession_adversaire')],
            ['Antécédents', getVal('antecedents_adversaire')], ['État d\'esprit', (formData.etat_esprit_list || []).join(', ')],
            ['Attitude', getVal('attitude_adversaire')], ['Volume (renfort)', (formData.volume_list || []).join(', ')],
            ['Substances', getVal('substances_adversaire')], ['Véhicules', (formData.vehicules_list || []).join(', ')],
            ['Armes', getVal('armes_connues')], ['Moyens Employés', meText],
        ];

        // --- DÉBUT DE LA LOGIQUE ADVERSAIRE MODIFIÉE ---
        const imageKey = Object.keys(formData).find(k => k.startsWith('preview_photo_') && k.includes('adversary_photo_container') && k.endsWith('_src'));
        const imageSource = imageKey ? formData[imageKey] : null;

        const photoBoxWidth = 220; // Largeur dédiée à la photo (ajusté pour l'esthétique A4 paysage)
        const photoMargin = 10;
        const maxTableWidth = context.pageWidth - context.margin * 2;
        let tableWidth = maxTableWidth;

        if (imageSource) {
            // Ajustement de la largeur du tableau si une photo est présente
            tableWidth = maxTableWidth - photoBoxWidth - photoMargin;
        }

        const initialAdversaireY = context.y; 
        const tableX = context.margin;
        const photoBoxX = tableX + tableWidth + photoMargin;

        const tempTableRows = adversaireRows.filter(r => r[1] && r[1].trim() !== 'à');
        
        // Fonction pour calculer la hauteur totale du tableau
        const calculateTableHeight = (tableRows) => {
            const rowPadding = 5; const headerFontSize = 10; const contentFontSize = 10;
            let totalHeight = (headerFontSize + 2) + 2 * rowPadding; // Hauteur d'en-tête
            const colWidths = [150, tableWidth - 150]; // Largeurs des colonnes
            
            tableRows.forEach(row => {
                const cellContents = row.map((text, i) => wrapText(text, helveticaFont, contentFontSize, colWidths[i] - 2 * rowPadding));
                const lines = Math.max(...cellContents.map(l => l.length));
                totalHeight += (lines * (contentFontSize + 2) + 2 * rowPadding);
            });
            return totalHeight;
        };
        
        const tableHeight = calculateTableHeight(tempTableRows);
        let tableBottomY = initialAdversaireY - tableHeight;

        // Fonction pour dessiner le tableau (adaptée pour fonctionner avec la photo)
        const drawTableOnPage = (tableRows, startY) => {
            let currentY = startY; const rowPadding = 5; const headerFontSize = 10; const contentFontSize = 10;
            const tableHeaders = ["Information", "Détail"];
            const colWidths = [150, tableWidth - 150];
            
            const drawSingleRow = (rowData, isHeader) => {
                const font = isHeader ? helveticaBoldFont : helveticaFont; const size = isHeader ? headerFontSize : contentFontSize;
                const cellContents = rowData.map((text, i) => wrapText(text, font, size, colWidths[i] - 2 * rowPadding));
                const maxLines = Math.max(...cellContents.map(lines => lines.length));
                const rowHeight = maxLines * (size + 2) + 2 * rowPadding;
                
                // Ici on suppose qu'on a fait le checkY en amont ou que le tableau rentre
                currentY -= rowHeight; let currentX = tableX;
                
                rowData.forEach((_, i) => {
                    // Dessine la bordure
                    context.currentPage.drawRectangle({ x: currentX, y: currentY, width: colWidths[i], height: rowHeight, borderColor: context.colors.accent, borderWidth: 0.5 });
                    // Dessine le texte
                    const lines = cellContents[i];
                    lines.forEach((line, lineIndex) => { context.currentPage.drawText(line, { x: currentX + rowPadding, y: currentY + rowHeight - rowPadding - (lineIndex + 1) * (size + 2) + 2, font, size, color: context.colors.text }); });
                    currentX += colWidths[i];
                });
            };
            
            drawSingleRow(tableHeaders, true); // En-tête
            tableRows.forEach(row => drawSingleRow(row, false));
            return currentY; // Retourne la position Y du bas du tableau
        }
        
        if (imageSource) {
            // S'assurer que l'espace est suffisant pour le plus grand des deux éléments avant de dessiner
            const totalHeightNeeded = Math.max(tableHeight, photoBoxWidth * 0.75); // Estimer la hauteur de la photo (ratio 4:3)
            if (checkY(totalHeightNeeded + 10)) { tableBottomY = context.y - tableHeight; } // Nouvelle page si besoin
            
            // 1. Dessiner le tableau
            tableBottomY = drawTableOnPage(context.y, tempTableRows);
            
            // 2. Traiter et dessiner la photo à côté
            try {
                const imageBytes = await processImage(imageSource);
                const image = await pdfDoc.embedJpg(imageBytes);
                
                const photoMaxHeight = context.y - context.margin; // Hauteur max disponible
                const scaled = image.scaleToFit(photoBoxWidth - 10, photoMaxHeight - 10);
                const photoDrawHeight = scaled.height + 10;
                
                // Calculer la position Y du cadre photo pour un alignement en haut du bloc d'informations
                let photoFrameY = context.y - photoDrawHeight;

                if(photoFrameY >= context.margin) {
                    // Dessiner le cadre de la photo
                    context.currentPage.drawRectangle({ x: photoBoxX, y: photoFrameY, width: photoBoxWidth, height: photoDrawHeight, borderColor: context.colors.accent, borderWidth: 1 });
                    // Dessiner l'image
                    context.currentPage.drawImage(image, { x: photoBoxX + 5, y: photoFrameY + 5, width: scaled.width, height: scaled.height });
                }
            } catch(e) { console.error("Échec du traitement de la photo de l'adversaire:", e); }
            
            context.y = Math.min(tableBottomY, context.y - tableHeight) - 10; // On reprend la position Y la plus basse
            
        } else {
            // Si pas de photo, on dessine le tableau normalement
            drawTable(adversaireHeaders, tempTableRows, [150, maxTableWidth - 150], context.margin);
        }
        // --- FIN DE LA LOGIQUE ADVERSAIRE MODIFIÉE ---
        
        
        await drawImagesFromContainer('adversary_extra_photos_container', 'Photo Supplémentaire - Adversaire');
        await drawImagesFromContainer('renforts_photo_container', 'Photo - Renfort Potentiel');

        addNewPage();
        drawTitle("1.4 ENVIRONNEMENT");
        drawSubTitle("Ami(e)s (soutien)"); drawWrappedText(getVal('amies'), { size: 14 });
        drawSubTitle("Terrain / Météo"); drawWrappedText(getVal('terrain_info'), { size: 14 });
        drawSubTitle("Population"); drawWrappedText(getVal('population'), { size: 14 });
        drawSubTitle("Cadre juridique"); drawWrappedText(getVal('cadre_juridique'), { size: 14 });
        
        addNewPage();
        drawTitle("2. MISSION");
        drawWrappedText(getVal('missions_psig'), { font: helveticaBoldFont, size: 30, x: context.margin });
        
        await drawImagesFromContainer('photo_container_transport_pr', 'Transport PSIG vers PR');
        await drawImagesFromContainer('photo_container_transport_domicile', 'Transport PR vers Domicile');
        await drawImagesFromContainer('photo_container_bapteme_terrain', 'Baptême terrain');

        addNewPage();
        drawTitle("3. EXÉUTION");
        const execText = `En vue d'appréhender le mis en cause et empêcher la déperdition des preuves,\nJe veux, le ${getVal('date_execution') || '(date)'} à partir de ${getVal('heure_execution') || '(heure)'}, pour une action ${getVal('type_action') || '(type d\'action)'} investir le domicile\nprésumé de ${getVal('nom_adversaire') || '(nom de l\'adversaire)'} après avoir bouclé celui-ci.`;
        drawWrappedText(execText, { size: 16, x: context.margin, lineHeight: 8 });
        drawSubTitle("Chronologie des temps");
        const chronoHeaders = ["Type", "Heure", "Description"];
        const chronoRows = (formData.time_events || []).map(e => [e.type || 'N/A', e.hour || 'N/A', e.description || 'N/A']);
        drawTable(chronoHeaders, chronoRows, [80, 120, 550], context.margin);
        drawSubTitle("Hypothèses");
        drawWrappedText(`H1: ${getVal('hypothese_h1')}\nH2: ${getVal('hypothese_h2')}\nH3: ${getVal('hypothese_h3')}`, { size: 14 });

        addNewPage();
        drawTitle("4. ARTICULATION");
        drawWrappedText(`Place du Chef (Générale): ${getVal('place_chef')}`, { size: 14, x: context.margin });
        drawSubTitle("Équipe INDIA (INTER)"); 
        drawSubTitle("Composition:"); drawCompositionList(getCompositionData('india'));
        drawSubTitle("Mission:"); drawWrappedText(getVal('india_mission'));
        drawSubTitle("Objectif:"); drawWrappedText(getVal('india_objectif')); drawSubTitle("Itinéraire:");
        drawWrappedText(getVal('india_itineraire')); drawSubTitle("Points Particuliers:"); drawWrappedText(getVal('india_points_particuliers'));
        drawSubTitle("Conduite à Tenir:"); drawWrappedText(getVal('india_cat'));
        
        await drawImagesFromContainer('photo_container_itineraire_exterieur', 'Itinéraire Extérieur India');
        await drawImagesFromContainer('photo_container_itineraire_interieur', 'Itinéraire Intérieur India');
        await drawImagesFromContainer('photo_container_cellule_effraction', 'Cellule Effraction');
        
        addNewPage();
        drawTitle("4. ARTICULATION (Suite)");
        drawSubTitle("Équipe Appui/Observation (AO) - ZMSPCP"); 
        drawSubTitle("Composition:"); drawCompositionList(getCompositionData('ao'));
        drawSubTitle("Zone d'installation (Z):");
        drawWrappedText(getVal('ao_zone_installation')); drawSubTitle("Mission (M):"); drawWrappedText(getVal('ao_mission'));
        drawSubTitle("Secteur de surveillance (S):"); drawWrappedText(getVal('ao_secteur_surveillance'));
        drawSubTitle("Points Particuliers (P):"); drawWrappedText(getVal('ao_points_particuliers'));
        drawSubTitle("Place du Chef (P):"); drawWrappedText(getVal('ao_place_chef'));
        drawSubTitle("Conduite à Tenir (C):"); drawWrappedText(getVal('ao_cat'));

        await drawImagesFromContainer('photo_container_emplacement_ao', 'Emplacement AO');
        
        addNewPage();
        drawTitle("5. PATRACDVR");
        const patracHeaders = ["Trigramme", "Fonction", "Cellule", "Armement", "Équip. 1", "Équip. 2", "Tenue", "GPB"];
        for (const row of (formData.patracdvr_rows || [])) {
            if(row.vehicle && row.members && row.members.length > 0) {
                drawSubTitle(`Véhicule: ${row.vehicle}`);
                const patracRows = row.members.filter(m => m.trigramme).map(m => [m.trigramme, m.fonction, m.cellule, m.armement, m.equipement, m.equipement2, m.tenue, m.gpb]);
                if (patracRows.length > 0) { drawTable(patracHeaders, patracRows, [80, 90, 90, 90, 90, 90, 80, 80], context.margin); }
            }
        }
        
        addNewPage();
        drawTitle("Conduites à tenir");
        drawSubTitle("Générales"); drawWrappedText(getVal('cat_generales'), {x: context.margin, font: helveticaBoldFont});
        const noGoText = getVal('no_go');
        if (noGoText) {
            drawSubTitle("NO GO");
            drawWrappedText(noGoText, { x: context.margin, font: helveticaBoldFont, size: 14.4, color: rgb(1, 0.2, 0.2) });
        }
        drawSubTitle("Liaison"); drawWrappedText(getVal('cat_liaison'), {x: context.margin, font: helveticaBoldFont});

        // --- AJOUT DE LA LOGIQUE DE LIEN RETEX DANS LE PDF ---
        const dateOp = getVal('date_op');
        const nomAdversaire = getVal('nom_adversaire');
        if (dateOp && nomAdversaire) {
            // Création de l'identifiant unique de l'opération
            const safeAdversaireName = nomAdversaire.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
            const oiId = `${dateOp}_${safeAdversaireName}`;
            const retexUrl = `${RETEX_BASE_URL}?oiId=${encodeURIComponent(oiId)}`;

            addNewPage();
            const operationTitle = getVal('nom_adversaire') || 'OPERATION';
            drawTitle(`RETEX: ${operationTitle.toUpperCase()}`);
            drawWrappedText("Chaque membre ayant participé à l'opération est tenu de remplir le formulaire de Retour d'Expérience (Retex) en utilisant le lien ci-dessous.", { size: 14, x: context.margin });
            context.y -= 40;
            drawWrappedText(retexUrl, { x: context.margin, font: helveticaBoldFont, size: 14, color: context.colors.accent });
        }
        // --- FIN DE L'AJOUT ---
        
        addNewPage();
        if (backgroundImage) { context.currentPage.drawImage(backgroundImage, { x: 0, y: 0, width: context.pageWidth, height: context.pageHeight }); }
        const finalText = "Avez vous des questions?";
        const finalTextWidth = helveticaBoldFont.widthOfTextAtSize(finalText, 48);
        context.currentPage.drawText(finalText, { x: context.pageWidth / 2 - finalTextWidth / 2, y: context.pageHeight / 2, font: helveticaBoldFont, size: 48, color: context.colors.accent });
    };

    await pdfCreationLogic();
    const pdfBytes = await pdfDoc.save();
    return { pdfBytes, formData };
}

async function handlePdfAction(isPreview) {
    if (typeof PDFLib === 'undefined') { alert("Erreur: La bibliothèque PDF n'est pas encore chargée."); return; }
    const btn = isPreview ? previewBtn : generatePdfBtn;
    const originalText = btn.textContent;
    btn.textContent = 'Génération...'; btn.disabled = true;
    try {
        const result = await buildPdf();
        if (!result) { btn.textContent = originalText; btn.disabled = false; return; }
        const { pdfBytes, formData } = result;
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        if (isPreview) { window.open(url, '_blank'); } 
        else {
            const getVal = (id) => formData[id] || 'RAS';
            const link = document.createElement('a');
            link.href = url;
            link.download = `OI_${getVal('date_op').replace(/[\/\\?%*:|"<>]/g, '-')}_${getVal('nom_adversaire').replace(/ /g, '_')}.pdf`;
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
        }
    } catch (error) {
        console.error("Erreur critique lors de la génération du PDF:", error);
        alert("Une erreur critique est survenue. Consultez la console (F12).");
    } finally {
        btn.textContent = originalText; btn.disabled = false;
    }
}

// --- NOUVELLE LOGIQUE RETEX PAR IA ---
async function fetchRetexReport(url) {
    try {
        retexStatus.textContent = `Téléchargement du rapport...`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Erreur lors du téléchargement de ${url}:`, error);
        retexStatus.textContent = `Échec du téléchargement: ${error.message}`;
        return null;
    }
}

async function generateGeminiAnalysis(reports) {
    const apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        retexStatus.textContent = "Erreur: Clé API Gemini non configurée. Allez dans Paramètres.";
        return null;
    }
    
    // Convertir les objets JSON en une chaîne de caractères lisible pour l'IA
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
        retexStatus.textContent = "Analyse en cours par l'IA...";
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
            retexStatus.textContent = "Analyse terminée.";
            return marked.parse(textOutput);
        } else {
            retexStatus.textContent = "Analyse terminée, mais aucune réponse significative n'a été reçue.";
            return "<p>Aucune réponse significative de l'IA.</p>";
        }
    } catch (error) {
        console.error("Erreur lors de la génération de l'analyse:", error);
        retexStatus.textContent = `Erreur: ${error.message}`;
        return null;
    }
}

async function generateRetexPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4', true);
    const content = document.getElementById('retex_output');
    const originalDisplay = content.style.display;
    content.style.display = 'block';

    doc.html(content, {
        callback: function (doc) {
            doc.save('Rapport_Retex.pdf');
        },
        x: 20,
        y: 20,
        width: 550, // a4 width is 595.28 (595.28 - 40 margin)
        windowWidth: 800,
    });
}

// --- CHARGEMENT DES MEMBRES PAR DÉFAUT (Supprimé comme demandé) ---
async function loadDefaultMembersConfig() {
    // Cette fonction est désormais vide. Les membres sont chargés uniquement depuis le stockage local 
    // ou importés via un fichier JSON (via le nouveau bouton).
    console.log("Initialisation: Aucun membre par défaut n'est chargé.");
    saveFormData();
}
