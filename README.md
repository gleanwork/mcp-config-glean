# @gleanwork/mcp-config

Glean-specific MCP configuration defaults and helpers. Wraps `@gleanwork/mcp-config-schema` with Glean-specific constants and convenience functions.

## Installation

```bash
npm install @gleanwork/mcp-config
```

## Usage

### Quick Start

```typescript
import {
  createGleanRegistry,
  createGleanEnv,
  createGleanHeaders,
  buildGleanServerUrl,
} from '@gleanwork/mcp-config';

// Create a pre-configured registry
const registry = createGleanRegistry();
const builder = registry.createBuilder('cursor');

// Generate stdio configuration
const stdioConfig = builder.buildConfiguration({
  transport: 'stdio',
  env: createGleanEnv('my-company', 'my-api-token'),
});

// Generate HTTP configuration
const httpConfig = builder.buildConfiguration({
  transport: 'http',
  serverUrl: buildGleanServerUrl('my-company'),
  headers: createGleanHeaders('my-api-token'),
});
```

### Available Exports

#### Constants

```typescript
import { GLEAN_REGISTRY_OPTIONS, GLEAN_ENV } from '@gleanwork/mcp-config';

// Registry options for stdio transport
GLEAN_REGISTRY_OPTIONS.serverPackage  // '@gleanwork/local-mcp-server'
GLEAN_REGISTRY_OPTIONS.cliPackage     // '@gleanwork/configure-mcp-server'

// Environment variable names
GLEAN_ENV.INSTANCE   // 'GLEAN_INSTANCE'
GLEAN_ENV.URL        // 'GLEAN_URL'
GLEAN_ENV.API_TOKEN  // 'GLEAN_API_TOKEN'
```

#### Helper Functions

| Function | Description |
|----------|-------------|
| `createGleanRegistry()` | Create MCPConfigRegistry with Glean defaults |
| `createGleanEnv(instance, apiToken?)` | Create env vars using instance name |
| `createGleanUrlEnv(url, apiToken?)` | Create env vars using full URL |
| `createGleanHeaders(apiToken)` | Create Authorization header |
| `buildGleanServerUrl(instance, endpoint?)` | Build Glean MCP server URL |

### Re-exports

This package re-exports everything from `@gleanwork/mcp-config-schema`, so you can import both Glean-specific and generic types from a single package:

```typescript
import {
  // Glean-specific
  createGleanRegistry,
  createGleanEnv,
  GLEAN_ENV,

  // From mcp-config-schema
  MCPConfigRegistry,
  type MCPConnectionOptions,
  type ClientId,
} from '@gleanwork/mcp-config';
```

## License

MIT
