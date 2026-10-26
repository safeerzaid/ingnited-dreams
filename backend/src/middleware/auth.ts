import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { prisma } from "../services/prisma";
import { Role } from "../types/enums";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      rawBody?: Buffer; // captured by the JSON parser for webhook signature checks
    }
  }
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Try reading token from HTTP-only cookie first, fallback to Authorization Bearer header
    let token = req.cookies?.[config.auth.cookieName];
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new UnauthorizedError("Authentication token is missing. Please log in.");
    }

    // 2. Verify token
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, config.auth.jwtSecret) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedError("Session has expired or is invalid. Please log in again.");
    }

    if (!decoded.userId || !decoded.role) {
      throw new UnauthorizedError("Invalid token payload structure.");
    }

    // 3. Verify user in database to ensure account is still active and role hasn't changed
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (!user) {
      throw new UnauthorizedError("User account no longer exists.");
    }

    if (user.status !== "ACTIVE") {
      throw new ForbiddenError(`Your account is currently ${user.status.toLowerCase()}. Please contact administration.`);
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access restricted: requires one of [${allowedRoles.join(", ")}], but your role is ${req.user.role}.`
        )
      );
    }

    next();
  };
}
