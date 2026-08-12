import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const clientRoot = new URL("../dist/client/", import.meta.url);

async function findRenderedIndex() {
  const entries = await readdir(clientRoot, { recursive: true });
  const htmlFiles = entries.filter((entry) => entry.endsWith("index.html"));

  for (const entry of htmlFiles) {
    const html = await readFile(new URL(entry.replaceAll("\\", "/"), clientRoot), "utf8");
    if (html.includes("Everything of My Workspace")) return html;
  }

  throw new Error("Could not find the rendered workspace directory HTML.");
}

test("renders the complete workspace directory", async () => {
  const html = await findRenderedIndex();

  assert.match(html, /<title>Everything of My Workspace/);
  assert.match(html, /DesertRose(?:&#x27;|')s Blog/);
  assert.match(html, /Study Archive/);
  assert.match(html, /MicroGame3D/);
  assert.match(html, /https:\/\/etienne0112\.github\.io\/MicroGame3D\//);
  assert.match(html, /Reserved Slot 20/);
  assert.match(html, /WORKSPACE DIRECTORY/);
  assert.match(html, /OTHER SITES \/ (?:<!-- -->)?03/);
  assert.match(html, /DIRECT LINKS \/ 02/);
  assert.match(html, /https:\/\/etienne0112\.github\.io\/MainSite\//);
  assert.match(html, /https:\/\/github\.com\/Etienne0112\/MainSite/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("removes starter-only preview code and metadata", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /SkeletonPreview|_sites-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(page, /workspaceCapacity - activeSites\.length/);
});
