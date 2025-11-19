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
    allBtn.innerHTML = `<button type="button" data-filter="all" class="active">Tous</button>`;
    filtersContainer.appendChild(allBtn);

    categories.forEach(category => {
        const li = document.createElement('li');
        li.innerHTML = `<button type="button" data-filter="${category.toLowerCase()}">${category}</button>`;
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
}

init();