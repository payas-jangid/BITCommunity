import { Router, Request, Response } from "express";
import { Webhook } from "svix";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";

const router = Router();
const prisma = new PrismaClient();

// Grab the Webhook Secret from your Clerk Dashboard settings

router.post(
  "/clerk",
  bodyParser.raw({ type: "application/json" }), // Read the pristine, unparsed raw body byte stream
  async (req: Request, res: Response): Promise<void> => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error(
        "❌ CLERK_WEBHOOK_SECRET is missing from environmental configuration.",
      );
      res
        .status(500)
        .json({ error: "Server missing webhook verification keys." });
      return;
    } // Extract the cryptographic signature tracking headers from Clerk

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      res.status(400).json({ error: "Missing required verification headers." });
      return;
    }

    const payload = req.body.toString();
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: any;

    try {
      // Cryptographically verify the payload authenticity
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("❌ Webhook verification failed signature matching:", err);
      res
        .status(400)
        .json({ error: "Invalid signature verification payload." });
      return;
    } // Destructure event details

    const { id: clerkId, email_addresses, first_name, last_name } = evt.data;
    const eventType = evt.type;

    console.log(`📥 Received secure Clerk webhook event: ${eventType}`); // Handle user registration event

    if (eventType === "user.created") {
      const primaryEmail = email_addresses?.[0]?.email_address || "";
      const fullName =
        `${first_name || ""} ${last_name || ""}`.trim() || "Campus Student";

      try {
        // Sync straight to your Prisma database schema
        const newUser = await prisma.user.create({
          data: {
            ClerkId: clerkId,
            email: primaryEmail,
            name: fullName,
            branch: "Unassigned", // Fill out via an onboarding screen later
            role: "STUDENT",
          },
        });

        console.log(
          `✅ Student database record synchronized flawlessly for: ${newUser.email}`,
        );
      } catch (dbError) {
        console.error(
          "❌ Prisma database sync write execution crashed:",
          dbError,
        );
        res
          .status(500)
          .json({ error: "Failed to write user row to PostgreSQL." });
        return;
      }
    } // Acknowledge receipt back to Clerk's servers instantly

    res.status(200).json({ success: true });
  },
);

export default router;
