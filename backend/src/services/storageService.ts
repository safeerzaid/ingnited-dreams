import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config";
import { logger } from "../utils/logger";
import { ServiceUnavailableError } from "../utils/errors";

export interface IStorageService {
  readonly isConfigured: boolean;
  getPlaybackUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getDownloadUrl(key: string, fileName: string, expiresInSeconds?: number, contentType?: string): Promise<string>;
  uploadObject(key: string, body: Buffer, contentType: string): Promise<void>;
  deleteObject(key: string): Promise<boolean>;
  checkObjectExists(key: string): Promise<boolean>;
}

class CloudflareR2StorageService implements IStorageService {
  private client: S3Client | null = null;
  private bucket: string;
  readonly isConfigured: boolean;

  constructor() {
    this.bucket = config.r2.bucketName;

    // Check if R2 credentials are provided
    if (
      (config.r2.accountId || config.r2.endpoint) &&
      config.r2.accessKeyId &&
      config.r2.secretAccessKey
    ) {
      const endpoint =
        config.r2.endpoint ||
        `https://${config.r2.accountId}.r2.cloudflarestorage.com`;

      this.client = new S3Client({
        region: "auto",
        endpoint,
        credentials: {
          accessKeyId: config.r2.accessKeyId,
          secretAccessKey: config.r2.secretAccessKey,
        },
      });
      this.isConfigured = true;
      logger.info(`Cloudflare R2 Storage initialized for bucket: ${this.bucket}`);
    } else {
      this.isConfigured = false;
      logger.warn(
        "Cloudflare R2 credentials not configured (R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY). Recording playback, downloads and library uploads are disabled."
      );
    }
  }

  private requireClient(): S3Client {
    if (!this.client) {
      throw new ServiceUnavailableError("File storage (Cloudflare R2) is not configured yet. Please contact the academy.");
    }
    return this.client;
  }

  /**
   * Generates a short-lived signed URL for student playback (e.g., valid for 15 minutes)
   */
  async getPlaybackUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const client = this.requireClient();

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      logger.error(`Failed to generate signed playback URL for key ${key}`, error);
      throw error;
    }
  }

  /**
   * Generates a short-lived signed URL for downloading with Content-Disposition attachment header
   */
  async getDownloadUrl(
    key: string,
    fileName: string,
    expiresInSeconds = 300,
    contentType = "video/mp4"
  ): Promise<string> {
    const client = this.requireClient();

    try {
      const safeFilename = fileName.replace(/[^a-zA-Z0-9_.-]/g, "_");
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${safeFilename}"`,
        ResponseContentType: contentType,
      });

      return await getSignedUrl(client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      logger.error(`Failed to generate download URL for key ${key}`, error);
      throw error;
    }
  }

  /**
   * Uploads a file (used for library PDFs/handbooks uploaded by admins)
   */
  async uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
    const client = this.requireClient();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
    logger.info(`Uploaded R2 object: ${key} (${body.length} bytes)`);
  }

  /**
   * Deletes an object from Cloudflare R2
   */
  async deleteObject(key: string): Promise<boolean> {
    const client = this.requireClient();

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await client.send(command);
      logger.info(`Successfully deleted R2 object: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete R2 object: ${key}`, error);
      throw error;
    }
  }

  /**
   * Verifies if an object exists in Cloudflare R2
   */
  async checkObjectExists(key: string): Promise<boolean> {
    const client = this.requireClient();

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new CloudflareR2StorageService();
export default storageService;
