export type StoragePresignPutArgs = {
  readonly storageKey: string;
  readonly contentType: string;
};

export type StoragePresignPutResult = {
  readonly uploadUrl: string;
};

export type StorageAdapter = {
  readonly driver: "local" | "s3";
  presignPut(args: StoragePresignPutArgs): Promise<StoragePresignPutResult>;
  presignGet(args: { storageKey: string }): Promise<{ url: string }>;
  peek(args: { storageKey: string; byteCount: number }): Promise<Uint8Array | null>;
  read(args: { storageKey: string }): Promise<Uint8Array | null>;
  remove(args: { storageKey: string }): Promise<void>;
};
