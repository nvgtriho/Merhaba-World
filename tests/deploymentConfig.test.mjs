import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const projectRoot = fileURLToPath(new URL("../", import.meta.url));

test("configures Vercel for static root preview deployments", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

  assert.equal(config.$schema, "https://openapi.vercel.sh/vercel.json");
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, "");
  assert.equal(config.installCommand, "");
  assert.equal(config.outputDirectory, ".");

  assertHasNoStoreHeader(config, "/service-worker.js");
  assertHasNoStoreHeader(config, "/manifest.webmanifest");
});

test("allowlists only runtime static files for Vercel uploads", async () => {
  const ignoreRules = (await readFile(new URL("../.vercelignore", import.meta.url), "utf8"))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  assert.equal(ignoreRules[0], "/*");
  assert.deepEqual(ignoreRules.slice(1), [
    "!index.html",
    "!manifest.webmanifest",
    "!service-worker.js",
    "!assets/",
    "!assets/**",
    "!src/",
    "!src/**",
    "!vercel.json"
  ]);
  assert.equal(ignoreRules.includes("!tests/**"), false);
  assert.equal(ignoreRules.includes("!supabase/**"), false);
  assert.equal(ignoreRules.includes("!scripts/**"), false);
  assert.equal(ignoreRules.includes("!artifacts/**"), false);
});

test("wires a deployment smoke-test script into package scripts", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(packageJson.scripts["test:deploy"], "node scripts/verify-deployment.mjs");
});

test("uses the repository name in browser and PWA display metadata", async () => {
  const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const manifest = JSON.parse(await readFile(new URL("../manifest.webmanifest", import.meta.url), "utf8"));
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
  const oldChineseBrand = "\u5c0f\u571f";
  const oldPaceLabel = "\u7279\u79cd\u5175";

  assert.match(index, /<title>Merhaba-World<\/title>/);
  assert.equal(manifest.name, "Merhaba-World");
  assert.equal(manifest.short_name, "Merhaba");
  assert.equal(index.includes(oldChineseBrand), false);
  assert.equal(manifest.name.includes(oldChineseBrand), false);
  assert.equal(readme.includes(oldChineseBrand), false);
  assert.equal(readme.includes(oldPaceLabel), false);
});

test("deployment verifier accepts a local static preview serving cached PWA assets", async () => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    const { stdout } = await execFileAsync(process.execPath, [
      "scripts/verify-deployment.mjs",
      `http://127.0.0.1:${port}`
    ], {
      cwd: new URL("../", import.meta.url)
    });

    assert.match(stdout, /Deployment smoke test passed/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("service worker precaches recognized wiki credential screenshots", async () => {
  const serviceWorker = await readFile(new URL("../service-worker.js", import.meta.url), "utf8");

  assert.equal(serviceWorker.includes("/assets/wiki/saint-john-confirmation.jpg"), true);
  assert.equal(serviceWorker.includes("/assets/wiki/salonika-suites-confirmation.png"), true);
  assert.equal(serviceWorker.includes("/assets/wiki/ticket-kamilkoc-antalya-goreme.jpg"), true);
  assert.equal(serviceWorker.includes("/assets/wiki/flight-tk2001.jpg"), true);
});

test("service worker precaches runtime modules imported by the app shell", async () => {
  const serviceWorker = await readFile(new URL("../service-worker.js", import.meta.url), "utf8");

  assert.equal(serviceWorker.includes("/src/lib/assistantLinks.js"), true);
  assert.equal(serviceWorker.includes("/src/lib/weatherLocations.js"), true);
});

test("service worker bumps cache version and refreshes app shell resources from the network", async () => {
  const serviceWorker = await readFile(new URL("../service-worker.js", import.meta.url), "utf8");

  assert.match(serviceWorker, /CACHE_NAME = "merhaba-world-v3"/);
  assert.match(serviceWorker, /NETWORK_FIRST_PATHS/);
  assert.match(serviceWorker, /"\/src\/App\.js"/);
  assert.match(serviceWorker, /"\/src\/styles\.css"/);
  assert.match(serviceWorker, /"\/src\/data\/tripSeed\.js"/);
  assert.match(serviceWorker, /"\/src\/lib\/maps\.js"/);
  assert.match(serviceWorker, /event\.request\.mode === "navigate"/);
  assert.match(serviceWorker, /fetch\(event\.request\)/);
});

function assertHasNoStoreHeader(config, source) {
  const route = config.headers.find((entry) => entry.source === source);
  assert.ok(route, `${source} header rule is missing`);
  assert.deepEqual(route.headers, [
    {
      key: "Cache-Control",
      value: "public, max-age=0, must-revalidate"
    }
  ]);
}

function createStaticServer() {
  const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
  };

  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const filePath = normalize(join(projectRoot, requestedPath));

    if (!filePath.startsWith(normalize(projectRoot))) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    try {
      const body = await readFile(filePath);
      response.writeHead(200, {
        "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream"
      });
      response.end(body);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}
