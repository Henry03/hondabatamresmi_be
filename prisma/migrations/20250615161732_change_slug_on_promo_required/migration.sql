/*
  Warnings:

  - Made the column `slug` on table `Promo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Promo" ALTER COLUMN "slug" SET NOT NULL;
