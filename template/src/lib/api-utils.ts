import { NextResponse } from "next/server";

export async function parseJsonBody(
  req: Request,
): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    const body: unknown = await req.json();
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }),
    };
  }
}
