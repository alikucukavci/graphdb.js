const HttpClientConfig = require('http/http-client-config');

/**
 * Creates stub of HttpClient with default method spies.
 */
function stub(baseUrl) {
  return {
    baseUrl,
    setDefaultHeaders: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({}),
    post: jest.fn().mockResolvedValue({}),
    put: jest.fn().mockResolvedValue({}),
    deleteResource: jest.fn().mockResolvedValue({}),
    getConfigBuilder: () => new HttpClientConfig()
  };
}

module.exports = stub;
