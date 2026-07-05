import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 BIT Community Server is running smoothly!");
});

app.get("/api/announcements", async (req: Request, res: Response) => {
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
});

app.get("/api/chatrooms", async (req, res) => {
  try {
    const rooms = await prisma.chatRoom.findMany();
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching chatrooms:", error);
    res.status(500).json({ error: "Failed to fetch chatrooms" });
  }
});

app.get("/api/chatrooms/:roomId/messages", async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        roomId: Number(roomId),
      },
      include: {
        sender: {
          select: { name: true, role: true, branch: true },
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

app.post("/api/chatrooms/:roomId/messages", async (req, res) => {
  console.log("📥 RECEIVED A POST REQUEST to messages endpoint!"); // 🎯 Add this log!
  console.log("Body payload:", req.body);
  console.log("Params:", req.params);
  try {
    const { roomId } = req.params;
    const { content, senderId } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "Message content cannot be empty" });
      return;
    }

    const newMessage = await prisma.message.create({
      data: {
        content: content,
        roomId: Number(roomId),
        senderId: Number(senderId),
      },
      include: {
        sender: {
          select: {
            name: true,
            role: true,
            branch: true,
          },
        },
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

async function seedMockUser() {
  try {
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count in database: ${userCount}`);

    // Fetch and log the users that already exist
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
          ClerkId: "mock_clerk_id_123",
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

app.get("/api/chatrooms/:roomId", async (req, res) => {
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

app.post("/api/chatrooms",async (req,res) => {
  try {
    const {roomName,roomType} = req.body;

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
  };
});

seedMockUser().then(() => {
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`📡 Server listening at http://localhost:${PORT}`);
  });
});
