import type { CreateClientConfig } from "../generated/api/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseUrl: process.env.REACT_APP_BACKEND_URL,
});
