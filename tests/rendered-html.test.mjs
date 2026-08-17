import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const clientRoot = new URL("../dist/client/", import.meta.url);
const renderedPage = (path = "index.html") => readFile(new URL(path, clientRoot), "utf8");

test("renders the complete workspace directory", async () => {
  const html = (await renderedPage()).replaceAll("<!-- -->", "");

  assert.match(html, /<title>Everything of My Workspace/);
  assert.match(html, /DesertRose(?:&#x27;|')s Blog/);
  assert.match(html, /Study Archive/);
  assert.match(html, /MicroGame3D/);
  assert.match(html, /https:\/\/etienne0112\.github\.io\/MicroGame3D\//);
  assert.match(html, /My Site Template/);
  assert.match(html, /https:\/\/etienne0112\.github\.io\/SiteTemplate\//);
  assert.match(html, /예약 슬롯 20/);
  assert.match(html, /작업 공간 디렉터리/);
  assert.match(html, /다른 사이트 \/ 04/);
  assert.match(html, /바로가기 \/ 02/);
  assert.match(html, /https:\/\/etienne0112\.github\.io\/MainSite\//);
  assert.match(html, /https:\/\/github\.com\/Etienne0112\/MainSite/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("removes starter-only preview code and metadata", async () => {
  const [page, component, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/workspace-directory.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page + component, /SkeletonPreview|_sites-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(component, /workspaceCapacity - activeSites\.length/);
});

test("renders every localized directory with language metadata", async () => {
  const localized = {
    en: ["en", "MY DIGITAL"],
    "zh-TW": ["zh-Hant", "我的數位"],
    "zh-CN": ["zh-Hans", "我的数字"],
    ja: ["ja", "私のデジタル"],
    de: ["de", "MEIN DIGITALER"],
    es: ["es", "MI ESPACIO"],
  };

  for (const [route, [htmlLanguage, marker]] of Object.entries(localized)) {
    const html = await renderedPage(`${route}/index.html`);
    assert.match(html, new RegExp(`<html lang="${htmlLanguage}"`));
    assert.match(html, new RegExp(marker));
    assert.match(html, /hreflang="ko"/);
    assert.match(html, /hreflang="en"/);
  }
});
