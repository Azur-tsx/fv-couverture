// Génère les images optimisées du site à partir des originaux de images-src/.
// Usage : npm run images  (à relancer après l'ajout ou le remplacement d'une photo)
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC = "images-src";
const OUT = "src/assets/img";
const PUBLIC = "public";
const PHOTO_WIDTHS = [800, 1600];

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f));

for (const file of files) {
    const { name } = parse(file);
    const input = join(SRC, file);

    if (name === "logo") continue; // logo d'origine (avec texte) : remplacé par src/assets/brand/logo-mark.svg

    for (const width of PHOTO_WIDTHS) {
        const img = sharp(input).rotate().resize({ width, withoutEnlargement: true });
        await img.clone().avif({ quality: 55 }).toFile(join(OUT, `${name}-${width}.avif`));
        await img.clone().webp({ quality: 72 }).toFile(join(OUT, `${name}-${width}.webp`));
    }
}

// Image de partage (réseaux sociaux) : 1200×630, servie depuis public/
await sharp(join(SRC, "chantier-1-apres.jpeg"))
    .rotate()
    .resize(1200, 630, { fit: "cover" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(join(PUBLIC, "og-image.jpg"));

// Favicons à partir du logo vectoriel (pictogramme blanc sur fond bleu)
const mark = (await readFile("src/assets/brand/logo-mark.svg", "utf-8"))
    .replace(/currentColor/g, "#fff")
    .replace(/<svg ([^>]*)viewBox="0 0 100 50"/, '<svg $1viewBox="-12 -33 124 124"');
const icon = mark.replace(/(<svg[^>]*>)/, '$1<rect x="-12" y="-33" width="124" height="124" rx="26" fill="#314158" stroke="none"/>');
await writeFile(join(PUBLIC, "favicon.svg"), icon);
await sharp(Buffer.from(icon)).resize(48, 48).png().toFile(join(PUBLIC, "favicon-48.png"));
// iOS arrondit lui-même les coins : fond plein, sans rayon
const touch = mark.replace(/(<svg[^>]*>)/, '$1<rect x="-12" y="-33" width="124" height="124" fill="#314158" stroke="none"/>');
await sharp(Buffer.from(touch)).resize(180, 180).png().toFile(join(PUBLIC, "apple-touch-icon.png"));

console.log(`Images générées dans ${OUT} et ${PUBLIC}/`);
