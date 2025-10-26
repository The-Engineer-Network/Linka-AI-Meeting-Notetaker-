// Basic Chrome API mocks for Jest
global.chrome = {
  identity: {
    getAuthToken: jest.fn(),
    removeCachedAuthToken: jest.fn(),
  },
  storage: {
    local: {
      get: jest.fn((keys, cb) => cb({})),
      set: jest.fn((items, cb) => cb && cb()),
    },
  },
  runtime: {
    lastError: null,
  },
};
