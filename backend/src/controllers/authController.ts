import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator";
import { sendSuccess } from "../utils/apiResponse";
import { config } from "../config";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      // Set HTTP-only secure cookie
      res.cookie(config.auth.cookieName, result.token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "lax",
        maxAge: config.auth.cookieMaxAge,
      });

      // Token travels only in the HTTP-only cookie, never in the JSON body
      return sendSuccess(res, { user: result.user }, "Account registered successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      // Set HTTP-only secure cookie
      res.cookie(config.auth.cookieName, result.token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "lax",
        maxAge: config.auth.cookieMaxAge,
      });

      return sendSuccess(res, { user: result.user }, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie(config.auth.cookieName, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "lax",
      });

      return sendSuccess(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      await authService.requestPasswordReset(email);
      return sendSuccess(res, null, "If an account exists for this email, a reset link has been sent.");
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, newPassword);
      return sendSuccess(res, null, "Password updated. You can now log in.");
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.user!.id, currentPassword, newPassword);
      return sendSuccess(res, null, "Password changed successfully.");
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthenticated" });
      }

      const user = await authService.getMe(req.user.id);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
export default authController;
