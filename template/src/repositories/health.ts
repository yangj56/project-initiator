import "server-only";

export async function readHealth(input: { echo?: string }) {
  return { status: "ok" as const, echo: input.echo ?? null };
}
