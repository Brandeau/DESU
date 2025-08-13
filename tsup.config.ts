import { readFileSync, writeFileSync } from "node:fs";

import { defineConfig, type Options } from "tsup";

const BANNER = Object.freeze({
  ignoreTypescript: "// @ts-nocheck",
  ignoreEslint: "/* eslint-disable */",
  shebang: "#!/usr/bin/env -S node",
});

const banner = (...lines: string[]) => lines.join("\n") + "\n";

const shared: Options = {
  bundle: true,
  platform: "node",
  shims: true,
  splitting: false,
  target: "esnext",
  tsconfig: "tsconfig.bundle.json",
  treeshake: {
    preset: "smallest",
    moduleSideEffects: "no-external",
    correctVarValueBeforeDeclaration: true,
  },
};

const ENTRY_FILE = "src/app.ts";
const OUT_DIR = "uwu";

const bin: Options = {
  ...shared,
  // banner: {
  //   js: banner(BANNER.shebang, BANNER.ignoreTypescript, BANNER.ignoreEslint),
  // },
  dts: false,
  entry: [ENTRY_FILE],
  format: ["esm"],
  outDir: OUT_DIR,
  async onSuccess() {
    const outputPath = ENTRY_FILE.replace("src/", `${OUT_DIR}/`).replace(".ts", ".js");
    const currentContent = readFileSync(outputPath, "utf-8");
    const content = [
      BANNER.shebang,
      BANNER.ignoreTypescript,
      BANNER.ignoreEslint,
      currentContent,
    ].join("\n");

    writeFileSync(outputPath, content, "utf-8");
  },
};

export default defineConfig([bin]);
