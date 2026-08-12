import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const vinextCli = path.join(projectRoot, "node_modules", "vinext", "dist", "cli.js");
const prerenderRoot = path.join(projectRoot, "dist", "server", "prerendered-routes");
const clientRoot = path.join(projectRoot, "dist", "client");
const sourceIndex = path.join(prerenderRoot, "index.html");

let buildOutput = "";

const child = spawn(process.execPath, [vinextCli, "build"], {
  cwd: projectRoot,
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: ".wrangler/wrangler.log",
  },
  stdio: ["inherit", "pipe", "pipe"],
});

for (const stream of [child.stdout, child.stderr]) {
  stream.on("data", (chunk) => {
    const text = chunk.toString();
    buildOutput += text;
    if (stream === child.stdout) process.stdout.write(text);
    else process.stderr.write(text);
  });
}

const exitCode = await new Promise((resolve) => child.on("exit", (code) => resolve(code ?? 1)));
const completedBeforeWindowsTeardown = buildOutput.includes("Build complete") && existsSync(sourceIndex);

if (exitCode !== 0 && !completedBeforeWindowsTeardown) {
  process.exit(exitCode);
}

await mkdir(clientRoot, { recursive: true });

async function copyStaticRoute(sourceName, destinationName) {
  const source = path.join(prerenderRoot, sourceName);
  if (!existsSync(source)) return;

  const raw = await readFile(source, "utf8");
  const pagesReady = raw.includes("/MainSite/_next/")
    ? raw
    : raw.replaceAll("/_next/", "/MainSite/_next/");
  await writeFile(path.join(clientRoot, destinationName), pagesReady, "utf8");
}

await copyStaticRoute("index.html", "index.html");
await copyStaticRoute("404.html", "404.html");

await copyStaticRoute("index.rsc", "index.rsc");

const finalHtml = await readFile(path.join(clientRoot, "index.html"), "utf8");

if (!finalHtml.includes("Reserved Slot 20") || !finalHtml.includes("/MainSite/_next/")) {
  throw new Error("GitHub Pages output validation failed.");
}

console.log("\nGitHub Pages static output prepared in dist/client.");
