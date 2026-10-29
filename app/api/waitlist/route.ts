import { parseWaitlistEntry } from "@/lib/waitlist";

// Takes sign-ups from the coming-soon page. There is no database yet, so each
// sign-up is posted as JSON to WAITLIST_WEBHOOK_URL (a Google Sheets Apps
// Script, Zapier or Make hook) when that is set, and always logged.

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Something went wrong sending the form. Try again." }, { status: 400 });
  }
  const parsed = parseWaitlistEntry(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const signup = { ...parsed.entry, joinedAt: new Date().toISOString() };
  console.log("waitlist signup", JSON.stringify(signup));

  const hook = process.env.WAITLIST_WEBHOOK_URL;
  if (hook) {
    try {
      const res = await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(signup) });
      if (!res.ok) throw new Error(`webhook answered ${res.status}`);
    } catch (e) {
      console.error("waitlist webhook failed", e);
      return Response.json({ error: "We couldn't save that just now. Try again in a minute." }, { status: 502 });
    }
  }
  return Response.json({ ok: true });
}
