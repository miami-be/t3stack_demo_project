"use client";
import { useEffect, useState } from "react";

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<Partial<Supplier>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/suppliers");
      const data = (await res.json()) as Supplier[];
      setSuppliers(data);
    } catch (_e) {
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/suppliers?id=${editingId}` : "/api/suppliers";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save supplier");
      setForm({});
      setEditingId(null);
      void fetchSuppliers();
    } catch (_e) {
      setError("Failed to save supplier");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(supplier: Supplier) {
    setForm(supplier);
    setEditingId(supplier.id);
  }

  function cancelEdit() {
    setForm({});
    setEditingId(null);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suppliers</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2 bg-gray-50 rounded p-4 shadow">
        <div>
          <input
            name="name"
            value={form.name ?? ""}
            onChange={handleChange}
            placeholder="Supplier Name"
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <input
            name="contactName"
            value={form.contactName ?? ""}
            onChange={handleChange}
            placeholder="Contact Name"
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div>
          <input
            name="contactPhone"
            value={form.contactPhone ?? ""}
            onChange={handleChange}
            placeholder="Contact Phone"
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {editingId ? "Update" : "Add"} Supplier
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="text-gray-600">Cancel</button>
          )}
        </div>
        {error && <div className="text-red-600">{error}</div>}
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Contact Name</th>
            <th className="p-2 border">Contact Phone</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td className="p-2 border">{s.name}</td>
              <td className="p-2 border">{s.contactName}</td>
              <td className="p-2 border">{s.contactPhone}</td>
              <td className="p-2 border">
                <button
                  onClick={() => startEdit(s)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
