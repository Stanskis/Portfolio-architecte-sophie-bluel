const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters ul");
let categoriesCache = [];

function displayWorks(works) {
    gallery.innerHTML = '';
    works.forEach(work => {
        const figure = document.createElement('figure');
        figure.setAttribute('data-id', work.id);
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        gallery.appendChild(figure);
    });
}


function showIfLogged(works) {
    const token = localStorage.getItem('token');
    const portfolioHeader = document.querySelector('.portfolio-header');
    const loginLink = document.querySelector('header nav ul li a[href="./login.html"]');


    if (!token) return;

    const btn = document.createElement('button');
    btn.classList.add('edit-button');
    btn.innerHTML = `<img src="./assets/icons/modify-icon-black.svg" alt="Modifier"><div> modifier</div>`;

    loginLink.textContent = 'logout';
    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    portfolioHeader.appendChild(btn);

    btn.addEventListener('click', () => openModal(works));
}

function handleLogout() {
    localStorage.removeItem('token');
    location.reload();
}

function applyFilter(works) {
    const activeBtn = document.querySelector(".filter-cat.active");
    const filter = activeBtn.dataset.filter;

    if (filter === "all") {
        return displayWorks(works);
    }

    const filtered = works.filter(w => w.category.name.toLowerCase() === filter);
    displayWorks(filtered);
}


async function loadWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();
    return data;
}

async function loadCategories(select) {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json();

        categoriesCache = categories;

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });

        return categories;
    } catch (err) {
        console.error("Erreur chargement catégories:", err);
        return [];
    }
}

async function submitPhotoForm(form, works) {
    const modal = document.querySelector('.modal');
    const headerBar = document.querySelector('.modify-mode-bar');
    const btnValidate = form.nextElementSibling;
    const fileInput = form.querySelector("#fileInput");

    if (fileInput.files.length === 0) return;

    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append('title', form.querySelector("input[name='title']").value);
    formData.append('image', file);
    formData.append('category', form.querySelector("select[name='category']").value);

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });

        if (!response.ok) throw new Error('Erreur lors de l\'envoi');

        const result = await response.json();

        // API возвращает categoryId, используем его
        const selectedCategoryId = parseInt(result.categoryId);


        // Загружаем категории если кеш пустой
        if (categoriesCache.length === 0) {
            const catResponse = await fetch('http://localhost:5678/api/categories');
            categoriesCache = await catResponse.json();
        }

        const selectedCategory = categoriesCache.find(cat => cat.id === selectedCategoryId);

        const newWork = {
            ...result,
            category: {
                id: selectedCategoryId,
                name: selectedCategory ? selectedCategory.name : 'Unknown'
            }
        };

        console.log('New work added:', newWork);

        works.push(newWork);

        modal.remove();
        headerBar.remove();

        applyFilter(works);

        form.reset();
        const preview = form.querySelector("#imagePreview");
        preview.src = "./assets/images/placeholder.svg";
        preview.classList.remove("image-preview");
        preview.classList.add("image-placeholder");
        form.querySelector("#btnBrowse").classList.remove("hidden");
        form.querySelector(".file-info").classList.remove("hidden");
        validateFormFields(form, btnValidate);

    } catch (err) {
        alert(err.message);
    }
}




async function init() {
    const works = await loadWorks();
    const categories = new Set(works.map(w => w.category.name));

    // Buttons
    const allBtn = document.createElement('li');
    allBtn.innerHTML = `<button type="button" data-filter="all" class="filter-cat active">Tous</button>`;
    filtersContainer.appendChild(allBtn);

    categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<button type="button" data-filter="${category.toLowerCase()}" class="filter-cat">${category}</button>`;
        filtersContainer.appendChild(li);
    });

    // Filtrage
    const filterButtons = document.querySelectorAll(".filters button");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            applyFilter(works);
        });
    });

    displayWorks(works);
    showIfLogged(works);
}


init();