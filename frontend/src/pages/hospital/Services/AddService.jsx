import { useState } from "react";
import LoincSearchInput from "../../../components/services/LoincSearchInput";
import { createService } from "../../../services/services.service";


export default function AddService() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setError("");
    setSuccess("");
    
    if (!category) {
      setError("Please select a category first");
      return;
    }

    if (!selected) {
      setError("Please select a test from suggestions");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    try {
      setLoading(true);
      await createService({
        loincCode: selected.loincCode,
        displayName: selected.displayName,
        category,
        price: Number(price),
      });

      setSuccess(`✅ Service "${selected.displayName}" added successfully!`);

      setTimeout(() => {
        setSearch("");
        setSelected(null);
        setCategory("");
        setPrice("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Add Service</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded text-green-700 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          setSearch("");
          setSelected(null);
          setError("");
        }}
        className="w-full border px-3 py-2 rounded"
      >
        <option value="">Select Category First</option>
        <option value="Blood Test">Blood Test</option>
        <option value="Urine Test">Urine Test</option>
        <option value="Imaging">Imaging</option>
      </select>

      <div className="mt-4">
        <LoincSearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setSelected(null);
          }}
          onSelect={(item) => {
            setSelected(item);
            setSearch("");
            setError("");
          }}
          error={error}
          category={category}
        />
        
        {selected && (
          <div className="mt-2 p-3 bg-green-50 border border-green-300 rounded">
            <p className="text-sm text-gray-600">✅ Selected Test:</p>
            <p className="font-semibold text-green-700">{selected.displayName}</p>
            <p className="text-xs text-gray-500">Code: {selected.loincCode}</p>
          </div>
        )}
      </div>

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="mt-3 w-full border px-3 py-2 rounded"
      />

      <button
        onClick={handleAdd}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Adding..." : "Add Service"}
      </button>
    </div>
  );
}
