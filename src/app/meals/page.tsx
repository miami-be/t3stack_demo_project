"use client";
import { useEffect, useState } from "react";

interface Meal {
  id: string;
  name: string;
  description: string;
  recipe: string;
  price: number;
  ingredients: { id: string; quantity: number; ingredient: { id: string; name: string; measurementUnitId: string } }[];
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  // const [showForm, setShowForm] = useState(false); // Not used yet, comment out to fix lint warning

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
      <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded" disabled>
        Add Meal (coming soon)
      </button>
      <ul className="divide-y divide-gray-200">
        {meals.map((meal) => (
          <li key={meal.id} className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setSelectedMeal(meal)}>
            <span>
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
