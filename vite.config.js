import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { defineConfig } from "vite";

const pages = {
    main: "index.html",
    contact: "contact.html",
    realisations: "realisations.html",
    about: "about.html",
    alert: "alert.html",
    mentionsLegales: "mentions-legales.html",
    confidentialite: "confidentialite.html",
};

/**
 * Remplace les commentaires <!-- include:nom --> par le contenu de partials/nom.html,
 * puis marque le lien de navigation de la page courante avec aria-current="page".
 */
function htmlPartials() {
    return {
        name: "html-partials",
        transformIndexHtml: {
            order: "pre",
            handler(html, ctx) {
                const page = basename(ctx.filename, ".html");
                return html
                    .replace(/<!--\s*include:([\w-]+)\s*-->/g, (_, name) =>
                        readFileSync(resolve(__dirname, "partials", `${name}.html`), "utf-8")
                    )
                    .replace(/\sdata-nav="([\w-]+)"/g, (_, navPage) =>
                        navPage === page ? ' aria-current="page"' : ""
                    );
            },
        },
        handleHotUpdate({ file, server }) {
            if (file.includes("partials")) server.ws.send({ type: "full-reload" });
        },
    };
}

export default defineConfig({
    plugins: [htmlPartials()],
    build: {
        rollupOptions: {
            input: Object.fromEntries(
                Object.entries(pages).map(([key, file]) => [key, resolve(__dirname, file)])
            ),
        },
    },
});
