const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// --- Menu burger ---
const menuBurger = document.getElementById("menuBurger");
const navigation = document.getElementById("navigation");

if (menuBurger && navigation) {
    const setMenuOpen = (open) => {
        menuBurger.classList.toggle("active", open);
        navigation.classList.toggle("active", open);
        menuBurger.setAttribute("aria-expanded", String(open));
    };

    menuBurger.addEventListener("click", () => {
        setMenuOpen(menuBurger.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) setMenuOpen(false);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && menuBurger.getAttribute("aria-expanded") === "true") {
            setMenuOpen(false);
            menuBurger.focus();
        }
    });

    // Ferme le menu quand le focus clavier en sort
    document.addEventListener("focusin", (event) => {
        if (
            menuBurger.getAttribute("aria-expanded") === "true" &&
            !navigation.contains(event.target) &&
            event.target !== menuBurger
        ) {
            setMenuOpen(false);
        }
    });
}

// --- Carte Leaflet (chargée uniquement si la page en contient une) ---
const mapEl = document.getElementById("map");

if (mapEl) {
    const loadMap = () => import("./map.js").then(({ initMap }) => initMap(mapEl));

    if ("IntersectionObserver" in window) {
        const mapObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                mapObserver.disconnect();
                loadMap();
            }
        }, { rootMargin: "300px" });
        mapObserver.observe(mapEl);
    } else {
        loadMap();
    }
}

// --- Étoiles des avis ---
const STAR_SVG = `<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="star-icon"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.960-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" /></svg>`;

document.querySelectorAll(".stars").forEach((starContainer) => {
    const rating = Number(starContainer.dataset.rating) || 5;
    starContainer.innerHTML = STAR_SVG.repeat(rating);
});

// --- Diaporama du hero ---
const heroSlides = document.querySelectorAll(".hero__slide");
const heroPause = document.getElementById("heroPause");

if (heroSlides.length > 1) {
    const SLIDE_DURATION = 6000;
    const FADE_DURATION = 800;
    let current = 0;
    let timer = null;

    const nextIndex = (i) => (i + 1) % heroSlides.length;

    // Seules les diapositives courante et suivante sont affichées (et donc téléchargées)
    const render = (previous) => {
        heroSlides.forEach((slide, i) => {
            slide.classList.toggle("is-active", i === current);
            slide.classList.toggle("is-next", i === nextIndex(current));
            slide.classList.toggle("is-prev", i === previous);
        });
        if (previous !== undefined) {
            window.setTimeout(() => heroSlides[previous].classList.remove("is-prev"), FADE_DURATION);
        }
    };

    const advance = () => {
        const previous = current;
        current = nextIndex(current);
        render(previous);
    };

    const isPlaying = () => timer !== null;

    const play = () => {
        if (!isPlaying()) timer = window.setInterval(advance, SLIDE_DURATION);
        updatePauseButton();
    };

    const pause = () => {
        window.clearInterval(timer);
        timer = null;
        updatePauseButton();
    };

    function updatePauseButton() {
        if (!heroPause) return;
        heroPause.classList.toggle("is-paused", !isPlaying());
        heroPause.querySelector(".sr-only").textContent = isPlaying()
            ? "Mettre le diaporama en pause"
            : "Lancer le diaporama";
    }

    render();

    if (heroPause) {
        heroPause.hidden = false;
        heroPause.addEventListener("click", () => (isPlaying() ? pause() : play()));
    }

    if (prefersReducedMotion.matches) {
        updatePauseButton();
    } else {
        play();
    }
}

// --- Filtres des réalisations ---
const filterButtons = document.querySelectorAll(".filter__btn");

if (filterButtons.length > 0) {
    const realisationCards = document.querySelectorAll(".realisation");
    const filterStatus = document.getElementById("filter-status");

    // Masque les catégories qui n'ont encore aucune réalisation
    filterButtons.forEach((button) => {
        const filterValue = button.dataset.filter;
        if (filterValue === "all") return;
        const hasCards = [...realisationCards].some((card) => card.classList.contains(filterValue));
        if (!hasCards) button.hidden = true;
    });

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filterValue = button.dataset.filter;

            filterButtons.forEach((fb) => {
                const active = fb === button;
                fb.classList.toggle("is-active", active);
                fb.setAttribute("aria-pressed", String(active));
            });

            let visibleCount = 0;
            realisationCards.forEach((card) => {
                const visible = filterValue === "all" || card.classList.contains(filterValue);
                card.hidden = !visible;
                if (visible) visibleCount++;
            });

            if (filterStatus) {
                filterStatus.textContent = `${visibleCount} réalisation${visibleCount > 1 ? "s" : ""} affichée${visibleCount > 1 ? "s" : ""}`;
            }
        });
    });
}

// --- Comparateur avant / après (curseur) ---
document.querySelectorAll(".compare").forEach((compare) => {
    const range = compare.querySelector(".compare__range");
    if (!range) return;

    const update = () => {
        const value = Number(range.value);
        compare.style.setProperty("--pos", `${value}%`);
        range.setAttribute("aria-valuetext", `${value} % avant, ${100 - value} % après`);
    };

    range.addEventListener("input", update);
    update();
});

// --- Formulaire de devis : anti-spam (délai minimal) + retour visuel ---
const devisForm = document.getElementById("devis-form");

if (devisForm) {
    const MIN_FILL_TIME = 2000;
    const loadedAt = Date.now();
    const submitBtn = devisForm.querySelector(".btn--submit");
    const submitLabel = submitBtn?.querySelector(".btn__label");
    const formStatus = document.getElementById("form-status");

    const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // limite Netlify Forms
    const photoInput = document.getElementById("photo");

    photoInput?.addEventListener("change", () => {
        const file = photoInput.files?.[0];
        const tooBig = file && file.size > MAX_PHOTO_BYTES;
        photoInput.setCustomValidity(tooBig ? "La photo dépasse 8 Mo. Choisissez une image plus légère." : "");
        photoInput.setAttribute("aria-invalid", String(Boolean(tooBig)));
        if (tooBig) photoInput.reportValidity();
    });

    devisForm.addEventListener("submit", (event) => {
        if (Date.now() - loadedAt < MIN_FILL_TIME) {
            event.preventDefault();
            if (formStatus) formStatus.textContent = "Merci de patienter un instant avant d'envoyer le formulaire, puis réessayez.";
            return;
        }
        if (formStatus) formStatus.textContent = "Envoi de votre demande en cours…";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute("aria-busy", "true");
        }
        if (submitLabel) submitLabel.textContent = "Envoi en cours…";
    });
}

// --- Retour en haut ---
const backToTop = document.getElementById("backToTop");

if (backToTop) {
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            backToTop.classList.toggle("is-visible", window.scrollY > 400);
            ticking = false;
        });
    }, { passive: true });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
        document.getElementById("contenu")?.focus({ preventScroll: true });
    });
}

// --- Apparition au scroll ---
const revealElements = document.querySelectorAll(".reveal");

if (revealElements.length > 0) {
    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
        revealElements.forEach((el) => el.classList.add("is-visible"));
    } else {
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
}
