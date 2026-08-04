import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-ignore Vite runs in Node; the app bundle does not include this import.
import { execSync } from "node:child_process";

const gitCommit = execSync("git rev-parse --short HEAD").toString().trim();

export default defineConfig({
  plugins: [react()],
  define: { "import.meta.env.VITE_GIT_COMMIT": JSON.stringify(gitCommit) },
});
