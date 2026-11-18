// Génère les images optimisées du site à partir des originaux de images-src/.
// Usage : npm run images  (à relancer après l'ajout ou le remplacement d'une photo)
import { mkdir, readdir } from "node:fs/promises";
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

    if (name === "logo") {
        for (const size of [96, 192]) {
            const logo = sharp(input).rotate().resize(size, size, { fit: "cover" });
            await logo.clone().webp({ quality: 85 }).toFile(join(OUT, `logo-${size}.webp`));
            await logo.clone().png({ compressionLevel: 9 }).toFile(join(OUT, `logo-${size}.png`));
        }
        await sharp(input).rotate().resize(180, 180).png().toFile(join(PUBLIC, "apple-touch-icon.png"));
        continue;
    }

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

console.log(`Images générées dans ${OUT} et ${PUBLIC}/`);
