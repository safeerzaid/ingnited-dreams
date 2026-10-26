import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import { config } from "../config";
import { BadRequestError, UnauthorizedError, ConflictError, ServiceUnavailableError } from "../utils/errors";
import { Role } from "../types/enums";
import { emailService } from "./emailService";
import { logger } from "../utils/logger";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: { id: string; email: string; name: string; role: Role | string }): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.auth.jwtSecret,
      { expiresIn: "7d" }
    );
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    registrationNumber?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError("An account with this email address already exists.");
    }

    const passwordHash = await this.hashPassword(data.password);
    const regNum =
      data.registrationNumber ||
      `ID-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: Role.STUDENT,
        studentProfile: {
          create: {
            registrationNumber: regNum,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        registrationNumber: user.studentProfile?.registrationNumber,
      },
      token,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        studentProfile: true,
        instructorProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isValid = await this.verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    if (user.status !== "ACTIVE") {
      throw new BadRequestError(`Your account is ${user.status.toLowerCase()}. Please contact administration.`);
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        studentProfile: user.studentProfile,
        instructorProfile: user.instructorProfile,
      },
      token,
    };
  }

  /**
   * Emails a single-use reset link. Response is identical whether or not the email exists.
   */
  async requestPasswordReset(email: string) {
    if (!emailService.isConfigured) {
      throw new ServiceUnavailableError("Password reset by email is not available right now. Please contact the academy office.");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE") {
      logger.info(`Password reset requested for unknown/inactive email: ${email}`);
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const link = `${config.cors.frontendUrl}/reset-password?token=${token}`;
    await emailService.send({
      to: user.email,
      subject: `Reset your ${config.academy.name} password`,
      text: [
        `Hi ${user.name},`,
        "",
        "We received a request to reset your password. Open the link below within 1 hour to choose a new one:",
        link,
        "",
        "If you did not request this, you can ignore this email.",
        "",
        `— ${config.academy.name}`,
      ].join("\n"),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestError("This reset link is invalid or has expired. Please request a new one.");
    }

    const passwordHash = await this.hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedError("User session not found.");

    const isValid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestError("Current password is incorrect.");

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.hashPassword(newPassword) },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        instructorProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User session not found.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      studentProfile: user.studentProfile,
      instructorProfile: user.instructorProfile,
    };
  }
}

export const authService = new AuthService();
export default authService;
