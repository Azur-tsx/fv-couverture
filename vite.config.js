import { resolve } from "path";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
    plugins: [
        ViteImageOptimizer({
            jpeg: { quality: 75 },
            jpg: { quality: 75 },
            png: { quality: 80 },
            webp: { lossless: false, quality: 75 },
        }),
    ],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                contact: resolve(__dirname, "contact.html"),
                realisations: resolve(__dirname, "realisations.html"),
                about: resolve(__dirname, "about.html"),
                alert: resolve(__dirname, "alert.html"),
                mentionsLegales: resolve(__dirname, "mentions-legales.html"),
                confidentialite: resolve(__dirname, "confidentialite.html"),
            },
        },
    },
});
