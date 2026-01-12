import { describe, it, expect } from 'vitest';
import {
  createGleanRegistry,
  createGleanEnv,
  createGleanHeaders,
  buildGleanServerUrl,
  GLEAN_ENV,
} from '../../src/index.js';

/**
 * Cursor: commandBuilder client (no native CLI)
 * Uses GLEAN_REGISTRY_OPTIONS.commandBuilder for CLI commands
 */
describe('Client: cursor', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('cursor');

  describe('buildConfiguration', () => {
    describe('stdio transport', () => {
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'stdio',
          env: createGleanEnv('my-company', 'my-api-token'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverName = Object.keys(servers)[0];
        expect(serverName).toBe('glean_local');

        const serverConfig = servers[serverName] as Record<string, unknown>;
        expect(serverConfig.command).toBe('npx');
        expect(serverConfig.args).toContain('@gleanwork/local-mcp-server');
        expect(serverConfig.env).toEqual({
          [GLEAN_ENV.INSTANCE]: 'my-company',
          [GLEAN_ENV.API_TOKEN]: 'my-api-token',
        });
      });

      it('with OAuth (instance only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'stdio',
          env: createGleanEnv('my-company'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverName = Object.keys(servers)[0];
        expect(serverName).toBe('glean_local');

        const serverConfig = servers[serverName] as Record<string, unknown>;
        expect(serverConfig.command).toBe('npx');
        expect(serverConfig.env).toEqual({
          [GLEAN_ENV.INSTANCE]: 'my-company',
        });
        expect((serverConfig.env as Record<string, string>)[GLEAN_ENV.API_TOKEN]).toBeUndefined();
      });
    });

    describe('http transport', () => {
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverName = Object.keys(servers)[0];
        expect(serverName).toBe('glean_default');

        const serverConfig = servers[serverName] as Record<string, unknown>;
        expect(serverConfig.url).toBe('https://my-company-be.glean.com/mcp/default');
        expect(serverConfig.type).toBe('http');
      });

      it('with OAuth (URL only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverName = Object.keys(servers)[0];
        expect(serverName).toBe('glean_default');

        const serverConfig = servers[serverName] as Record<string, unknown>;
        expect(serverConfig.url).toBe('https://my-company-be.glean.com/mcp/default');
        expect(serverConfig.type).toBe('http');
      });
    });
  });

  describe('buildCommand (via commandBuilder)', () => {
    describe('stdio transport', () => {
      it('returns command with env flags', () => {
        const command = builder.buildCommand({
          transport: 'stdio',
          env: createGleanEnv('my-company', 'my-api-token'),
        });

        expect(command).not.toBeNull();
        expect(command).toContain('npx -y @gleanwork/configure-mcp-server local');
        expect(command).toContain('--client cursor');
        expect(command).toContain('--env GLEAN_INSTANCE=my-company');
        expect(command).toContain('--env GLEAN_API_TOKEN=my-api-token');
      });

      it('with OAuth (instance only) returns command without token env', () => {
        const command = builder.buildCommand({
          transport: 'stdio',
          env: createGleanEnv('my-company'),
        });

        expect(command).not.toBeNull();
        expect(command).toContain('npx -y @gleanwork/configure-mcp-server local');
        expect(command).toContain('--client cursor');
        expect(command).toContain('--env GLEAN_INSTANCE=my-company');
        expect(command).not.toContain('GLEAN_API_TOKEN');
      });
    });

    describe('http transport', () => {
      it('with token includes --token flag', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(command).not.toBeNull();
        expect(command).toContain('npx -y @gleanwork/configure-mcp-server remote');
        expect(command).toContain('--url https://my-company-be.glean.com/mcp/default');
        expect(command).toContain('--client cursor');
        expect(command).toContain('--token my-api-token');
      });

      it('with OAuth (no token) returns command without --token flag', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(command).not.toBeNull();
        expect(command).toContain('npx -y @gleanwork/configure-mcp-server remote');
        expect(command).toContain('--url https://my-company-be.glean.com/mcp/default');
        expect(command).toContain('--client cursor');
        expect(command).not.toContain('--token');
      });
    });
  });

  describe('supportsCliInstallation', () => {
    it('returns supported with command_builder reason', () => {
      const status = builder.supportsCliInstallation();
      expect(status.supported).toBe(true);
      expect(status.reason).toBe('command_builder');
    });
  });
});
