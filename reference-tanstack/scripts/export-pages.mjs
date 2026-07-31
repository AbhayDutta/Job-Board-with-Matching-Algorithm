import { cp, copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const basePath = process.env.BASE_PATH ?? "/Job-Board-with-Matching-Algorithm/";
const siteOrigin = process.env.PAGES_ORIGIN ?? "https://abhaydutta.github.io";
const siteUrl =
  process.env.SITE_URL ?? new URL(basePath, `${siteOrigin}/`).href;

const outputDir = path.resolve("dist");
const publicDir = path.resolve(".output/public");
const serverEntry = path.resolve(".output/server/index.mjs");

if (!existsSync(publicDir) || !existsSync(serverEntry)) {
  throw new Error("Run `npm run build` before `npm run export:pages`.");
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(publicDir, outputDir, { recursive: true });

for (const icon of ["favicon.ico", "favicon (1).ico"]) {
  if (existsSync(icon)) {
    await copyFile(icon, path.join(outputDir, icon));
  }
}

const server = await import(pathToFileURL(serverEntry).href);
const pendingTasks = [];
const context = {
  waitUntil(task) {
    pendingTasks.push(Promise.resolve(task));
  },
};

const response = await server.default.fetch(new Request(siteUrl), {}, context);

if (!response.ok) {
  throw new Error(
    `Static render failed: ${response.status} ${response.statusText}`,
  );
}

const normalizedBasePath = basePath.endsWith("/")
  ? basePath.slice(0, -1)
  : basePath;
let html = await response.text();
html = html.replaceAll(
  'href="/favicon.ico"',
  `href="${normalizedBasePath}/favicon.ico"`,
);

await writeFile(path.join(outputDir, "index.html"), html);
await writeFile(path.join(outputDir, "404.html"), html);
await writeFile(path.join(outputDir, ".nojekyll"), "");
await Promise.all(pendingTasks);

console.log(`Exported GitHub Pages site to ${outputDir}`);
