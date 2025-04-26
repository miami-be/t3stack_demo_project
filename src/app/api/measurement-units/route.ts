import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all measurement units
export async function GET() {
  const units = await prisma.measurementUnit.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(units);
}
