import { mkdir, open, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { isSafeStorageKey } from "./key";
import type { StorageAdapter } from "./types";

export const LOCAL_UPLOADS_DIR = path.join(process.cwd(), ".data/uploads");

export function resolveLocalPath(storageKey: string) {
  if (!isSafeStorageKey(storageKey)) return null;
  const root = path.resolve(LOCAL_UPLOADS_DIR);
  const resolved = path.resolve(root, storageKey);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) return null;
  return resolved;
}

export async function writeLocalObject(args: { storageKey: string; bytes: Uint8Array }) {
  const dest = resolveLocalPath(args.storageKey);
  if (!dest) throw new Error("Invalid storage key.");
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, args.bytes);
}

async function readPrefix(storageKey: string, byteCount: number) {
  const dest = resolveLocalPath(storageKey);
  if (!dest || byteCount < 1) return null;
  try {
    const handle = await open(dest, "r");
    try {
      const buf = Buffer.alloc(byteCount);
      const { bytesRead } = await handle.read(buf, 0, byteCount, 0);
      return bytesRead === 0 ? null : new Uint8Array(buf.subarray(0, bytesRead));
    } finally {
      await handle.close();
    }
  } catch {
    return null;
  }
}

export const localStorageAdapter: StorageAdapter = {
  driver: "local",

  async presignPut() {
    throw new Error("Local storage has no presigned upload URL. Write bytes with writeLocalObject.");
  },

  async presignGet() {
    throw new Error("Local storage has no presigned download URL. Read bytes with the local adapter.");
  },

  peek({ storageKey, byteCount }) {
    return readPrefix(storageKey, byteCount);
  },

  async read({ storageKey }) {
    const dest = resolveLocalPath(storageKey);
    if (!dest) return null;
    try {
      return new Uint8Array(await readFile(dest));
    } catch {
      return null;
    }
  },

  async remove({ storageKey }) {
    const dest = resolveLocalPath(storageKey);
    if (!dest) return;
    try {
      await unlink(dest);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return;
      throw error;
    }
  },
};
