import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

// --- Burger menu ---
const menuBurger = document.getElementById("menuBurger");
const navigation = document.getElementById("navigation");

if (menuBurger && navigation) {
    const navItems = document.querySelectorAll(".nav-item");

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
const heroSection = document.getElementById("hero");
const heroSlides = document.querySelectorAll(".hero-slide");
const heroPrevButton = document.querySelector("[data-hero-control='prev']");
const heroNextButton = document.querySelector("[data-hero-control='next']");
const heroIndicatorsContainer = document.querySelector(".hero-indicators");

if (heroSection && heroSlides.length > 0 && heroIndicatorsContainer) {
    let currentSlideIndex = 0;
    const autoPlayDelay = 6000;
    let autoPlayTimer;

    const createIndicators = () => {
        heroIndicatorsContainer.innerHTML = "";
        heroSlides.forEach((_, index) => {
            const indicator = document.createElement("button");
            indicator.type = "button";
            indicator.className = "hero-indicator";
            indicator.setAttribute("data-hero-slide", String(index));
            if (index === 0) {
                indicator.classList.add("is-active");
            }
            heroIndicatorsContainer.appendChild(indicator);
        });
    };

    const updateIndicators = (activeIndex) => {
        const indicators = heroIndicatorsContainer.querySelectorAll(".hero-indicator");
        indicators.forEach((indicator) => {
            indicator.classList.toggle(
                "is-active",
                Number(indicator.getAttribute("data-hero-slide")) === activeIndex,
            );
        });
    };

    const showSlide = (index) => {
        heroSlides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        updateIndicators(index);
        currentSlideIndex = index;
    };

    const goToNextSlide = () => {
        const nextIndex = (currentSlideIndex + 1) % heroSlides.length;
        showSlide(nextIndex);
    };

    const goToPreviousSlide = () => {
        const previousIndex = (currentSlideIndex - 1 + heroSlides.length) % heroSlides.length;
        showSlide(previousIndex);
    };

    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayTimer = window.setInterval(goToNextSlide, autoPlayDelay);
    };

    const stopAutoPlay = () => {
        if (autoPlayTimer) {
            window.clearInterval(autoPlayTimer);
        }
    };

    createIndicators();
    startAutoPlay();

    if (heroPrevButton) {
        heroPrevButton.addEventListener("click", () => {
            stopAutoPlay();
            goToPreviousSlide();
            startAutoPlay();
        });
    }

    if (heroNextButton) {
        heroNextButton.addEventListener("click", () => {
            stopAutoPlay();
            goToNextSlide();
            startAutoPlay();
        });
    }

    heroIndicatorsContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLButtonElement)) return;

        const slideIndexAttribute = target.getAttribute("data-hero-slide");
        if (!slideIndexAttribute) return;

        const slideIndex = Number(slideIndexAttribute);
        if (Number.isNaN(slideIndex)) return;

        stopAutoPlay();
        showSlide(slideIndex);
        startAutoPlay();
    });

    heroSection.addEventListener("mouseenter", stopAutoPlay);
    heroSection.addEventListener("mouseleave", startAutoPlay);
}

// --- Realisations filter ---
const filterButtons = document.querySelectorAll(".filter-button");

if (filterButtons.length > 0) {
    const realisationCards = document.querySelectorAll(".realisation");
    const realisationsListElement = document.getElementById("realisations-list");
    let emptyMessageElement = document.getElementById("empty-message");

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filterValue = button.getAttribute("data-filter");

            filterButtons.forEach((fb) => fb.classList.remove("active"));
            button.classList.add("active");

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
            if (event.target.closest(".filter-button")) return;
            card.classList.toggle("active");
        });
    });
}
