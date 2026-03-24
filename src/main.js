import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

// --- Dark mode toggle ---
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme;
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("theme", next);
    });
}

// --- Burger menu ---
const menuBurger = document.getElementById("menuBurger");
const navigation = document.getElementById("navigation");

if (menuBurger && navigation) {
    const navItems = document.querySelectorAll(".header__nav-item");

    menuBurger.addEventListener("click", () => {
        menuBurger.classList.toggle("active");
        navigation.classList.toggle("active");
    });

    navItems.forEach((item) => {
        item.addEventListener("click", () => {
            menuBurger.classList.remove("active");
            navigation.classList.remove("active");
        });
    });
}

// --- Leaflet Map ---
const mapEl = document.getElementById("map");

if (mapEl) {
    const isberguesCoordinates = [50.6241667, 2.4575];

    const leafletMap = L.map("map", {
        scrollWheelZoom: false,
    }).setView(isberguesCoordinates, 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(leafletMap);

    L.marker(isberguesCoordinates)
        .addTo(leafletMap)
        .bindPopup("<b>FV Couverture</b><br>Isbergues")
        .openPopup();

    const coverageCircle = L.circle(isberguesCoordinates, {
        radius: 50000,
    }).addTo(leafletMap);

    leafletMap.fitBounds(coverageCircle.getBounds());
}

// --- Star ratings ---
const starContainers = document.querySelectorAll(".stars");

starContainers.forEach((starContainer) => {
    const rating = Number(starContainer.dataset.rating || 5);
    starContainer.innerHTML = Array.from({ length: 5 }, () => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="star-icon">
  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
</svg>
  `).join("");
});

// --- Hero Carousel ---
const heroSlides = document.querySelectorAll(".hero__slide");

if (heroSlides.length > 0) {
    let currentSlideIndex = 0;

    const showSlide = (index) => {
        heroSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
        currentSlideIndex = index;
    };

    window.setInterval(() => {
        showSlide((currentSlideIndex + 1) % heroSlides.length);
    }, 6000);
}

// --- Realisations filter ---
const filterButtons = document.querySelectorAll(".filter__btn");

if (filterButtons.length > 0) {
    const realisationCards = document.querySelectorAll(".realisation");
    const realisationsListElement = document.getElementById("realisations-list");
    let emptyMessageElement = document.getElementById("empty-message");

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filterValue = button.getAttribute("data-filter");

            filterButtons.forEach((fb) => fb.classList.remove("is-active"));
            button.classList.add("is-active");

            let visibleCount = 0;

            realisationCards.forEach((card) => {
                if (filterValue === "all" || card.classList.contains(filterValue)) {
                    card.style.display = "block";
                    visibleCount++;
                } else {
                    card.style.display = "none";
                }
            });

            if (visibleCount === 0) {
                if (!emptyMessageElement) {
                    emptyMessageElement = document.createElement("p");
                    emptyMessageElement.id = "empty-message";
                    emptyMessageElement.textContent = "Aucune réalisation pour cette catégorie pour le moment.";
                    emptyMessageElement.className = "empty-message";
                    realisationsListElement.appendChild(emptyMessageElement);
                }
                emptyMessageElement.style.display = "block";
            } else if (emptyMessageElement) {
                emptyMessageElement.style.display = "none";
            }
        });
    });

    realisationCards.forEach((card) => {
        card.addEventListener("click", (event) => {
            if (event.target.closest(".filter__btn")) return;
            card.classList.toggle("active");
        });
    });
}

// --- Reveal au scroll ---
const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length > 0) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    revealElements.forEach((el) => observer.observe(el));
}
