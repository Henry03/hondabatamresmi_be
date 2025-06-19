/*
  Warnings:

  - You are about to drop the column `description` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Promo` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Promo` table. All the data in the column will be lost.
  - Added the required column `mediaType` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mediaUrl` to the `Promo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Promo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Promo" DROP COLUMN "description",
DROP COLUMN "imageUrl",
DROP COLUMN "isActive",
DROP COLUMN "title",
ADD COLUMN     "mediaType" "MediaType" NOT NULL,
ADD COLUMN     "mediaUrl" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
