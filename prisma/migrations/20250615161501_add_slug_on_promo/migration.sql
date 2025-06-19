/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Promo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Promo" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Promo_slug_key" ON "Promo"("slug");
