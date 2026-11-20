import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";
import fs from "fs";

// Git metadata: use env vars (set in Docker builds, where .git is absent), else ask git.
const git = (cmd: string, fallback: string) => {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
};
const commitHash =
  process.env.COMMIT_HASH ?? git("git rev-parse --short HEAD", "unknown");
const tag =
  process.env.GIT_TAG ??
  git("git describe --tags --abbrev=0", "untagged");
const outdatedness_report = JSON.parse(
  fs.readFileSync("../data/outdatedness_report.json", "utf8"),
);
const lastScrape = outdatedness_report["scraper/courses/raw_output"];
const repoUrl = (
  process.env.REPO_URL ?? git("git remote get-url origin", "")
)
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
