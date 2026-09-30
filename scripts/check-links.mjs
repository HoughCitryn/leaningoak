import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceRoot = join(root, "src");
const publicRoot = join(root, "public");
const allowedRoutes = new Set(["/", "/the-venue/", "/information/", "/photo-gallery/", "/contact-us/", "/privacy-practices/", "/api/inquiry/", "/sitemap.xml", "/image-sitemap.xml"]);
const errors = [];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

for (const file of files(sourceRoot).filter((path) => [".ts", ".tsx"].includes(extname(path)))) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(/(?:href|src)=[{]?['"](\/[^'"}]+)['"]/g)) {
    const target = match[1];
    if (target.startsWith("/wp-content/") || target.match(/\.(?:jpg|jpeg|png|svg|ico)$/i)) {
      if (!existsSync(join(publicRoot, target.slice(1)))) errors.push(`${relative(root, file)}: missing asset ${target}`);
    } else if (!target.includes("${") && !allowedRoutes.has(target)) {
      errors.push(`${relative(root, file)}: unknown internal route ${target}`);
    }
  }
}

const media = files(join(publicRoot, "wp-content", "uploads"));
if (media.length !== 84) errors.push(`Expected 84 archived media files, found ${media.length}`);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated internal links and ${media.length} archived media files.`);
