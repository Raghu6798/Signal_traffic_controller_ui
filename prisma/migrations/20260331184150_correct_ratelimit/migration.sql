/*
  Warnings:

  - You are about to drop the column `createdAt` on the `RateLimit` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `RateLimit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RateLimit` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `RateLimit` table. All the data in the column will be lost.
  - Added the required column `count` to the `RateLimit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastRequest` to the `RateLimit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RateLimit" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "updatedAt",
DROP COLUMN "value",
ADD COLUMN     "count" INTEGER NOT NULL,
ADD COLUMN     "lastRequest" BIGINT NOT NULL;
