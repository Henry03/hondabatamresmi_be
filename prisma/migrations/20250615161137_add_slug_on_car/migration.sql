/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Car` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Car_slug_key" ON "Car"("slug");
