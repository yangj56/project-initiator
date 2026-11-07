export function isSafeStorageKey(storageKey: string) {
  if (!storageKey || storageKey.includes("..")) return false;
  return /^[A-Za-z0-9._/-]+$/.test(storageKey);
}
