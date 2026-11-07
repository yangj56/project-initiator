import "server-only";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env";

import type { StorageAdapter } from "./types";

const PUT_TTL_SECONDS = 60 * 10;
const GET_TTL_SECONDS = 60 * 60;

let client: S3Client | null = null;

function getClient() {
  if (!env.S3_BUCKET) throw new Error("S3 storage is not configured.");
  if (!client) {
    client = new S3Client({
      region: env.S3_REGION ?? "us-east-1",
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: Boolean(env.S3_ENDPOINT),
      credentials:
        env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.S3_ACCESS_KEY_ID,
              secretAccessKey: env.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }
  return client;
}

export function s3ObjectKey(storageKey: string) {
  const prefix = env.S3_KEY_PREFIX?.replace(/\/+$/, "");
  return prefix ? `${prefix}/${storageKey}` : storageKey;
}

export const s3StorageAdapter: StorageAdapter = {
  driver: "s3",

  async presignPut({ storageKey, contentType }) {
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: s3ObjectKey(storageKey),
      ContentType: contentType,
    });
    return {
      uploadUrl: await getSignedUrl(getClient(), command, { expiresIn: PUT_TTL_SECONDS }),
    };
  },

  async presignGet({ storageKey }) {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: s3ObjectKey(storageKey),
    });
    return {
      url: await getSignedUrl(getClient(), command, { expiresIn: GET_TTL_SECONDS }),
    };
  },

  async peek({ storageKey, byteCount }) {
    try {
      const res = await getClient().send(
        new GetObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: s3ObjectKey(storageKey),
          Range: `bytes=0-${Math.max(byteCount, 1) - 1}`,
        }),
      );
      if (!res.Body) return null;
      return await res.Body.transformToByteArray();
    } catch {
      return null;
    }
  },

  async read({ storageKey }) {
    try {
      const res = await getClient().send(
        new GetObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: s3ObjectKey(storageKey),
        }),
      );
      if (!res.Body) return null;
      return await res.Body.transformToByteArray();
    } catch {
      return null;
    }
  },

  async remove({ storageKey }) {
    await getClient().send(
      new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: s3ObjectKey(storageKey),
      }),
    );
  },
};
