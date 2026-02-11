// ==========================================
// HOSPITAL SERVICES PAGE
// ==========================================

import { useEffect, useMemo, useState } from "react";
import HospitalNavbar from "../components/layout/HospitalNavbar";
import servicesService from "../services/services.service";
import loincService from "../services/loinc.service";

const MIN_QUERY_LENGTH = 2;

export default function HospitalServices() {

  // ---------------- STATE ----------------
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Add form state
  const [category, setCategory] = useState("");
  const [loincQuery, setLoincQuery] = useState("");
  const [loincResults, setLoincResults] = useState([]);
  const [loincLoading, setLoincLoading] = useState(false);
  const [selectedLoinc, setSelectedLoinc] = useState(null);
  const [price, setPrice] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // ---------------- FETCH SERVICES ----------------
  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesService.getServices();
      setServices(data || []);
    } catch (error) {
      setApiError(error.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ---------------- LOINC SEARCH ----------------
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

  // ---------------- HELPERS ----------------
  const resetForm = () => {
    setCategory("");
    setLoincQuery("");
    setLoincResults([]);
    setSelectedLoinc(null);
    setPrice("");
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!category) errors.category = "Category is required";
    if (!selectedLoinc)
      errors.loinc = "Please select a test from suggestions";
    if (price === "" || Number(price) < 0)
      errors.price = "Invalid price";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---------------- CREATE SERVICE ----------------
  const handleCreate = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      await servicesService.createService({
        loincCode: selectedLoinc.loincCode,
        displayName: selectedLoinc.displayName,
        category,
        price: Number(price),
      });

      setSuccessMessage("Service added successfully");
      resetForm();
      fetchServices();
    } catch (error) {
      setApiError(error.message || "Failed to add service");
    }
  };

  // ---------------- DELETE SERVICE ----------------
  const handleDelete = async (id) => {
    try {
      await servicesService.deleteService(id);
      fetchServices();
    } catch (error) {
      setApiError(error.message || "Delete failed");
    }
  };

  const selectedLabel = useMemo(() => {
    if (!selectedLoinc) return "";
    return `${selectedLoinc.displayName} (${selectedLoinc.loincCode})`;
  }, [selectedLoinc]);

  // ---------------- UI ----------------
  return (
    <>
      <HospitalNavbar />

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {apiError}
            </div>
          )}

          {/* ================= ADD SERVICE ================= */}
          <div className="bg-white p-6 rounded shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Add Service</h2>

            <form onSubmit={handleCreate} className="space-y-4">

              {/* CATEGORY */}
              <div>
                <label className="block text-sm font-medium">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setLoincQuery("");
                    setSelectedLoinc(null);
                    setLoincResults([]);
                  }}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select category</option>
                  <option value="BLOOD_TEST">Blood Test</option>
                  <option value="URINE_TEST">Urine Test</option>
                  <option value="IMAGING">Imaging</option>
                </select>
                {formErrors.category && (
                  <p className="text-red-500 text-sm">
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* LOINC SEARCH */}
              <div>
                <label className="block text-sm font-medium">
                  Search Test *
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
                    category ? "Type test name" : "Select category first"
                  }
                  className="w-full border px-3 py-2 rounded"
                />

                {loincLoading && (
                  <p className="text-sm text-gray-500 mt-1">
                    Searching...
                  </p>
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
                        <div className="font-medium">
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
                  <p className="text-green-600 text-sm mt-1">
                    Selected: {selectedLabel}
                  </p>
                )}

                {formErrors.loinc && (
                  <p className="text-red-500 text-sm">
                    {formErrors.loinc}
                  </p>
                )}
              </div>

              {/* PRICE */}
              <div>
                <label className="block text-sm font-medium">
                  Price *
                </label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm">
                    {formErrors.price}
                  </p>
                )}
              </div>

              <button className="bg-blue-600 text-white px-4 py-2 rounded">
                Add Service
              </button>
            </form>
          </div>

          {/* ================= SERVICES LIST ================= */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">
              Your Services
            </h2>

            {loading && (
              <p className="text-gray-500">
                Loading services...
              </p>
            )}

            {!loading && services.length === 0 && (
              <p className="text-gray-500">
                No services added yet.
              </p>
            )}

            {!loading &&
              services.map((service) => (
                <div
                  key={service._id}
                  className="flex justify-between border-b py-3"
                >
                  <div>
                    <div className="font-medium">
                      {service.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {service.loincCode}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>

        </div>
      </div>
    </>
  );
}
