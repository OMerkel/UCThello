// @ts-check
import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./src/test",
	testMatch: "**/*.e2e.spec.js",
	use: {
		baseURL: "http://127.0.0.1:4173",
		headless: true,
	},
	webServer: {
		command: "npx --yes http-server src -p 4173 --silent",
		port: 4173,
		reuseExistingServer: true,
		timeout: 120000,
	},
});
