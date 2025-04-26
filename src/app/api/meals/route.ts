import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all meals with ingredients
export async function GET() {
  try {
    const meals = await prisma.meal.findMany({
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(meals);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Create a new meal
export async function POST(req: Request) {
  try {
    type MealCreate = {
      name: string;
      description: string;
      recipe: string;
      price: number;
    };
    const data = (await req.json()) as MealCreate;
    const meal = await prisma.meal.create({
      data: {
        name: data.name,
        description: data.description,
        recipe: data.recipe,
        price: Number(data.price),
      },
    });
    return NextResponse.json(meal);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
