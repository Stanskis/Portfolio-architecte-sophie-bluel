// ===== MAIN MODAL ENTRY =====

function openModal(works) {
    document.body.classList.add('edit-mode');

    const header = document.querySelector('header');
    const headerBar = document.createElement('div');
    headerBar.className = 'modify-mode-bar';
    headerBar.innerHTML = `<span class="modify-mode-icon"></span><span>Mode édition</span>`;
    header.before(headerBar);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-top-bar"></div>
            <div class="modal-inner"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const topBar = modal.querySelector('.modal-top-bar');
    const inner = modal.querySelector('.modal-inner');

    const close = () => {
        modal.remove();
        headerBar.remove();
        document.body.classList.remove('edit-mode');
    };

    const closeBtn = createCloseButton(close);
    topBar.appendChild(closeBtn);

    modal.addEventListener('click', e => {
        if (e.target === modal) close();
    });

    renderModalView(1, inner, works, topBar);
}



// ===== MODAL CORE =====

function createCloseButton(onClick) {
    const btn = document.createElement('span');
    btn.classList.add('close');
    btn.textContent = '×';
    btn.addEventListener('click', onClick);
    return btn;
}

function createModalTitle(text) {
    const title = document.createElement('h2');
    title.textContent = text;
    return title;
}



// ===== GALLERY VIEW =====

function createGallery(works) {
    const gallery = document.createElement('div');
    gallery.classList.add('modal-gallery');

    works.forEach(work => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('modal-img-wrapper');

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const del = document.createElement('button');
        del.classList.add('delete-btn');

        del.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    wrapper.remove();
                    deleteGalleryWork(works, work.id);
                }
            } catch (err) {
                console.error(err);
            }
        });

        wrapper.appendChild(img);
        wrapper.appendChild(del);
        gallery.appendChild(wrapper);
    });

    return gallery;
}

function createAddButton(onClick) {
    const btn = document.createElement('button');
    btn.classList.add('btnAdd');
    btn.textContent = 'Ajouter une photo';
    btn.addEventListener('click', onClick);
    return btn;
}


// ===== FORM VIEW =====

function createAddPhotoForm() {
    const form = document.createElement('form');
    form.classList.add('modal-form');

    form.innerHTML = `
        <div class="image-preview-wrapper">
            <img id="imagePreview" class="image-placeholder" src="./assets/images/placeholder.svg" alt="image">
            <button type="button" class="fileBtn" id="btnBrowse">＋ Ajouter photo</button>
            <p class="file-info">jpg, png : 4mo max</p>
            <input type="file" name="image" id="fileInput" hidden>
        </div>

        <div class="modal-body">
        <label for="title">Titre</label>
        <input type="text" name="title">

        <label for="category">Catégorie</label>
        <select name="category">
            <option value=""></option>
        </select>
        </div>
    `;

    loadCategories(form.querySelector('select[name="category"]'));

    return form;
}

function createValidateButton(onClick) {
    const btn = document.createElement('button');
    btn.classList.add('btnValidate');
    btn.type = "button";
    btn.textContent = 'Valider';
    btn.addEventListener('click', () => {
        if (!btn.classList.contains("active")) return;
        onClick();
    });
    return btn;
}



// ===== VIEW LOGIC (RENDERER) =====

function renderModalView(view, container, works, topBar) {
    topBar.innerHTML = "";
    container.innerHTML = "";
    const closeBtn = createCloseButton(() => {
        document.querySelector('.modal').remove();
        document.querySelector('.modify-mode-bar').remove();
        document.body.classList.remove('edit-mode');
    });
    topBar.appendChild(closeBtn);

    if (view === 1) {
        renderViewGallery(container, works);
    }

    if (view === 2) {
        renderViewForm(container, works, topBar);
    }
}

function renderViewGallery(container, works) {
    const title = createModalTitle("Galerie photo");
    const gallery = createGallery(works);
    const btnAdd = createAddButton(() =>
        renderModalView(2, container, works, document.querySelector('.modal-top-bar'))
    );

    container.appendChild(title);
    container.appendChild(gallery);
    container.appendChild(btnAdd);
}

function renderViewForm(container, works, topBar) {
    const backBtn = document.createElement('span');
    backBtn.classList.add('back');
    backBtn.textContent = "<";
    backBtn.addEventListener('click', () =>
        renderModalView(1, container, works, topBar)
    );

    topBar.insertBefore(backBtn, topBar.firstChild);

    const title = createModalTitle("Ajout photo");
    const form = createAddPhotoForm();

    const btnValidate = createValidateButton(() => {
        console.log("FORM SUBMIT");
        submitPhotoForm(form, works, container, topBar);
        form.reset();

        const preview = form.querySelector("#imagePreview");
        preview.src = "./assets/images/placeholder.svg";
        preview.classList.remove("image-preview");
        preview.classList.add("image-placeholder");

        form.querySelector("#btnBrowse").classList.remove("hidden");
        form.querySelector(".file-info").classList.remove("hidden");

        validateFormFields(form, btnValidate);
    });

    const inputTitle = form.querySelector("input[name='title']");
    const selectCategory = form.querySelector("select[name='category']");
    const fileInput = form.querySelector("#fileInput");
    const btnBrowse = form.querySelector("#btnBrowse");
    const fileInfo = form.querySelector(".file-info");

    btnBrowse.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const maxSize = (4 * 1024 * 1024) - 194000; // 4 MiB
        if (file.size > maxSize) {
            alert("Le fichier est trop volumineux. Taille maximale : 4 Mo.");
            fileInput.value = "";
            validateFormFields(form, btnValidate);
            return;
        }

        btnBrowse.classList.add("hidden");
        fileInfo.classList.add("hidden");

        const reader = new FileReader();
        reader.onload = e => {
            const preview = form.querySelector("#imagePreview");
            preview.src = e.target.result;
            preview.classList.remove("image-placeholder");
            preview.classList.add("image-preview");
        };
        reader.readAsDataURL(file);

        validateFormFields(form, btnValidate);
    });

    inputTitle.addEventListener("input", () => validateFormFields(form, btnValidate));
    selectCategory.addEventListener("change", () => validateFormFields(form, btnValidate));

    validateFormFields(form, btnValidate);

    container.appendChild(title);
    container.appendChild(form);
    container.appendChild(btnValidate);
}


// ===== FORM VALIDATION =====

function validateFormFields(form, btnValidate) {
    const inputTitle = form.querySelector("input[name='title']");
    const selectCategory = form.querySelector("select[name='category']");
    const fileInput = form.querySelector("#fileInput");

    const filled =
        inputTitle.value.trim() !== "" &&
        selectCategory.value.trim() !== "" &&
        fileInput.files.length > 0;

    if (filled) {
        btnValidate.classList.add("active");
    } else {
        btnValidate.classList.remove("active");
    }
}

function deleteGalleryWork(works, workId) {
    const index = works.findIndex(w => w.id === workId);
    if (index !== -1) works.splice(index, 1);

    const activeFilterBtn = document.querySelector(".filter-cat.active");
    const filter = activeFilterBtn.dataset.filter;

    if (filter === "all") {
        displayWorks(works);
    } else {
        displayWorks(works.filter(w => w.category.name.toLowerCase() === filter));
    }
}