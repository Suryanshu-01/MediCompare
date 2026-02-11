// ==========================================
// ADD SERVICE PAGE
// ==========================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HospitalNavbar from "../components/layout/HospitalNavbar";
import servicesService from "../services/services.service";
import loincService from "../services/loinc.service";

const MIN_QUERY_LENGTH = 2;

export default function AddService() {
  const navigate = useNavigate();

  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState("");
  const [loincQuery, setLoincQuery] = useState("");
  const [loincResults, setLoincResults] = useState([]);
  const [loincLoading, setLoincLoading] = useState(false);
  const [selectedLoinc, setSelectedLoinc] = useState(null);
  const [price, setPrice] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // ================= LOINC SEARCH =================
  useEffect(() => {
    if (!category || loincQuery.trim().length < MIN_QUERY_LENGTH) {
      setLoincResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoincLoading(true);
        const data = await loincService.searchLoincTests(
          loincQuery.trim(),
          category
        );
        setLoincResults(data || []);
      } catch {
        setLoincResults([]);
      } finally {
        setLoincLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [loincQuery, category]);

  // ================= HELPERS =================
  const resetForm = () => {
    setCategory("");
    setLoincQuery("");
    setSelectedLoinc(null);
    setLoincResults([]);
    setPrice("");
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!category) errors.category = "Category is required";
    if (!selectedLoinc) errors.loinc = "Please select a test";
    if (price === "" || Number(price) < 0)
      errors.price = "Price must be valid";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ================= CREATE =================
  const handleCreate = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      setSaving(true);

      await servicesService.createService({
        loincCode: selectedLoinc.loincCode,
        displayName: selectedLoinc.displayName,
        category,
        price: Number(price),
      });

      setSuccessMessage("Service added successfully");
      resetForm();

      setTimeout(() => navigate("/hospital/services"), 1200);
    } catch (error) {
      setApiError(error.message || "Failed to add service");
    } finally {
      setSaving(false);
    }
  };

  const selectedLabel = useMemo(() => {
    if (!selectedLoinc) return "";
    return `${selectedLoinc.displayName} (${selectedLoinc.loincCode})`;
  }, [selectedLoinc]);

  return (
    <>
      <HospitalNavbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Add Service</h1>

          <form onSubmit={handleCreate} className="space-y-4">

            {/* CATEGORY */}
            <div>
              <label className="block text-sm font-medium">Category *</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setLoincQuery("");
                  setSelectedLoinc(null);
                }}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select category</option>
                <option value="BLOOD_TEST">Blood Test</option>
                <option value="URINE_TEST">Urine Test</option>
                <option value="IMAGING">Imaging</option>
              </select>
              {formErrors.category && (
                <p className="text-red-500 text-sm">{formErrors.category}</p>
              )}
            </div>

            {/* SEARCH */}
            <div>
              <label className="block text-sm font-medium">Search Test *</label>
              <input
                type="text"
                value={loincQuery}
                disabled={!category}
                onChange={(e) => {
                  setLoincQuery(e.target.value);
                  setSelectedLoinc(null);
                }}
                placeholder={
                  category ? "Type test name" : "Select category first"
                }
                className="w-full border px-3 py-2 rounded"
              />

              {loincLoading && (
                <p className="text-sm text-gray-500">Searching...</p>
              )}

              {loincResults.length > 0 && (
                <div className="border mt-2 rounded bg-white max-h-60 overflow-y-auto">
                  {loincResults.map((item) => (
                    <button
                      key={item.loincCode}
                      type="button"
                      onClick={() => {
                        setSelectedLoinc(item);
                        setLoincQuery(item.displayName);
                        setLoincResults([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50"
                    >
                      <div className="font-medium">{item.displayName}</div>
                      <div className="text-xs text-gray-500">
                        {item.loincCode}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedLabel && (
                <p className="text-green-600 text-sm mt-1">
                  Selected: {selectedLabel}
                </p>
              )}

              {formErrors.loinc && (
                <p className="text-red-500 text-sm">{formErrors.loinc}</p>
              )}
            </div>

            {/* PRICE */}
            <div>
              <label className="block text-sm font-medium">Price *</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              {formErrors.price && (
                <p className="text-red-500 text-sm">{formErrors.price}</p>
              )}
            </div>

            <button
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {saving ? "Saving..." : "Add Service"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
