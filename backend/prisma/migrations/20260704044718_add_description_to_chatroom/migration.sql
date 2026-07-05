/*
  Warnings:

  - You are about to drop the column `type` on the `ChatRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Announcements" ADD CONSTRAINT "Announcements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "type",
ADD COLUMN     "description" TEXT,
ADD CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Message" ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
