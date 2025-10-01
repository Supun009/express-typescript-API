/*
  Warnings:

  - You are about to drop the column `isVeryfies` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "isVeryfies",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVeryfied" BOOLEAN NOT NULL DEFAULT false;
