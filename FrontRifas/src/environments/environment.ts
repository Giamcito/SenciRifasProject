export const environment = {
  production: false,
  get apiUrl(): string {
    const host = (typeof window !== 'undefined' && window.location?.hostname)
      ? window.location.hostname
      : 'localhost';
    return `http://${host}:8080/api`;
  }
};
