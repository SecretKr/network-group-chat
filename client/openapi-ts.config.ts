import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../server/swagger-output.json",
  output: "src/generated/api",
  plugins: [
    {
      name: "@hey-api/client-fetch",
      runtimeConfigPath: "./src/lib/api-client.ts",
    },
  ],
});
