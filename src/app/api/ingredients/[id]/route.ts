import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT: Update ingredient
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const ingredient = await prisma.ingredient.update({
    where: { id: params.id },
    data: {
      name: data.name,
      quantity: Number(data.quantity),
      cost: Number(data.cost),
      supplier: data.supplier,
      measurementUnitId: data.measurementUnitId,
    },
    include: { measurementUnit: true },
  });
  return NextResponse.json(ingredient);
}

// DELETE: Delete ingredient
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.ingredient.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
