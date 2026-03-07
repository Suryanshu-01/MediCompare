
import { useEffect, useMemo, useState } from "react";
import HospitalNavbar from "../components/layout/HospitalNavbar";
import servicesService from "../services/services.service";
import loincService from "../services/loinc.service";

const MIN_QUERY_LENGTH = 2;

export default function HospitalServices() {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [category, setCategory] = useState("");
  const [loincQuery, setLoincQuery] = useState("");
  const [loincResults, setLoincResults] = useState([]);
  const [loincLoading, setLoincLoading] = useState(false);
  const [selectedLoinc, setSelectedLoinc] = useState(null);
  const [price, setPrice] = useState("");
  const [formErrors, setFormErrors] = useState({});

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

    if (!category) errors.category = "Category required";
    if (!selectedLoinc) errors.loinc = "Select a test";
    if (price === "" || Number(price) < 0) errors.price = "Invalid price";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  return (
    <>
      <HospitalNavbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">

        <div className="max-w-7xl mx-auto px-6 py-10">

          {successMessage && (
            <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {apiError && (
            <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {apiError}
            </div>
          )}

          {/* ADD SERVICE CARD */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-10">

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Add New Service
            </h2>

            <form onSubmit={handleCreate} className="space-y-5">

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setLoincQuery("");
                    setSelectedLoinc(null);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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

              <div className="relative">

                <label className="block text-sm font-medium mb-1">
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
                    category ? "Search medical test..." : "Select category first"
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />

                {loincLoading && (
                  <p className="text-sm text-gray-500 mt-1">
                    Searching tests...
                  </p>
                )}

                {loincResults.length > 0 && (
                  <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow mt-2 max-h-60 overflow-y-auto">

                    {loincResults.map((item) => (
                      <button
                        key={item.loincCode}
                        type="button"
                        onClick={() => {
                          setSelectedLoinc(item);
                          setLoincQuery(item.displayName);
                          setLoincResults([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50"
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />

                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.price}
                  </p>
                )}
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                Add Service
              </button>

            </form>
          </div>

          {/* SERVICES LIST */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Your Services
            </h2>

            {loading && (
              <p className="text-gray-500">Loading services...</p>
            )}

            {!loading && services.length === 0 && (
              <p className="text-gray-500">No services added yet.</p>
            )}

            {!loading && services.length > 0 && (

              <div className="divide-y">

                {services.map((service) => (

                  <div
                    key={service._id}
                    className="flex justify-between items-center py-4"
                  >

                    <div>
                      <div className="font-medium text-gray-900">
                        {service.displayName}
                      </div>

                      <div className="text-sm text-gray-500">
                        {service.loincCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">

                      <span className="text-sm font-medium text-gray-700">
                        ₹{service.price}
                      </span>

                      <button
                        onClick={() => handleDelete(service._id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>
      </div>
    </>
  );
}
