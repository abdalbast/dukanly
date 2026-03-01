import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const viteConfigPath = path.join(rootDir, "vite.config.ts");
const packageJsonPath = path.join(rootDir, "package.json");

const viteConfigText = readFileSync(viteConfigPath, "utf8");
const packageJsonText = readFileSync(packageJsonPath, "utf8");

const hasSwcPluginInConfig = viteConfigText.includes("@vitejs/plugin-react-swc");
const hasSwcPluginInPackage = packageJsonText.includes('"@vitejs/plugin-react-swc"');

if (hasSwcPluginInConfig || hasSwcPluginInPackage) {
  console.error(
    [
      "Incompatible React Refresh setup detected.",
      "This project must use @vitejs/plugin-react with Vite 7 to avoid",
      "runtime errors like `RefreshRuntime.getRefreshReg is not a function`.",
      "Remove @vitejs/plugin-react-swc from package.json and vite.config.ts.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("React Refresh compatibility check passed.");
