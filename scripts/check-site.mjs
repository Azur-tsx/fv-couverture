// Vérifie le site généré (dist/) : à lancer après `npm run build`.
// - liens et ressources internes (href, src, srcset, imagesrcset) qui pointent vers un fichier existant
// - ancres (#id) présentes sur la page ciblée
// - aucun include ou chemin /src/ oublié
// - scripts inline autorisés par la CSP de netlify.toml (hash sha256)
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const errors = [];

const pages = readdirSync(DIST).filter((f) => f.endsWith(".html"));
const html = Object.fromEntries(pages.map((f) => [f, readFileSync(join(DIST, f), "utf-8")]));

/** Résout un chemin d'URL interne vers le fichier HTML ou l'asset servi par Netlify. */
function resolvePath(path) {
    const clean = decodeURIComponent(path.split("?")[0]);
    if (clean === "/" || clean === "") return "index.html";
    const rel = clean.replace(/^\//, "");
    if (existsSync(join(DIST, rel)) && !rel.endsWith("/")) return rel;
    if (existsSync(join(DIST, `${rel}.html`))) return `${rel}.html`;
    return null;
}

const idsOf = (source) => new Set([...source.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

for (const [page, source] of Object.entries(html)) {
    if (/include:/.test(source)) errors.push(`${page} : include non remplacé`);
    if (/["\s(]\/src\//.test(source)) errors.push(`${page} : chemin /src/ restant`);

    const urls = [];
    for (const m of source.matchAll(/\s(?:href|src)="([^"]+)"/g)) urls.push(m[1]);
    for (const m of source.matchAll(/\s(?:srcset|imagesrcset)="([^"]+)"/g)) {
        for (const part of m[1].split(",")) urls.push(part.trim().split(/\s+/)[0]);
    }

    for (const url of urls) {
        if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
        const [path, hash] = url.split("#");
        const target = path ? resolvePath(path) : page;
        if (!target) {
            errors.push(`${page} : lien cassé « ${url} »`);
            continue;
        }
        if (hash && target.endsWith(".html") && !idsOf(html[target] ?? "").has(hash)) {
            errors.push(`${page} : ancre introuvable « ${url} »`);
        }
    }
}

// CSP : chaque script inline exécutable doit avoir son hash dans netlify.toml
const toml = readFileSync("netlify.toml", "utf-8");
for (const [page, source] of Object.entries(html)) {
    for (const m of source.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
        const digest = createHash("sha256").update(m[1]).digest("base64");
        if (!toml.includes(`'sha256-${digest}'`)) {
            errors.push(`${page} : script inline non autorisé par la CSP (ajouter 'sha256-${digest}' dans netlify.toml)`);
        }
    }
}

if (errors.length) {
    console.error([...new Set(errors)].map((e) => `✗ ${e}`).join("\n"));
    console.error(`\n${new Set(errors).size} problème(s) détecté(s).`);
    process.exit(1);
}
console.log(`✓ ${pages.length} pages vérifiées : liens, ancres et CSP OK.`);
