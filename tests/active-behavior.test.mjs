import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NextRequest } from "next/server.js";
import test from "node:test";
import vm from "node:vm";

const { isProductionHost, middleware } = await import("../src/middleware.ts");

const layoutSource = readFileSync(
  fileURLToPath(new URL("../src/app/layout.tsx", import.meta.url)),
  "utf8",
);
const bootstrapMatches = [
  ...layoutSource.matchAll(/__html:\s*`([\s\S]*?)`/g),
];
assert.equal(
  bootstrapMatches.length,
  1,
  "layout.tsx must contain exactly one inline theme bootstrap",
);
const themeBootstrap = bootstrapMatches[0][1];

function runThemeBootstrap({ systemDark = false, storedValue = null, storageFailure = null }) {
  const attributes = new Map();
  const rootStyle = {
    colorScheme: "",
    setProperty() {},
  };
  const root = {
    classList: { add() {} },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
    style: rootStyle,
  };
  const document = { documentElement: root };
  const localStorage = {
    getItem() {
      if (storageFailure) throw storageFailure;
      return storedValue;
    },
    removeItem() {},
  };
  const window = {
    get localStorage() {
      if (storageFailure === "getter") throw new Error("storage unavailable");
      return localStorage;
    },
    matchMedia(query) {
      return {
        matches:
          query === "(prefers-color-scheme: dark)"
            ? systemDark
            : false,
      };
    },
    innerWidth: 1280,
    innerHeight: 800,
    addEventListener() {},
  };
  const history = { scrollRestoration: "auto" };

  vm.runInNewContext(themeBootstrap, { document, window, history }, { timeout: 1000 });
  return attributes.get("data-mode");
}

test("real layout bootstrap follows system preference when no override exists", async (t) => {
  await t.test("system light", () => {
    assert.equal(runThemeBootstrap({ systemDark: false }), "light");
  });
  await t.test("system dark", () => {
    assert.equal(runThemeBootstrap({ systemDark: true }), "dark");
  });
});

test("real layout bootstrap lets a manual override win over system preference", async (t) => {
  await t.test("manual light overrides system dark", () => {
    assert.equal(
      runThemeBootstrap({ systemDark: true, storedValue: '{"theme":"light"}' }),
      "light",
    );
  });
  await t.test("manual dark overrides system light", () => {
    assert.equal(
      runThemeBootstrap({ systemDark: false, storedValue: '{"theme":"dark"}' }),
      "dark",
    );
  });
});

test("real layout bootstrap tolerates the legacy expiresAt record", () => {
  assert.equal(
    runThemeBootstrap({
      systemDark: false,
      storedValue: '{"theme":"dark","expiresAt":0}',
    }),
    "dark",
  );
});

test("real layout bootstrap falls back to system preference when storage fails", async (t) => {
  await t.test("getItem throws", () => {
    assert.equal(
      runThemeBootstrap({ systemDark: true, storageFailure: new Error("blocked") }),
      "dark",
    );
  });
  await t.test("localStorage getter throws", () => {
    assert.equal(
      runThemeBootstrap({ systemDark: false, storageFailure: "getter" }),
      "light",
    );
  });
});

const hostCases = [
  ["production apex", "thatssoheil.website", true],
  ["production www", "www.thatssoheil.website", true],
  ["production apex with HTTPS port", "thatssoheil.website:443", true],
  ["production www with alternate port", "WWW.THATSSOHEIL.WEBSITE:8443", true],
  ["case-insensitive production host", "THATSSOHEIL.WEBSITE", true],
  ["canonical branch preview", "dev.dev.thatssoheil.website", false],
  ["nested branch preview", "feature.dev.thatssoheil.website", false],
  ["bare dev alias", "dev.thatssoheil.website", false],
  ["workers.dev preview", "dev-thatssoheil.nodeontop.workers.dev", false],
  ["arbitrary workers.dev host", "preview.workers.dev", false],
  ["empty host", "", false],
  ["null host", null, false],
  // The helper classifies the supplied Host value; it cannot authenticate it.
  ["spoofed production Host value", "thatssoheil.website", true],
];

test("isProductionHost truth table uses normalized raw Host values", async (t) => {
  for (const [label, host, expected] of hostCases) {
    await t.test(label, () => {
      assert.equal(isProductionHost(host), expected);
    });
  }
});

function makeRequest(hostHeader, urlHost = hostHeader) {
  const url = new URL(`http://${urlHost}/path?from=test`);
  return new NextRequest(url, { headers: new Headers({ host: hostHeader }) });
}

const expectedSecurityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  "Strict-Transport-Security": "max-age=31536000",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
};

test("middleware response includes the five exact security headers and host policy", async (t) => {
  const cases = [
    { label: "production", host: "thatssoheil.website", noindex: false },
    { label: "branch preview", host: "dev.dev.thatssoheil.website", noindex: true },
    { label: "workers.dev preview", host: "preview.workers.dev", noindex: true },
  ];

  for (const { label, host, noindex } of cases) {
    await t.test(label, () => {
      const response = middleware(makeRequest(host));
      for (const [name, expected] of Object.entries(expectedSecurityHeaders)) {
        assert.equal(response.headers.get(name), expected, `${name} on ${label}`);
      }
      assert.equal(
        response.headers.get("X-Robots-Tag"),
        noindex ? "noindex, nofollow" : null,
      );
    });
  }
});

test("middleware classifies the raw Host header, not nextUrl.hostname", () => {
  const response = middleware(
    makeRequest("dev.dev.thatssoheil.website", "thatssoheil.website"),
  );
  assert.equal(response.headers.get("X-Robots-Tag"), "noindex, nofollow");

  // A caller able to supply a production-looking Host is classified as production.
  // This is host normalization, not an origin-authentication boundary.
  const spoofedProductionHost = middleware(
    makeRequest("thatssoheil.website", "dev.dev.thatssoheil.website"),
  );
  assert.equal(spoofedProductionHost.headers.get("X-Robots-Tag"), null);
});

test("bare dev Host with a port redirects to the canonical HTTPS preview", () => {
  const response = middleware(
    makeRequest("dev.thatssoheil.website:8080", "dev.thatssoheil.website:8080"),
  );
  assert.equal(response.status, 307);
  assert.equal(
    response.headers.get("Location"),
    "https://dev.dev.thatssoheil.website/path?from=test",
  );
  // This branch returns before the normal response policy; the canonical preview
  // response itself is covered above.
  assert.equal(response.headers.get("X-Robots-Tag"), null);
});
