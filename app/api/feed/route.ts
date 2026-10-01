import { parseRss } from "@/lib/studio";

// Fetches a podcast RSS feed for the Studio's import page. Browsers can't read
// most feeds directly because feed hosts don't send CORS headers.

const MAX_BYTES = 5 * 1024 * 1024;

/** Hosts a public feed never lives on; keeps this from probing private networks. */
function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".internal") ||
    h.endsWith(".local") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h === "::1" ||
    /^f[cd]/.test(h) ||
    /^fe80:/.test(h)
  );
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")?.trim() ?? "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return Response.json({ error: "That isn't a web address." }, { status: 400 });
  }
  if (!/^https?:$/.test(url.protocol) || isPrivateHost(url.hostname)) {
    return Response.json({ error: "Use a public http or https feed address." }, { status: 400 });
  }
  let res: Response | undefined;
  try {
    // Follow redirects by hand so each hop gets the same public-host check.
    for (let hop = 0; hop < 4; hop++) {
      res = await fetch(url, {
        headers: { "user-agent": "NatureMe feed import", accept: "application/rss+xml, application/xml, text/xml, */*" },
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
        redirect: "manual",
      });
      const next = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
      if (!next) break;
      url = new URL(next, url);
      if (!/^https?:$/.test(url.protocol) || isPrivateHost(url.hostname)) {
        return Response.json({ error: "That feed redirects somewhere it can't be read from." }, { status: 400 });
      }
      res = undefined;
    }
  } catch {
    return Response.json({ error: "Couldn't reach that feed." }, { status: 502 });
  }
  if (!res) return Response.json({ error: "That feed redirects too many times." }, { status: 502 });
  if (!res.ok) return Response.json({ error: `The feed answered ${res.status}.` }, { status: 502 });
  if (Number(res.headers.get("content-length") ?? 0) > MAX_BYTES) {
    return Response.json({ error: "That feed is too large to import." }, { status: 413 });
  }
  const xml = (await res.text()).slice(0, MAX_BYTES);
  if (!/<rss[\s>]|<channel[\s>]/i.test(xml)) {
    return Response.json({ error: "That address isn't an RSS feed." }, { status: 422 });
  }
  return Response.json(parseRss(xml));
}
