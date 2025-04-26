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
    type MealIngredientCreate = {
      ingredientId: string;
      quantity: number;
    };
    type MealCreate = {
      name: string;
      description: string;
      recipe: string;
      price: number;
      photoURL?: string;
      ingredients?: MealIngredientCreate[];
    };
    const data = (await req.json()) as MealCreate;
    const meal = await prisma.meal.create({
      data: {
        name: data.name,
        description: data.description,
        recipe: data.recipe,
        price: Number(data.price),
        photoURL: data.photoURL,
        ingredients: data.ingredients && data.ingredients.length > 0 ? {
          create: data.ingredients.map(i => ({
            ingredientId: i.ingredientId,
            quantity: i.quantity,
          })),
        } : undefined,
      },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });
    return NextResponse.json(meal);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PUT: Update a meal by ID
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url!);
    const mealId = url.searchParams.get('id');
    if (!mealId) return NextResponse.json({ error: 'Missing meal ID' }, { status: 400 });
    type MealIngredientUpdate = { ingredientId: string; quantity: number };
    type MealUpdate = {
      name?: string;
      description?: string;
      recipe?: string;
      price?: number;
      photoURL?: string;
      ingredients?: MealIngredientUpdate[];
    };
    const data = (await req.json()) as MealUpdate;
    // Update meal fields
    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        name: data.name,
        description: data.description,
        recipe: data.recipe,
        price: data.price,
        photoURL: data.photoURL,
      },
      include: {
        ingredients: { include: { ingredient: true } },
      },
    });
    // If ingredients provided, update them (delete old, add new)
    if (data.ingredients) {
      // Remove all existing ingredients for this meal
      await prisma.mealIngredient.deleteMany({ where: { mealId } });
      // Add new ingredients
      await prisma.meal.update({
        where: { id: mealId },
        data: {
          ingredients: {
            create: data.ingredients.map(i => ({ ingredientId: i.ingredientId, quantity: i.quantity })),
          },
        },
      });
    }
    // Return updated meal (with fresh ingredients)
    const mealWithIngredients = await prisma.meal.findUnique({
      where: { id: mealId },
      include: { ingredients: { include: { ingredient: true } } },
    });
    return NextResponse.json(mealWithIngredients);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
// DELETE: Remove a meal by ID
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url!);
    const mealId = url.searchParams.get('id');
    if (!mealId) return NextResponse.json({ error: 'Missing meal ID' }, { status: 400 });
    // Delete meal (and cascade deletes mealIngredients)
    await prisma.meal.delete({ where: { id: mealId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
