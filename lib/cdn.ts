const trimSlash = (value: string) => value.replace(/\/+$/, "");

const getBase = () => {
  const direct = process.env.NEXT_PUBLIC_CDN_BASE;
  if (direct) return trimSlash(direct);

  const proxy = process.env.NEXT_PUBLIC_CDN_PROXY;
  if (proxy) return trimSlash(proxy);

  // Default to relative fallback; still run through helper so we can swap easily later.
  return "";
};

const getHostedProxy = (src: string) => {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const proxy = process.env.NEXT_PUBLIC_CDN_PROXY || "https://wsrv.nl/?url=";
  if (!site) return "";
  const normalizedSrc = src.startsWith("http") ? src : `${site}${src}`;
  return `${proxy}${encodeURIComponent(normalizedSrc)}`;
};

/**
 * Builds a CDN-safe URL for an image. If a CDN base is provided, we prepend it.
 * Otherwise we keep the original src so local assets still work in dev.
 */
export function buildCdnUrl(src: string) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;

  const base = getBase();
  if (!base) {
    const proxied = getHostedProxy(src);
    return proxied || src;
  }

  return `${base}${src.startsWith("/") ? src : `/${src}`}`;
}

/**
 * Normalizes a photo src to always point at the CDN or remote location.
 */
export function withCdn(src?: string) {
  if (!src) return "";
  return buildCdnUrl(src);
}
