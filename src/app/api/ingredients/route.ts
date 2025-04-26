import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all ingredients with measurement unit
export async function GET() {
  const ingredients = await prisma.ingredient.findMany({
    include: { measurementUnit: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(ingredients);
}

type IngredientCreate = {
  name: string;
  quantity: number;
  cost: number;
  supplierId: string;
  measurementUnitId: string;
};

// POST: Create a new ingredient
export async function POST(req: NextRequest) {
  const data = (await req.json()) as IngredientCreate;
  const ingredient = await prisma.ingredient.create({
    data: {
      name: data.name,
      quantity: Number(data.quantity),
      cost: Number(data.cost),
      supplierId: data.supplierId,
      measurementUnitId: data.measurementUnitId,
    },
    include: { measurementUnit: true },
  });
  return NextResponse.json(ingredient);
}
