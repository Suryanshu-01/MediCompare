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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8">

        <div className="max-w-3xl mx-auto">

          <div className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-10 border border-gray-100">

            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Add New Service
            </h1>

            {apiError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
                {apiError}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm border border-green-200">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6">

              {/* CATEGORY */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setLoincQuery("");
                    setSelectedLoinc(null);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select category</option>
                  <option value="BLOOD_TEST">Blood Test</option>
                  <option value="URINE_TEST">Urine Test</option>
                  <option value="IMAGING">Imaging</option>
                </select>

                {formErrors.category && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* SEARCH */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Test
                </label>

                <input
                  type="text"
                  value={loincQuery}
                  disabled={!category}
                  onChange={(e) => {
                    setLoincQuery(e.target.value);
                    setSelectedLoinc(null);
                  }}
                  placeholder={
                    category ? "Type test name..." : "Select category first"
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />

                {loincLoading && (
                  <p className="text-sm text-gray-500 mt-1">
                    Searching tests...
                  </p>
                )}

                {loincResults.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">

                    {loincResults.map((item) => (
                      <button
                        key={item.loincCode}
                        type="button"
                        onClick={() => {
                          setSelectedLoinc(item);
                          setLoincQuery(item.displayName);
                          setLoincResults([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition"
                      >
                        <div className="font-medium text-gray-800">
                          {item.displayName}
                        </div>

                        <div className="text-xs text-gray-500">
                          {item.loincCode}
                        </div>
                      </button>
                    ))}

                  </div>
                )}

                {selectedLabel && (
                  <p className="text-green-600 text-sm mt-2">
                    Selected: {selectedLabel}
                  </p>
                )}

                {formErrors.loinc && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.loinc}
                  </p>
                )}
              </div>

              {/* PRICE */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />

                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.price}
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <button
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60"
              >
                {saving ? "Saving Service..." : "Add Service"}
              </button>

            </form>

          </div>
        </div>
      </div>
    </>
  );
}
