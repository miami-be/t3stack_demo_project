"use client";
import { useEffect, useState } from "react";
import type { MeasurementUnit, Ingredient } from "@prisma/client";

// NOTE: In a real app, you would fetch data via API routes, not import Prisma directly in a Next.js page.
// For demo purposes, this is simplified. In production, use API routes or server actions for DB access.

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IngredientWithUnit[]>([]);
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [form, setForm] = useState<Partial<IngredientWithUnit>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/ingredients").then(async res => setIngredients(await res.json() as IngredientWithUnit[]));
    void fetch("/api/measurement-units").then(async res => setUnits(await res.json() as MeasurementUnit[]));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const response = await fetch("/api/ingredients" + (editingId ? `/${editingId}` : ""), {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await response.json();
    setForm({});
    setEditingId(null);
    const ingredientsResponse = await fetch("/api/ingredients");
    setIngredients(await ingredientsResponse.json() as IngredientWithUnit[]);
  }

  function handleEdit(ingredient: IngredientWithUnit) {
    setForm(ingredient);
    setEditingId(ingredient.id);
  }

  function handleDelete(id: string) {
    void fetch(`/api/ingredients/${id}`, { method: "DELETE" })
      .then(() => void fetch("/api/ingredients").then(async res => setIngredients(await res.json() as IngredientWithUnit[])));

  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ingredients</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          name="name"
          placeholder="Name"
          value={form.name ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="quantity"
          placeholder="Quantity"
          type="number"
          value={form.quantity ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="cost"
          placeholder="Cost"
          type="number"
          value={form.cost ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <input
          name="supplierId"
          placeholder="Supplier ID"
          value={form.supplierId ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <select
          name="measurementUnitId"
          value={form.measurementUnitId ?? ""}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">Select unit</option>
          {units.map(u => (
            <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Add"} Ingredient
        </button>
        {editingId && (
          <button type="button" className="ml-2 px-4 py-2 rounded border" onClick={() => { setForm({}); setEditingId(null); }}>
            Cancel
          </button>
        )}
      </form>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Cost</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map(ingredient => (
            <tr key={ingredient.id}>
              <td className="border p-2">{ingredient.name}</td>
              <td className="border p-2">{ingredient.quantity}</td>
              <td className="border p-2">{ingredient.measurementUnit?.name} ({ingredient.measurementUnit?.code})</td>
              <td className="border p-2">{ingredient.cost}</td>
              <td className="border p-2">{ingredient.supplierId}</td>
              <td className="border p-2">
                <button className="mr-2 text-blue-600" onClick={() => handleEdit(ingredient)}>Edit</button>
                <button className="text-red-600" onClick={() => handleDelete(ingredient.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Type for ingredient with measurement unit populated
interface IngredientWithUnit extends Ingredient {
  measurementUnit?: MeasurementUnit;
}
