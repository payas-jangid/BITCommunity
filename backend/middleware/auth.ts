import { createClerkClient, verifyToken } from "@clerk/backend";
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    ClerkId: string;
    branch: string;
    role: string;
  };
}

const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Access Denied. Missing authentication token." });
    }

    const token = authHeader.split(" ")[1];

    const verifiedSession = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!verifiedSession) {
      return res.status(401).json({
        error: "Authentication failed. Session expired or invalid.",
      });
    }

    const ClerkUserId = verifiedSession.sub;

    const dbUser = await prisma.user.findUnique({
      where: { ClerkId: ClerkUserId },
    });

    if (!dbUser) {
      return res.status(404).json({
        error: "User identity verified, but campus profile record is missing.",
      });
    }

    req.user = dbUser;

    next();
  } catch (error) {
    console.error("🔒 Auth Middleware Verification Crash:", error);
    return res.status(401).json({ error: "Authentication checkpoint failed." });
  }
};

module.exports = {
  requireAuth,
};