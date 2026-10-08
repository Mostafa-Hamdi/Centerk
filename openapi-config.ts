import type { ConfigFile } from '@rtk-query/codegen-openapi';

/**
 * Generates typed endpoints + DTOs from the backend Swagger into src/services/generated/backend.ts
 * (`npm run api:codegen`). Feature code imports *types* from it (`import type`), so nothing generated
 * ends up in the bundle unless a feature opts in to a generated endpoint.
 * Override the source with OPENAPI_URL (e.g. a local backend or a saved swagger.json).
 */
const config: ConfigFile = {
  schemaFile: process.env.OPENAPI_URL ?? 'https://teachercenter.runasp.net/swagger/v1/swagger.json',
  apiFile: './src/services/api.ts',
  apiImport: 'api',
  outputFile: './src/services/generated/backend.ts',
  exportName: 'backendApi',
  hooks: false,
  tag: true,
};

export default config;
