export function normalizeBaseUrl(url: string): string {
  if (!url) {
    throw new Error("Oracle base URL is not defined.");
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const protocol =
    url.startsWith("localhost") || url.startsWith("127.0.0.1")
      ? "http://"
      : "https://";

  return `${protocol}${url}`;
}

export function normalizePath(path: string): string {
  if (!path) {
    throw new Error("Path is required for Loyal Oracle requests.");
  }
  return path.startsWith("/") ? path : `/${path}`;
}
