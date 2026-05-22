import api from './api';

function getApiOrigin() {
  const baseURL = api.defaults.baseURL || '/api';
  if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
    return new URL(baseURL).origin;
  }

  return window.location.origin;
}

export function resolveAssetUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  if (url.startsWith('/uploads/')) {
    return `${getApiOrigin()}${url}`;
  }

  return url;
}
