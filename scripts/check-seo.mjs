import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { JSDOM } from "jsdom";

// Audit the actual prerendered HTML, including metadata inherited from layouts.
// Run after `pnpm build`; no browser or external requests are required.
const root = resolve(import.meta.dirname, "..");
const source = join(root, "src", "app");
const build = join(root, ".next", "server", "app");
const origin = "https://www.leaningoakranch.com";
const errors = [];
const pages = [];
const titles = new Set();
const descriptions = new Set();
const check = (condition, message) => { if (!condition) errors.push(message); };

function pageFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? pageFiles(path) : entry.name === "page.tsx" ? [path] : [];
  });
}

for (const file of pageFiles(source)) {
  const slug = relative(source, file).split(sep).slice(0, -1).join("/");
  const path = slug ? `/${slug}/` : "/";
  const output = join(build, `${slug || "index"}.html`);
  if (!existsSync(output)) {
    errors.push(`${path}: missing production HTML; run pnpm build first`);
    continue;
  }
  const document = new JSDOM(readFileSync(output, "utf8")).window.document;
  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.content?.trim();
  const og = (name) => document.querySelector(`meta[property="og:${name}"]`)?.content?.trim();
  const title = document.title.trim();
  const description = meta("description");
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
  const main = document.querySelector("main");
  const headings = [...(main?.querySelectorAll("h1,h2,h3,h4,h5,h6") ?? [])];
  const counts = [1, 2, 3].map((level) => headings.filter((h) => h.tagName === `H${level}`).length);

  check(document.documentElement.lang === "en", `${path}: missing English language declaration`);
  check(Boolean(main), `${path}: missing main landmark`);
  check(document.querySelectorAll("title").length === 1 && Boolean(title), `${path}: missing or duplicate title tag`);
  check(!titles.has(title), `${path}: title duplicates another page`);
  check(document.querySelectorAll('meta[name="description"]').length === 1 && Boolean(description), `${path}: missing or duplicate description tag`);
  check(!descriptions.has(description), `${path}: description duplicates another page`);
  check(canonical === new URL(path, origin).href, `${path}: incorrect canonical URL`);
  check(!/noindex|none/i.test(meta("robots") ?? ""), `${path}: page unexpectedly blocks indexing`);
  check(counts[0] === 1, `${path}: expected exactly one H1 in main content`);
  check(counts[1] > 0 && counts[2] > 0, `${path}: expected meaningful H2 and H3 headings`);
  let previousLevel = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    check(level <= previousLevel + 1, `${path}: heading skips from H${previousLevel} to H${level}`);
    check(Boolean(heading.textContent.trim()), `${path}: empty heading`);
    previousLevel = level;
  }
  for (const img of document.querySelectorAll("img")) {
    check(img.hasAttribute("alt"), `${path}: image missing alt attribute`);
    const imageUrl = new URL(img.getAttribute("src"), origin);
    const asset = imageUrl.pathname === "/_next/image" ? imageUrl.searchParams.get("url") : imageUrl.pathname;
    if (asset?.startsWith("/wp-content/")) check(existsSync(join(root, "public", asset.slice(1))), `${path}: missing image ${asset}`);
  }
  check(og("title") === title && og("description") === description && og("url") === canonical, `${path}: Open Graph metadata does not match page`);
  check(Boolean(og("image")), `${path}: missing Open Graph image`);
  check(meta("twitter:card") === "summary_large_image" && Boolean(meta("twitter:image")), `${path}: missing Twitter sharing metadata`);
  const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')];
  check(schemas.length > 0, `${path}: missing structured data`);
  for (const schema of schemas) {
    try { JSON.parse(schema.textContent); } catch { errors.push(`${path}: invalid JSON-LD`); }
  }
  pages.push({ path, title, description, canonical, h1: counts[0], h2: counts[1], h3: counts[2] });
  titles.add(title);
  descriptions.add(description);
}

const sitemapFile = join(build, "sitemap.xml.body");
const robotsFile = join(build, "robots.txt.body");
check(existsSync(sitemapFile), "Missing generated sitemap.xml");
check(existsSync(robotsFile), "Missing generated robots.txt");
if (existsSync(sitemapFile)) {
  const xml = new JSDOM(readFileSync(sitemapFile, "utf8"), { contentType: "text/xml" }).window.document;
  const urls = [...xml.querySelectorAll("url > loc")].map((entry) => entry.textContent);
  check(urls.length === pages.length && new Set(urls).size === pages.length, "Sitemap has duplicate, missing, or extra page URLs");
  for (const page of pages) check(urls.includes(page.canonical), `Sitemap omits ${page.path}`);
}
if (existsSync(robotsFile)) {
  const robots = readFileSync(robotsFile, "utf8");
  check(/^Allow: \/\s*$/m.test(robots) && !/^Disallow: \/\s*$/m.test(robots), "Robots rules block site crawling");
  check(robots.includes(`Sitemap: ${origin}/sitemap.xml`), "Robots omits the page sitemap");
  check(robots.includes(`Sitemap: ${origin}/image-sitemap.xml`), "Robots omits the image sitemap");
  check(robots.includes("Disallow: /api/"), "Robots should exclude API endpoints");
}
const notFound = join(build, "_not-found.html");
if (existsSync(notFound)) {
  const document = new JSDOM(readFileSync(notFound, "utf8")).window.document;
  check(document.querySelector('meta[name="robots"]')?.content.includes("noindex"), "404 page must be noindex");
}

if (process.argv.includes("--json")) console.log(JSON.stringify({ pages, errors }, null, 2));
else {
  console.table(pages.map(({ path, title, description, h1, h2, h3 }) => ({ path, titleLength: title.length, descriptionLength: description?.length, h1, h2, h3 })));
  if (!errors.length) console.log(`Passed SEO checks for all ${pages.length} pages, sitemap.xml, robots.txt, and 404 indexing.`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
