// Node ESM does not append .js to this package subpath, while Next's app
// toolchain accepts the source import as written. Redirect only the real
// middleware module to Next's exact CommonJS entry during the Node test run.
export function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server" && context.parentURL?.endsWith("/src/middleware.ts")) {
    return nextResolve("next/server.js", context);
  }

  return nextResolve(specifier, context);
}
