import { describe, it, expect } from 'vitest';
import {
  createGleanRegistry,
  createGleanEnv,
  createGleanHeaders,
  buildGleanServerUrl,
  CLI_INSTALL_REASON,
} from '../../src/index.js';

/**
 * JetBrains: non-CLI client
 * No configPath - must be configured via IDE UI
 * buildCommand() should return null
 * supportsCliInstallation() should return unsupported with no_config_path reason
 */
describe('Client: jetbrains (non-CLI)', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('jetbrains');

  describe('buildConfiguration', () => {
    it('stdio generates valid config for manual paste', () => {
      const config = builder.buildConfiguration({
        transport: 'stdio',
        env: createGleanEnv('my-company', 'my-api-token'),
      });

      expect(config).toHaveProperty('mcpServers');
      const servers = config.mcpServers;
      const serverConfig = servers[Object.keys(servers)[0]] as Record<string, unknown>;
      expect(serverConfig.command).toBe('npx');
    });

    it('http generates valid config for manual paste', () => {
      const config = builder.buildConfiguration({
        transport: 'http',
        serverUrl: buildGleanServerUrl('my-company'),
        headers: createGleanHeaders('my-api-token'),
      });

      expect(config).toHaveProperty('mcpServers');
      const servers = config.mcpServers;
      const serverConfig = servers[Object.keys(servers)[0]] as Record<string, unknown>;
      expect(serverConfig.url).toBe('https://my-company-be.glean.com/mcp/default');
    });
  });

  describe('buildCommand', () => {
    it('returns null for stdio transport', () => {
      const command = builder.buildCommand({
        transport: 'stdio',
        env: createGleanEnv('my-company', 'my-api-token'),
      });

      expect(command).toBeNull();
    });

    it('returns null for http transport', () => {
      const command = builder.buildCommand({
        transport: 'http',
        serverUrl: buildGleanServerUrl('my-company'),
        headers: createGleanHeaders('my-api-token'),
      });

      expect(command).toBeNull();
    });
  });

  describe('supportsCliInstallation', () => {
    it('returns unsupported with no_config_path reason', () => {
      const status = builder.supportsCliInstallation();
      expect(status.supported).toBe(false);
      if (!status.supported) {
        expect(status.reason).toBe(CLI_INSTALL_REASON.NO_CONFIG_PATH);
        expect(status.message).toBeDefined();
      }
    });
  });
});
