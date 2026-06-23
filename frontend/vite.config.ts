import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";
import fs from "fs";

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const tag = execSync(
  'git describe --tags --abbrev=0 2>/dev/null || echo "untagged"',
)
  .toString()
  .trim();
const outdatedness_report = JSON.parse(
  fs.readFileSync("../data/outdatedness_report.json", "utf8"),
);
const lastScrape = outdatedness_report["scraper/courses/raw_output"];
const repoUrl = execSync("git remote get-url origin")
  .toString()
  .trim()
  .replace(/^git@[^:]+:/, "https://github.com/") // handle any SSH host alias
  .replace(/\.git$/, "");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000/",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __REPO_URL__: JSON.stringify(repoUrl),
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __GIT_TAG__: JSON.stringify(tag),
    __SCRAPE_TS__: JSON.stringify(lastScrape),
  },
});
