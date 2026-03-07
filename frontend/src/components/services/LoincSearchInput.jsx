import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import loincService from "../../services/loinc.service";

const MIN_QUERY_LENGTH = 2;

export default function LoincSearchInput({ value, onChange, onSelect, error, category }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedQuery = useDebounce(value, 400);

  useEffect(() => {
    let active = true;

    if (!category || debouncedQuery.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setRequestError("");
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        setRequestError("");

        const data = await loincService.searchLoincTests(
          debouncedQuery.trim(),
          category
        );

        if (active) {
          setResults(Array.isArray(data) ? data : []);
          setShowDropdown(true);
        }
      } catch (err) {
        if (active) {
          setRequestError("Failed to fetch suggestions");
          setResults([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetch();
    return () => {
      active = false;
    };
  }, [debouncedQuery, category]);

  return (
    <div className="relative">

      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        placeholder={category ? "Search medical test..." : "Select category first"}
        className="w-full border border-gray-300 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
      />

      {loading && (
        <p className="text-sm text-gray-500 mt-2">Searching tests...</p>
      )}

      {requestError && (
        <p className="text-red-500 text-sm mt-2">{requestError}</p>
      )}

      {showDropdown && results.length > 0 && (
        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-2 max-h-80 overflow-y-auto">

          <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs text-gray-500 border-b">
            Showing {results.length} result{results.length !== 1 ? "s" : ""}
          </div>

          {results.map((item) => (
            <button
              key={item.loincCode}
              type="button"
              onClick={() => {
                onSelect(item);
                setShowDropdown(false);
                setResults([]);
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
    </div>
  );
}