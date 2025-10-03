/*
  Warnings:

  - You are about to drop the column `isVeryfied` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "isVeryfied",
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
