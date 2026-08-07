import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = await readFile(path.join(root, "src", "index.template.html"), "utf8");
const pages = [
  { locale: "de", output: "index.html", requiredRole: "Senior Technical Project Manager · Digital Delivery & E-Commerce" },
  { locale: "en", output: "index-en.html", requiredRole: "Technical Project Lead · Digital Products, E-Commerce & AI" },
];

const valueAtPath = (object, key) => key.split(".").reduce((value, segment) => value?.[segment], object);
const leafPaths = (object, prefix = "") => Object.entries(object).flatMap(([key, value]) => {
  const next = prefix ? `${prefix}.${key}` : key;
  return value && typeof value === "object" ? leafPaths(value, next) : [next];
});

const blockedPublicPatterns = [
  new RegExp(["offen für den nächsten", "projektschritt"].join(" "), "i"),
  /open to the next project opportunity/i,
  /\bab sofort\b/i,
  /available immediately/i,
  /eintrittstermin/i,
  /gehalts(?:vorstellung|wunsch|information)/i,
  /salary expectation/i,
  /bewerbungsstatus/i,
  /application status/i,
  /vertragsdetails/i,
  /contract details/i,
];

const assertPublicSafety = (content, filename) => {
  for (const pattern of blockedPublicPatterns) {
    if (pattern.test(content)) throw new Error(`Blocked public information in ${filename}: ${pattern}`);
  }
  if (/cdn\.credly\.com|credly[^<\n]*<script/i.test(content)) {
    throw new Error(`Credly embed script is not allowed in ${filename}`);
  }
};

for (const page of pages) {
  const translations = JSON.parse(await readFile(path.join(root, "locales", `${page.locale}.json`), "utf8"));
  const usedKeys = new Set();
  const html = template.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (_, key) => {
    const value = valueAtPath(translations, key);
    if (typeof value !== "string") throw new Error(`Missing translation '${key}' for locale '${page.locale}'`);
    usedKeys.add(key);
    return value;
  });

  const unresolved = html.match(/\{\{[^}]+\}\}/g);
  if (unresolved) throw new Error(`Unresolved placeholders in ${page.output}: ${unresolved.join(", ")}`);

  const unusedKeys = leafPaths(translations).filter((key) => !usedKeys.has(key));
  if (unusedKeys.length) throw new Error(`Unused translations for '${page.locale}': ${unusedKeys.join(", ")}`);

  const h1Count = (html.match(/<h1\b/g) || []).length;
  if (h1Count !== 1) throw new Error(`${page.output} must contain exactly one h1; found ${h1Count}`);

  const requiredContent = [
    page.requiredRole,
    "mailto:mailin89w@hotmail.de?subject=Fachlicher%20Austausch%20%E2%80%93%20Daniela%20Klein",
    "mailin89w@hotmail.de",
    "https://www.credly.com/badges/1b175659-269c-404f-88b0-4a65361bb681/public_url",
  ];
  for (const required of requiredContent) {
    if (!html.includes(required)) throw new Error(`Required content missing from ${page.output}: ${required}`);
  }

  assertPublicSafety(html, page.output);
  await writeFile(path.join(root, page.output), html);
  console.log(`Built and validated ${page.output} from ${page.locale}.json`);
}

for (const filename of ["resume.html", "app.js", "styles.css", "resume.css", "404.html", "robots.txt", "sitemap.xml"]) {
  const content = await readFile(path.join(root, filename), "utf8");
  assertPublicSafety(content, filename);
}

console.log("Public-content safety checks passed");
