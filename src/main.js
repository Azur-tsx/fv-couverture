import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./style.css";

const isbergues = [50.6241667, 2.4575];

const map = L.map("map", {
    scrollWheelZoom: false,

}).setView(isbergues, 10);

// Tuiles OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Marqueur + popup
L.marker(isbergues)
    .addTo(map)
    .bindPopup("<b>FV Couverture</b><br>Isbergues")
    .openPopup();

// Cercle rayon 50 km (50 000 mètres)
const circle = L.circle(isbergues, {
    radius: 50000,
}).addTo(map);

// Zoom automatique pour englober le cercle
map.fitBounds(circle.getBounds());

const stars = document.querySelectorAll(".stars");

stars.forEach((el) => {
    const rating = Number(el.dataset.rating || 5);
    el.innerHTML = Array.from({ length: 5 }, (_, i) => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="star-icon">
  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
</svg>
  `).join("");
});