import '@testing-library/jest-dom';

// Mock chrome APIs for testing environment
const storageMock: Record<string, unknown> = {};

globalThis.chrome = {
  storage: {
    local: {
      get: async (key: string) => ({ [key]: storageMock[key] }),
      set: async (items: Record<string, unknown>) => {
        Object.assign(storageMock, items);
      },
    },
  },
  runtime: {
    sendMessage: async () => ({}),
    onInstalled: { addListener: () => {} },
    getManifest: () => ({ version: '0.0.0-test' }),
  },
  sidePanel: {
    setPanelBehavior: async () => {},
  },
} as unknown as typeof chrome;
