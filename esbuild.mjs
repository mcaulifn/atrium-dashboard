import { readFileSync } from "node:fs";
import esbuild from "esbuild";

const watch = process.argv.includes("--watch");
const { version } = JSON.parse(readFileSync("package.json", "utf8"));

// HA loads this single ES module as a JavaScript-module dashboard resource
// (e.g. copied to <config>/www/atrium.js -> /local/atrium.js).
const outfile = "dist/atrium.js";

const options = {
  entryPoints: ["src/strategy.ts"],
  bundle: true,
  format: "esm",
  target: "es2021",
  outfile,
  sourcemap: watch,
  minify: !watch,
  legalComments: "none",
  // Stamp the package version into the bundle so the served file self-reports.
  define: { __ATRIUM_VERSION__: JSON.stringify(version) },
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("watching…");
} else {
  await esbuild.build(options);
  console.log(`built ${outfile} (v${version})`);
}
