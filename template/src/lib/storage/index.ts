import "server-only";

import { env } from "@/env";

import { localStorageAdapter } from "./local";
import { s3StorageAdapter } from "./s3";
import type { StorageAdapter } from "./types";

export function getStorageAdapter(): StorageAdapter {
  if (env.STORAGE_DRIVER === "s3") return s3StorageAdapter;
  return localStorageAdapter;
}

export type { StorageAdapter } from "./types";
