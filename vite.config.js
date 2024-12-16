import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import structuredClone from "structured-clone";
global.structuredClone = global.structuredClone || structuredClone;


// Export Vite configuration
export default defineConfig(({ mode }) => {
  // Load and set environment variables
  setEnv(mode);

  return {
    plugins: [
      react(), // React plugin for Vite
      envPlugin(), // Handle environment variables
      devServerPlugin(), // Server settings
      sourcemapPlugin(), // Source map configuration
      buildPathPlugin(), // Output build path
      basePlugin(), // Public base path
      importPrefixPlugin(), // Resolve node_modules imports
      htmlPlugin(mode), // Transform HTML for environment variables
    ],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"), // Alias for src directory
      },
    },
  };
});

// Set environment variables
function setEnv(mode) {
  Object.assign(
    process.env,
    loadEnv(mode, ".", ["REACT_APP_", "NODE_ENV", "PUBLIC_URL"])
  );
  process.env.NODE_ENV ||= mode;
  const { homepage } = JSON.parse(readFileSync("package.json", "utf-8"));
  process.env.PUBLIC_URL ||= homepage
    ? `${homepage.startsWith("http") || homepage.startsWith("/")
        ? homepage
        : `/${homepage}`}`.replace(/\/$/, "")
    : "";
}

// Plugin: Expose `process.env` variables for client use
function envPlugin() {
  return {
    name: "env-plugin",
    config(_, { mode }) {
      const env = loadEnv(mode, ".", ["REACT_APP_", "NODE_ENV", "PUBLIC_URL"]);
      return {
        define: Object.fromEntries(
          Object.entries(env).map(([key, value]) => [
            `process.env.${key}`,
            JSON.stringify(value),
          ])
        ),
      };
    },
  };
}

// Plugin: Setup dev server with host, port, and SSL
function devServerPlugin() {
  return {
    name: "dev-server-plugin",
    config(_, { mode }) {
      const { HOST, PORT, HTTPS, SSL_CRT_FILE, SSL_KEY_FILE } = loadEnv(
        mode,
        ".",
        ["HOST", "PORT", "HTTPS", "SSL_CRT_FILE", "SSL_KEY_FILE"]
      );
      const https = HTTPS === "true";
      return {
        server: {
          host: HOST || "0.0.0.0",
          port: parseInt(PORT || "3000", 10),
          open: true,
          ...(https &&
            SSL_CRT_FILE &&
            SSL_KEY_FILE && {
              https: {
                cert: readFileSync(resolve(SSL_CRT_FILE)),
                key: readFileSync(resolve(SSL_KEY_FILE)),
              },
            }),
        },
      };
    },
  };
}

// Plugin: Enable source maps during builds
function sourcemapPlugin() {
  return {
    name: "sourcemap-plugin",
    config(_, { mode }) {
      const { GENERATE_SOURCEMAP } = loadEnv(mode, ".", [
        "GENERATE_SOURCEMAP",
      ]);
      return {
        build: {
          sourcemap: GENERATE_SOURCEMAP === "true",
        },
      };
    },
  };
}

// Plugin: Customize the build output directory
function buildPathPlugin() {
  return {
    name: "build-path-plugin",
    config(_, { mode }) {
      const { BUILD_PATH } = loadEnv(mode, ".", ["BUILD_PATH"]);
      return {
        build: {
          outDir: BUILD_PATH || "build",
        },
      };
    },
  };
}

// Plugin: Set public base path for the application
function basePlugin() {
  return {
    name: "base-plugin",
    config(_, { mode }) {
      const { PUBLIC_URL } = loadEnv(mode, ".", ["PUBLIC_URL"]);
      return {
        base: PUBLIC_URL || "",
      };
    },
  };
}

// Plugin: Resolve node_modules imports with ~ prefix
function importPrefixPlugin() {
  return {
    name: "import-prefix-plugin",
    config() {
      return {
        resolve: {
          alias: [{ find: /^~([^/])/, replacement: "$1" }],
        },
      };
    },
  };
}

// Plugin: Transform HTML with environment variables
function htmlPlugin(mode) {
  const env = loadEnv(mode, ".", ["REACT_APP_", "NODE_ENV", "PUBLIC_URL"]);
  return {
    name: "html-plugin",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match);
      },
    },
  };
}
