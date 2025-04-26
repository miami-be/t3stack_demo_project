import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

// GET /api/suppliers - List all suppliers
export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers", details: String(error) }, { status: 500 });
  }
}

// POST /api/suppliers - Create a new supplier
export async function POST(req: NextRequest) {
  try {
    type SupplierCreate = {
      name: string;
      contactName: string;
      contactPhone: string;
    };
    const data = (await req.json()) as SupplierCreate;
    const { name, contactName, contactPhone } = data;
    if (!name || !contactName || !contactPhone) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    const supplier = await db.supplier.create({
      data: { name, contactName, contactPhone },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.error("POST /api/suppliers error:", error);
    return NextResponse.json({ error: "Failed to create supplier", details: String(error) }, { status: 500 });
  }
}

// PUT /api/suppliers/:id - Update a supplier (handled as a catch-all route for demo)
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    type SupplierUpdate = {
      name: string;
      contactName: string;
      contactPhone: string;
    };
    const data = (await req.json()) as SupplierUpdate | null;
    if (!id) {
      return NextResponse.json({ error: "Missing supplier id." }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: "Missing data." }, { status: 400 });
    }
    const { name, contactName, contactPhone } = data;
    const supplier = await db.supplier.update({
      where: { id },
      data: { name, contactName, contactPhone },
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.error("PUT /api/suppliers error:", error);
    return NextResponse.json({ error: "Failed to update supplier", details: String(error) }, { status: 500 });
  }
}
