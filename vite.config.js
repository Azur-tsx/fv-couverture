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
    notFound: "404.html",
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

/**
 * URLs sans extension (/realisations -> realisations.html) en dev et en preview,
 * comme Netlify le fait en production.
 */
function cleanUrls() {
    const pageNames = new Set(Object.values(pages).map((file) => file.replace(/\.html$/, "")));
    const rewrite = (req, _res, next) => {
        const [path, query = ""] = req.url.split("?");
        const name = path.replace(/^\//, "").replace(/\/$/, "");
        if (pageNames.has(name)) req.url = `/${name}.html${query ? `?${query}` : ""}`;
        next();
    };
    return {
        name: "clean-urls",
        configureServer(server) {
            server.middlewares.use(rewrite);
        },
        configurePreviewServer(server) {
            server.middlewares.use(rewrite);
        },
    };
}

/**
 * En build, remplace la feuille de style principale par un <style> intégré :
 * supprime une requête bloquante pour le premier affichage (~6 Ko gzip par page).
 */
function inlineCss() {
    return {
        name: "inline-css",
        apply: "build",
        transformIndexHtml: {
            order: "post",
            handler(html, ctx) {
                if (!ctx.bundle) return html;
                return html.replace(
                    /<link rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"[^>]*>/g,
                    (tag, fileName) => {
                        const asset = ctx.bundle[fileName];
                        if (!asset || asset.type !== "asset") return tag;
                        return `<style>${asset.source}</style>`;
                    }
                );
            },
        },
    };
}

export default defineConfig({
    plugins: [htmlPartials(), cleanUrls(), inlineCss()],
    build: {
        rollupOptions: {
            input: Object.fromEntries(
                Object.entries(pages).map(([key, file]) => [key, resolve(__dirname, file)])
            ),
        },
    },
});
