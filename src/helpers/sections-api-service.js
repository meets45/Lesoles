export default class SectionsAPIService {
  static cache = {};
  static requests = {};

  /**
   * Fetches a section, ensuring only one request is made per unique URL at a time.
   *
   * @async
   * @param {string | URL} url
   * @param {string} sectionId
   * @param {{ cache?: boolean }} config - Configuration options.
   * @returns {Promise<string>}
   */
  static async fetch(url, sectionId, config) {
    const _url = new URL(url);
    _url.searchParams.set('section_id', sectionId);
    const key = _url.toString();

    // Return from cache if available
    if (config?.cache !== false && this.cache[key]) return this.cache[key];

    // If a request is already in progress, return the existing promise
    if (this.requests[key]) return this.requests[key];

    // Create and store the fetch promise
    this.requests[key] = (async () => {
      try {
        const res = await fetch(_url);
        const text = await res.text();
        this.cache[key] = text;
        return text;
      } finally {
        // Clean up the request entry once resolved
        delete this.requests[key];
      }
    })();

    return this.requests[key];
  }
}
