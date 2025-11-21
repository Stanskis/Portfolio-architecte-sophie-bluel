const gallery = document.querySelector(".gallery");
const filtersContainer = document.querySelector(".filters ul");


function displayWorks(works) {
    gallery.innerHTML = '';
    works.forEach(work => {
        const figure = document.createElement('figure');
        figure.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        `;
        gallery.appendChild(figure);
    });
}

function showEditButtonIfLogged(works) {
    const token = localStorage.getItem('token');
    const portfolioHeader = document.querySelector('.portfolio-header');

    if (!token) return;

    const btn = document.createElement('button');
    btn.classList.add('edit-button');
    btn.innerHTML = `<img src="./assets/icons/instagram.png" alt="Modifier">`;

    portfolioHeader.appendChild(btn);

    btn.addEventListener('click', () => openModal(works));
}

function openModal(works) {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const close = document.createElement('span');
    close.textContent = '×';
    close.classList.add('close');
    close.addEventListener('click', () => modal.remove());



    const content = document.createElement('div');
    content.classList.add('modal-content');

    const contentTitle = document.createElement('h2');
    contentTitle.textContent = 'Galerie photo';

    const gallery = document.createElement('div');
    gallery.classList.add('modal-gallery');

    works.forEach(work => {
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('modal-img-wrapper');
        imgWrapper.style.position = 'relative';

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-btn');

        deleteBtn.addEventListener('click', () => {
            imgWrapper.remove();
        });

        imgWrapper.appendChild(img);
        imgWrapper.appendChild(deleteBtn);
        gallery.appendChild(imgWrapper);
    });


    const hr = document.createElement('hr');

    const btnAdd = document.createElement('button');
    btnAdd.classList.add('btnAdd');
    btnAdd.textContent = 'Ajouter une photo';

    content.appendChild(close);
    content.appendChild(contentTitle);
    content.appendChild(gallery);
    content.appendChild(hr);
    content.appendChild(btnAdd);
    modal.appendChild(content);
    document.body.appendChild(modal);
}


async function loadWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();
    return data;
}

async function init() {
    const works = await loadWorks();
    const categories = new Set(works.map(w => w.category.name));
    // console.log(categories);

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

            const filter = btn.dataset.filter;

            if (filter === "all") {
                displayWorks(works);
            } else {
                displayWorks(works.filter(w => w.category.name.toLowerCase() === filter));
            }
        });
    });
    displayWorks(works);
    showEditButtonIfLogged(works);

}


init();