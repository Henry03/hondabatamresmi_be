/*
  Warnings:

  - Added the required column `name` to the `Carousel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Carousel" ADD COLUMN     "name" TEXT NOT NULL;
