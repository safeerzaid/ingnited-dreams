import {
  AccessToken,
  RoomServiceClient,
  EgressClient,
  WebhookReceiver,
  EncodedFileOutput,
  EncodingOptionsPreset,
} from "livekit-server-sdk";
import { config } from "../config";
import { logger } from "../utils/logger";
import { Role } from "../types/enums";
import { ServiceUnavailableError } from "../utils/errors";

export interface CreateTokenParams {
  roomName: string;
  participantIdentity: string;
  participantName: string;
  role: Role;
  classSessionId: string;
}

export class LiveKitService {
  private roomService: RoomServiceClient;
  private egressClient: EgressClient;
  private webhookReceiver: WebhookReceiver;
  readonly isConfigured: boolean;
  private httpUrl: string;

  constructor() {
    this.isConfigured = Boolean(
      config.livekit.apiKey &&
      config.livekit.apiSecret &&
      config.livekit.url &&
      !config.livekit.url.includes("example.com")
    );

    // Server SDK talks HTTPS; browsers connect over WSS. Accept either form in LIVEKIT_URL.
    this.httpUrl = config.livekit.url.replace(/^ws(s?):\/\//, "http$1://");

    this.roomService = new RoomServiceClient(
      this.httpUrl,
      config.livekit.apiKey,
      config.livekit.apiSecret
    );

    this.egressClient = new EgressClient(
      this.httpUrl,
      config.livekit.apiKey,
      config.livekit.apiSecret
    );

    this.webhookReceiver = new WebhookReceiver(
      config.livekit.apiKey,
      config.livekit.apiSecret
    );

    if (this.isConfigured) {
      logger.info(`LiveKit Service initialized with endpoint: ${config.livekit.url}`);
    } else {
      logger.warn(
        "LiveKit is not configured (LIVEKIT_URL/LIVEKIT_API_KEY/LIVEKIT_API_SECRET). Live classrooms are disabled."
      );
    }
  }

  /** WebSocket URL the browser should connect to */
  get clientUrl(): string {
    return config.livekit.url.replace(/^http(s?):\/\//, "ws$1://");
  }

  /**
   * Generates a signed participant token with role-based permissions
   */
  async createParticipantToken(params: CreateTokenParams): Promise<string> {
    if (!this.isConfigured) {
      throw new ServiceUnavailableError("The live classroom service is not configured yet. Please contact the academy.");
    }

    const { roomName, participantIdentity, participantName, role, classSessionId } = params;

    const isInstructorOrAdmin = role === Role.INSTRUCTOR || role === Role.ADMIN;

    const token = new AccessToken(config.livekit.apiKey, config.livekit.apiSecret, {
      identity: participantIdentity,
      name: participantName,
      metadata: JSON.stringify({
        role,
        classSessionId,
      }),
      ttl: "4h", // Class sessions valid up to 4 hours
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true, // For live classroom chat
      canUpdateOwnMetadata: true,
      roomAdmin: isInstructorOrAdmin,
      roomRecord: isInstructorOrAdmin,
    });

    const jwt = await token.toJwt();
    logger.info(`Generated LiveKit token for user: ${participantIdentity} (role: ${role}) in room: ${roomName}`);
    return jwt;
  }

  /**
   * Starts room composite recording using LiveKit Egress (720p 30fps MP4) to Cloudflare R2
   */
  async startRoomRecording(
    roomName: string,
    storageKey: string
  ): Promise<string | null> {
    if (!this.isConfigured) {
      logger.error(`Cannot record room ${roomName}: LiveKit is not configured.`);
      return null;
    }
    if (!config.r2.accessKeyId || !config.r2.secretAccessKey || !(config.r2.endpoint || config.r2.accountId)) {
      logger.error(`Cannot record room ${roomName}: Cloudflare R2 storage is not configured.`);
      return null;
    }

    try {
      // Room composite egress needs the room to exist; create it ahead of the instructor joining
      await this.ensureRoom(roomName);

      // 720p 30fps composite classroom recording to Cloudflare R2
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileOutput: any = {
        filepath: storageKey,
        output: {
          case: "s3",
          value: {
            accessKey: config.r2.accessKeyId,
            secret: config.r2.secretAccessKey,
            bucket: config.r2.bucketName,
            endpoint:
              config.r2.endpoint ||
              `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
            region: "auto",
            forcePathStyle: true,
          },
        },
      };

      const info = await this.egressClient.startRoomCompositeEgress(
        roomName,
        {
          file: fileOutput,
        },
        {
          layout: "speaker",
          encodingOptions: EncodingOptionsPreset.H264_720P_30,
        }
      );

      logger.info(`LiveKit Egress started successfully. EgressId: ${info.egressId} for room: ${roomName}`);
      return info.egressId;
    } catch (error) {
      logger.error(`Failed to start LiveKit room egress for room: ${roomName}`, error);
      return null;
    }
  }

  /**
   * Stops an active egress recording
   */
  async stopRoomRecording(egressId: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      await this.egressClient.stopEgress(egressId);
      logger.info(`LiveKit Egress stopped: ${egressId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to stop LiveKit egress: ${egressId}`, error);
      return false;
    }
  }

  /**
   * Closes the room when the instructor ends the live class
   */
  async closeRoom(roomName: string): Promise<boolean> {
    if (!this.isConfigured) return false;

    try {
      await this.roomService.deleteRoom(roomName);
      logger.info(`LiveKit room closed: ${roomName}`);
      return true;
    } catch (error) {
      logger.warn(`Could not close LiveKit room ${roomName} (it may already have terminated):`, error);
      return false;
    }
  }

  /**
   * Creates the room if it does not exist yet (createRoom is idempotent on LiveKit)
   */
  async ensureRoom(roomName: string) {
    if (!this.isConfigured) return;
    await this.roomService.createRoom({
      name: roomName,
      emptyTimeout: config.livekit.emptyTimeout,
      maxParticipants: config.livekit.maxParticipants,
    });
  }

  /**
   * Validates and parses incoming webhook payload from LiveKit
   */
  async receiveWebhook(body: string, authHeader?: string) {
    if (!authHeader) {
      throw new Error("Missing LiveKit authorization header");
    }
    return this.webhookReceiver.receive(body, authHeader);
  }
}

export const livekitService = new LiveKitService();
export default livekitService;
