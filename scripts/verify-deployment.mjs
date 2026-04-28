import { pathToFileURL } from "node:url";

const REQUIRED_PATHS = [
  "/",
  "/manifest.webmanifest",
  "/service-worker.js",
  "/assets/icon.svg",
  "/assets/icon-maskable.svg",
  "/src/App.js",
  "/src/styles.css"
];

export async function verifyDeployment(baseUrl, options = {}) {
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new Error("This script requires a Node runtime with fetch support.");
  }

  const origin = normalizeBaseUrl(baseUrl);
  const failures = [];

  const [manifestResult, serviceWorkerResult] = await Promise.all([
    fetchText(fetchImpl, origin, "/manifest.webmanifest"),
    fetchText(fetchImpl, origin, "/service-worker.js")
  ]);

  if (!manifestResult.ok) failures.push(manifestResult.message);
  if (!serviceWorkerResult.ok) failures.push(serviceWorkerResult.message);

  const paths = new Set(REQUIRED_PATHS);

  if (manifestResult.ok) {
    try {
      const manifest = JSON.parse(manifestResult.text);
      for (const icon of manifest.icons ?? []) {
        if (typeof icon.src === "string") paths.add(toPathname(icon.src));
      }
    } catch (error) {
      failures.push(`/manifest.webmanifest did not parse as JSON: ${error.message}`);
    }
  }

  if (serviceWorkerResult.ok) {
    for (const path of parseServiceWorkerCachePaths(serviceWorkerResult.text)) {
      paths.add(path);
    }
  }

  const checks = await Promise.all(Array.from(paths).sort().map((path) => fetchHeadOrGet(fetchImpl, origin, path)));
  for (const check of checks) {
    if (!check.ok) failures.push(check.message);
  }

  if (failures.length > 0) {
    return {
      ok: false,
      checked: checks.length,
      failures
    };
  }

  return {
    ok: true,
    checked: checks.length,
    failures: []
  };
}

export function parseServiceWorkerCachePaths(source) {
  const match = source.match(/LOCAL_ASSETS\s*=\s*\[([\s\S]*?)\]/);
  if (!match) return [];

  return Array.from(match[1].matchAll(/["']([^"']+)["']/g), ([, value]) => toPathname(value));
}

async function fetchText(fetchImpl, origin, path) {
  try {
    const response = await fetchImpl(new URL(path, origin));
    const text = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        text,
        message: `${path} returned ${response.status}`
      };
    }
    return { ok: true, text, message: "" };
  } catch (error) {
    return {
      ok: false,
      text: "",
      message: `${path} failed: ${error.message}`
    };
  }
}

async function fetchHeadOrGet(fetchImpl, origin, path) {
  try {
    const response = await fetchImpl(new URL(path, origin), { method: "GET" });
    await response.arrayBuffer();
    if (!response.ok) {
      return {
        ok: false,
        message: `${path} returned ${response.status}`
      };
    }
    return { ok: true, message: "" };
  } catch (error) {
    return {
      ok: false,
      message: `${path} failed: ${error.message}`
    };
  }
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) {
    throw new Error("Usage: node scripts/verify-deployment.mjs https://your-preview.vercel.app");
  }

  const url = new URL(baseUrl);
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

function toPathname(value) {
  return new URL(value, "https://deployment-smoke-test.local").pathname;
}

async function main() {
  try {
    const result = await verifyDeployment(process.argv[2]);
    if (!result.ok) {
      console.error("Deployment smoke test failed:");
      for (const failure of result.failures) {
        console.error(`- ${failure}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log(`Deployment smoke test passed (${result.checked} resources checked).`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
