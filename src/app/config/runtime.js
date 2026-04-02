// Template runtime config.
// Replace API_BASE_URL with your own backend endpoint after cloning.
export const RUNTIME_CONFIG = {
  API_BASE_URL: 'https://example.com/api.php/'
}

export const getApiBaseUrl = () => RUNTIME_CONFIG.API_BASE_URL

export default RUNTIME_CONFIG
