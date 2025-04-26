import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT: Update ingredient
type IngredientUpdate = {
  name: string;
  quantity: number;
  cost: number;
  supplierId: string;
  measurementUnitId: string;
};

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  const data = (await req.json()) as IngredientUpdate;
  const ingredient = await prisma.ingredient.update({
    where: { id },
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

// DELETE: Delete ingredient
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  await prisma.ingredient.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
