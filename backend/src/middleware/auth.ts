import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  auth?: ReturnType<typeof getAuth>;
  user?: {
    id: number;
    name: string;
    email: string;
    ClerkId: string;
    branch: string;
    role: string;
  };
}

// In verbatimModuleSyntax, you must explicitly declare functions as constants
// or named exports so the compiler doesn't misinterpret them as CommonJS values.
export const protectRoute = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const auth = getAuth(req);

  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized: Invalid or missing token." });
    return;
  }

  (req as AuthenticatedRequest).auth = auth;
  next();
};

export const attachUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      res.status(401).json({
        error: "Authentication failed. Missing identity token structure.",
      });
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { ClerkId: clerkUserId },
    });

    if (!dbUser) {
      res.status(404).json({
        error: "User identity verified, but campus database record is missing.",
      });
      return;
    }

    req.user = dbUser;
    next();
  } catch (error) {
    console.error("🔒 Auth Middleware Profile Sync Crash:", error);
    res.status(500).json({
      error: "Internal server error resolving student token mapping.",
    });
  }
};
