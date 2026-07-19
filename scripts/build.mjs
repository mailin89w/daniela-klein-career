import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = await readFile(path.join(root, "src", "index.template.html"), "utf8");
const pages = [
  { locale: "de", output: "index.html" },
  { locale: "en", output: "index-en.html" },
];

for (const page of pages) {
  const translations = JSON.parse(
    await readFile(path.join(root, "locales", `${page.locale}.json`), "utf8"),
  );
  const usedKeys = new Set();
  const html = template.replace(/\{\{([a-zA-Z0-9_.-]+)\}\}/g, (_, key) => {
    if (!(key in translations)) {
      throw new Error(`Missing translation '${key}' for locale '${page.locale}'`);
    }
    usedKeys.add(key);
    return translations[key];
  });

  const unresolved = html.match(/\{\{[^}]+\}\}/g);
  if (unresolved) {
    throw new Error(`Unresolved placeholders in ${page.output}: ${unresolved.join(", ")}`);
  }

  const unusedKeys = Object.keys(translations).filter((key) => !usedKeys.has(key));
  if (unusedKeys.length) {
    throw new Error(`Unused translations for '${page.locale}': ${unusedKeys.join(", ")}`);
  }

  await writeFile(path.join(root, page.output), html);
  console.log(`Built ${page.output} from ${page.locale}.json`);
}
