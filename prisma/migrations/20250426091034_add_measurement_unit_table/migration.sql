-- CreateTable
CREATE TABLE "MeasurementUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "MeasurementUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "measurementUnitId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "supplier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementUnit_name_key" ON "MeasurementUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementUnit_code_key" ON "MeasurementUnit"("code");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_measurementUnitId_fkey" FOREIGN KEY ("measurementUnitId") REFERENCES "MeasurementUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
