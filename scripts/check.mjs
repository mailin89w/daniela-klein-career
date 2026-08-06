import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "index-en.html", "404.html", "resume.html"];
const failures = [];

const fail = (message) => failures.push(message);

for (const filename of pages) {
  const html = await readFile(path.join(root, filename), "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const hrefs = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  const h1Count = (html.match(/<h1\b/g) || []).length;
  if (h1Count !== 1) fail(`${filename}: expected one h1, found ${h1Count}`);
  if (!/<html\b[^>]*lang="(?:de|en)"/.test(html)) fail(`${filename}: missing valid page language`);
  if (!/<main\b/.test(html)) fail(`${filename}: missing main landmark`);

  for (const href of hrefs) {
    if (href.startsWith("#") && !ids.has(href.slice(1))) fail(`${filename}: broken anchor ${href}`);
    if (/^(?:https?:|mailto:)/.test(href) || href.startsWith("#")) continue;
    const target = href.split(/[?#]/)[0];
    if (!target) continue;
    try { await access(path.join(root, target)); } catch { fail(`${filename}: missing local target ${target}`); }
  }

  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener[^"]*"/.test(match[0])) fail(`${filename}: external new-tab link missing noopener`);
  }

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="[^"]*"/.test(match[0])) fail(`${filename}: image missing alt attribute`);
    if (!/\swidth="\d+"/.test(match[0]) || !/\sheight="\d+"/.test(match[0])) fail(`${filename}: image missing intrinsic dimensions`);
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch (error) { fail(`${filename}: invalid structured data (${error.message})`); }
  }
}

const indexHtml = await readFile(path.join(root, "index.html"), "utf8");
const enHtml = await readFile(path.join(root, "index-en.html"), "utf8");
if (!indexHtml.includes("aria-current=\"page\"")) fail("index.html: active language is not marked");
if (!enHtml.includes("aria-current=\"page\"")) fail("index-en.html: active language is not marked");
if (/https:\/\/(?:fonts\.googleapis|fonts\.gstatic|cdn\.credly)\.com/i.test(indexHtml + enHtml)) fail("external font or Credly script request detected");

const jsBytes = (await stat(path.join(root, "app.js"))).size;
const portraitBytes = (await stat(path.join(root, "assets", "daniela-klein.jpg"))).size;
if (jsBytes > 150_000) fail(`app.js exceeds 150 KB budget (${jsBytes} bytes)`);
if (portraitBytes > 200_000) fail(`hero portrait exceeds 200 KB budget (${portraitBytes} bytes)`);

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Static QA passed: ${pages.length} pages, local links, anchors, semantics, structured data and asset budgets`);
