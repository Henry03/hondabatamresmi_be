/*
  Warnings:

  - You are about to drop the column `type` on the `Carousel` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Carousel` table. All the data in the column will be lost.
  - Added the required column `link` to the `Carousel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mediaType` to the `Carousel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mediaUrl` to the `Carousel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Carousel" DROP COLUMN "type",
DROP COLUMN "url",
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "mediaType" "MediaType" NOT NULL,
ADD COLUMN     "mediaUrl" TEXT NOT NULL;
