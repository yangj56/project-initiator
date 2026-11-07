import { NextResponse } from "next/server";

import { getHealth } from "@/app/actions/health/queries";

export async function GET(req: Request) {
  const echo = new URL(req.url).searchParams.get("echo");
  const result = await getHealth(echo === null ? {} : { echo });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ status: result.status, echo: result.echo });
}
