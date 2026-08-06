import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["src/test/**/*.unit.test.js"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov"],
				include: ["src/js/ui/*.js", "src/js/hmi.js"],
			exclude: ["src/test/**"],
			thresholds: {
				statements: 95,
				branches: 95,
				functions: 95,
				lines: 95,
			},
		},
	},
});
