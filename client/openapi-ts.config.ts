import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../server/swagger-output.json",
  output: "src/generated/api",
  plugins: ["@hey-api/client-fetch"],
});
