import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Avec un bundler, Leaflet ne trouve pas ses icônes par défaut : on lui donne les URL.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const ISBERGUES = [50.6241667, 2.4575];
const RADIUS_METERS = 60000;

export function initMap(element) {
    const map = L.map(element, { scrollWheelZoom: false }).setView(ISBERGUES, 10);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    }).addTo(map);

    L.marker(ISBERGUES, { alt: "FV Couverture, Isbergues" })
        .addTo(map)
        .bindPopup("<b>FV Couverture</b><br>Isbergues");

    const coverage = L.circle(ISBERGUES, {
        radius: RADIUS_METERS,
        color: "#990000",
        weight: 2,
        fillOpacity: 0.08,
    }).addTo(map);

    map.fitBounds(coverage.getBounds());
}
