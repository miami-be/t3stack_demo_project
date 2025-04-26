"use client";
import { useEffect, useState } from "react";

interface Meal {
  id: string;
  name: string;
  description: string;
  recipe: string;
  price: number;
  photoURL?: string;
  ingredients: { id: string; quantity: number; ingredient: { id: string; name: string; measurementUnitId: string } }[];
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showForm, setShowForm] = useState(false); // Now used for meal creation modal
  const [form, setForm] = useState({ name: '', description: '', recipe: '', price: '', photoURL: '' });
  const [editMealId, setEditMealId] = useState<string | null>(null);
  const [ingredientOptions, setIngredientOptions] = useState<IngredientWithUnit[]>([]);
  const [mealIngredients, setMealIngredients] = useState<{ ingredientId: string; quantity: string }[]>([]);

  interface IngredientWithUnit {
    id: string;
    name: string;
    measurementUnit?: { name: string; code: string };
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchMeals(); // Use void to explicitly ignore the returned promise
  }, []);

  async function fetchMeals() {
    const res = await fetch("/api/meals");
    const data: unknown = await res.json();
    if (Array.isArray(data)) {
      setMeals(data);
    } else {
      setMeals([]);
      // Optionally show error: data.error
      // You can add an error state here if you want to display API errors
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meals</h1>
      {selectedMeal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Meal Details</h2>
            <div className="mb-4">
              <div className="font-bold">{selectedMeal.name}</div>
              <div className="text-gray-700 mb-2">{selectedMeal.description}</div>
              <div className="mb-2">Price: <span className="font-mono">${selectedMeal.price.toFixed(2)}</span></div>
              {selectedMeal.photoURL && (
                <img src={selectedMeal.photoURL} alt={selectedMeal.name} className="w-full h-40 object-cover rounded mb-2" />
              )}
              <div className="mb-2">Recipe: <span className="font-mono">{selectedMeal.recipe}</span></div>
              <div className="mb-2">
                <span className="font-semibold">Ingredients:</span>
                <ul className="list-disc ml-6">
                  {selectedMeal.ingredients.map((mi) => (
                    <li key={mi.id}>{mi.ingredient.name} ({mi.quantity})</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                onClick={async () => {
                  // Pre-fill form and mealIngredients for editing
                  setForm({
                    name: selectedMeal.name,
                    description: selectedMeal.description,
                    recipe: selectedMeal.recipe,
                    price: String(selectedMeal.price),
                    photoURL: (selectedMeal as any).photoURL ?? '',
                  });
                  setMealIngredients(selectedMeal.ingredients.map(mi => ({ ingredientId: mi.ingredient.id, quantity: String(mi.quantity) })));
                  setEditMealId(selectedMeal.id);
                  setShowForm(true);
                  setSelectedMeal(null);
                  // Fetch ingredients for dropdown
                  try {
                    const res = await fetch('/api/ingredients');
                    const data: unknown = await res.json();
                    function isIngredientArray(arr: unknown): arr is IngredientWithUnit[] {
                      return Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null && 'id' in item && 'name' in item);
                    }
                    if (isIngredientArray(data)) {
                      setIngredientOptions(data);
                    } else {
                      setIngredientOptions([]);
                    }
                  } catch {
                    setIngredientOptions([]);
                  }
                }}
              >Edit</button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  if (window.confirm('Are you sure you want to delete this meal?')) {
                    setLoading(true);
                    setError(null);
                    try {
                      const res = await fetch(`/api/meals?id=${selectedMeal.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Failed to delete meal');
                      setSelectedMeal(null);
                      void fetchMeals();
                    } catch (err) {
                      setError('Failed to delete meal');
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
              >Delete</button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => setSelectedMeal(null)}
              >Close</button>
            </div>
          </div>
        </div>
      )}
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={async () => {
          setShowForm(true);
          // Fetch ingredients only when opening the modal
          try {
            const res = await fetch('/api/ingredients');
            const data: unknown = await res.json();
            function isIngredientArray(arr: unknown): arr is IngredientWithUnit[] {
              return Array.isArray(arr) && arr.every(item => typeof item === 'object' && item !== null && 'id' in item && 'name' in item);
            }
            if (isIngredientArray(data)) {
              setIngredientOptions(data);
            } else {
              setIngredientOptions([]);
            }
          } catch {
            setIngredientOptions([]);
          }
          setMealIngredients([]);
        }}
      >
        Add Meal
      </button>
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">{editMealId ? 'Edit Meal' : 'Add Meal'}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError(null);
                try {
                  let res;
                  if (editMealId) {
                    // Edit mode
                    res = await fetch(`/api/meals?id=${editMealId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: form.name,
                        description: form.description,
                        recipe: form.recipe,
                        price: Number(form.price),
                        photoURL: form.photoURL,
                        ingredients: mealIngredients.map(i => ({
                          ingredientId: i.ingredientId,
                          quantity: Number(i.quantity)
                        })),
                      }),
                    });
                  } else {
                    // Add mode
                    res = await fetch('/api/meals', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: form.name,
                        description: form.description,
                        recipe: form.recipe,
                        price: Number(form.price),
                        photoURL: form.photoURL,
                        ingredients: mealIngredients.map(i => ({
                          ingredientId: i.ingredientId,
                          quantity: Number(i.quantity)
                        })),
                      }),
                    });
                  }
                  if (!res.ok) throw new Error(editMealId ? 'Failed to update meal' : 'Failed to add meal');
                  setShowForm(false);
                  setForm({ name: '', description: '', recipe: '', price: '', photoURL: '' });
                  setMealIngredients([]);
                  setEditMealId(null);
                  void fetchMeals();
                } catch (err) {
                  setError(editMealId ? 'Failed to update meal' : 'Failed to add meal');
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-3"
            >
              <input
                className="border p-2 rounded w-full"
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Recipe"
                value={form.recipe}
                onChange={e => setForm(f => ({ ...f, recipe: e.target.value }))}
                required
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                required
              />
              <input
                className="border p-2 rounded w-full"
                placeholder="Photo URL (optional)"
                value={form.photoURL}
                onChange={e => setForm(f => ({ ...f, photoURL: e.target.value }))}
              />
              {/* Ingredients Section */}
              <div>
                <div className="font-semibold mb-1">Ingredients</div>
                {mealIngredients.map((mi, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <select
                      className="border p-2 rounded flex-1"
                      value={mi.ingredientId}
                      onChange={e => {
                        const newIngredients = [...mealIngredients];
                        if (newIngredients[idx]) {
                          newIngredients[idx].ingredientId = e.target.value;
                          setMealIngredients(newIngredients);
                        }
                      }}
                      required
                    >
                      <option value="">Select ingredient</option>
                      {ingredientOptions?.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.name} {i.measurementUnit ? `(${i.measurementUnit.name})` : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border p-2 rounded w-24"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Quantity"
                      value={mi.quantity ?? ''}
                      onChange={e => {
                        const newIngredients = [...mealIngredients];
                        if (newIngredients[idx]) {
                          newIngredients[idx].quantity = e.target.value;
                          setMealIngredients(newIngredients);
                        }
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="text-red-600 px-2"
                      onClick={() => setMealIngredients(mealIngredients.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="bg-green-600 text-white px-2 py-1 rounded"
                  onClick={() => setMealIngredients([...mealIngredients, { ingredientId: '', quantity: '' }])}
                >
                  Add Ingredient
                </button>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ul className="divide-y divide-gray-200">
        {meals.map((meal) => (
          <li key={meal.id} className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setSelectedMeal(meal)}>
            <span className="flex items-center gap-2">
              {('photoURL' in meal && meal.photoURL) && (
                <img src={meal.photoURL} alt={meal.name} className="w-12 h-12 object-cover rounded" />
              )}
              <span className="font-semibold">{meal.name}</span> <span className="text-gray-500">({meal.description})</span>
            </span>
            <span className="font-mono">${meal.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      {/* Meal details modal and form to be implemented next */}
    </div>
  );
}
