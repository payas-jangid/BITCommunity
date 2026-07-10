import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import webhookRouter from "./routes/webhooks";
import { clerkMiddleware, getAuth } from "@clerk/express";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use("/api/webhooks", webhookRouter);

app.use(express.json());

// 1. Initialize Clerk globally across your Express application instance
app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || "",
    secretKey: process.env.CLERK_SECRET_KEY || "",
    debug: true,
  }),
);

// 2. Custom Authentication Guardian Middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);

  // If no active session ID exists in the token headers, reject immediately
  if (!auth || !auth.userId) {
    console.log(
      "🛑 Guardian Blocked: Request lacked a valid session signature.",
    );
    res
      .status(401)
      .json({ error: "Unauthorized access: Token missing or invalid" });
    return;
  }

  // Attach the authenticated Clerk ID to the request body metadata for route access
  (req as any).auth = auth;
  next();
};

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 BIT Community Server is running smoothly!");
});

// 3. Inject requireAuth to safely protect your Announcements endpoint
app.get(
  "/api/announcements",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const announcements = await prisma.announcements.findMany({
        include: {
          author: {
            select: { name: true, role: true, branch: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  },
);

app.get("/api/chatrooms", requireAuth, async (req, res) => {
  console.log("➡️ Executing GET /api/chatrooms route handler code logic...");
  try {
    console.log("📡 Reaching out to Postgres database via Prisma...");
    const rooms = await prisma.chatRoom.findMany();
    console.log(
      `📥 Successfully queried database! Found ${rooms.length} chatrooms.`,
    );
    res.json(rooms);
  } catch (error) {
    console.error("💥 CRITICAL DATABASE CRASH inside /api/chatrooms route:");
    console.error(error);
    console.error(JSON.stringify(error, null, 2));
    res.status(500).json({ error: "Failed to fetch chatrooms" });
  }
});
app.get("/api/chatrooms/:roomId/messages", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        roomId: Number(roomId),
      },
      include: {
        sender: {
          select: { name: true, role: true, branch: true, ClerkId: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching room messages:", error);
    res.status(500).json({ error: "Failed to fetch message history" });
  }
});
app.get("/api/users/:clerkId", requireAuth, async (req, res) => {
  const { clerkId } = req.params;
  try {
    const userRecord = await prisma.user.findUnique({
      where: { ClerkId: clerkId },
    });

    res.json(userRecord);
  } catch (error) {
    console.log("unable to fetch profile");
  }
});

app.post(
  "/api/chatrooms/:roomId/messages",
  requireAuth,
  async (req: Request, res: Response) => {
    console.log("📥 RECEIVED A POST REQUEST to messages endpoint!");
    try {
      const { roomId } = req.params;
      const { content } = req.body;

      // Extract the verified identity directly from the secure middleware context
      const clerkId = (req as any).auth.userId;

      if (!content || !content.trim()) {
        res.status(400).json({ error: "Message content cannot be empty" });
        return;
      }
      console.log("🕵️ REAL CLERK ID TRYING TO SEND MESSAGE:", clerkId);
      // Look up the matching Postgres database profile row using the ClerkId
      const userProfile = await prisma.user.findUnique({
        where: { ClerkId: clerkId },
      });

      if (!userProfile) {
        res.status(404).json({ error: "User profile sync mismatch" });
        return;
      }

      const newMessage = await prisma.message.create({
        data: {
          content: content,
          roomId: Number(roomId),
          senderId: userProfile.id, // Binds the structural Postgres relational primary integer ID
        },
        include: {
          sender: {
            select: {
              name: true,
              role: true,
              branch: true,
              ClerkId: true,
            },
          },
        },
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  },
);

app.get("/api/chatrooms/:roomId", requireAuth, async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await prisma.chatRoom.findUnique({
      where: { id: Number(roomId) },
    });

    if (!room) {
      return res.status(404).json({ error: "Chatroom not found" });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: Number(roomId) },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            branch: true,
            ClerkId: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      room,
      messages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch chatroom details" });
  }
});

app.post("/api/users/:clerkId/update", requireAuth, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { IncomingName, branchName, roleName } = req.body;

    const tokenUserId = (req as any).auth.userId;
    if (clerkId !== tokenUserId) {
      return res
        .status(403)
        .json({ error: "Cannot edit someone else's profile" });
    }

    const updatedUser = await prisma.user.update({
      where:{ClerkId:clerkId},
      data:{
        name:IncomingName,
        branch:branchName,
        role:roleName,
      }
    });

    res.json(updatedUser);
    console.log("updated user");
  } catch (error) {
    console.log("failure in updating...",error);
    res.status(500).json({ error: "Failed to update profile in database" });
  }
});

app.post("/api/chatrooms", requireAuth, async (req, res) => {
  try {
    const { roomName, roomType } = req.body;

    if (!roomName || !roomName.trim()) {
      res.status(400).json({ error: "Chatroom name cannot be empty" });
      return;
    }

    const newRoom = await prisma.chatRoom.create({
      data: {
        name: roomName.trim(),
        description: roomType?.trim() || "No description provided.",
      },
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating chatroom:", error);
    res.status(500).json({ error: "Failed to create chatroom" });
  }
});

async function seedMockUser() {
  try {
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count in database: ${userCount}`);

    const existingUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    console.log("👥 Existing Database Users:", existingUsers);

    if (userCount === 0) {
      await prisma.user.create({
        data: {
          id: 1,
          name: "Payas Jangid",
          email: "payas@bitmesra.ac.in",
          ClerkId: "user_3G7SWPcm1FOzOlyJuCcUMJPpHLi",
          branch: "CSE",
          role: "STUDENT",
        },
      });
      console.log(
        "🌱 Created mock test user (ID: 1) with ClerkId in database.",
      );
    }
  } catch (err) {
    console.error("❌ Diagnostic tracking failed:", err);
  }
}

seedMockUser().then(() => {
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`📡 Server wide-open listening at ${PORT}`);
  });
});
