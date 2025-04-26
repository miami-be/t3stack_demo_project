/*
  Warnings:

  - You are about to drop the column `supplier` on the `Ingredient` table. All the data in the column will be lost.
  - Added the required column `supplierId` to the `Ingredient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: add supplierId as nullable for now
ALTER TABLE "Ingredient" ADD COLUMN "supplierId" TEXT;

-- Remove supplier column after assignment
-- (will drop after updating supplierId)
-- ALTER TABLE "Ingredient" DROP COLUMN "supplier";

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- Insert 3 suppliers
INSERT INTO "Supplier" ("id", "name", "contactName", "contactPhone", "createdAt", "updatedAt") VALUES
  ('meat-supplier-id', 'Meat Supplier', 'Ivan Meat', '+1234567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('meal-supplier-id', 'Meal Supplier', 'Anna Meal', '+1234567891', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('grocery-supplier-id', 'Grocery Supplier', 'Sergey Grocery', '+1234567892', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign all existing ingredients to Grocery Supplier by default
UPDATE "Ingredient" SET "supplierId" = 'grocery-supplier-id';

-- Set supplierId as NOT NULL
ALTER TABLE "Ingredient" ALTER COLUMN "supplierId" SET NOT NULL;

-- Remove old supplier column
ALTER TABLE "Ingredient" DROP COLUMN "supplier";

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
