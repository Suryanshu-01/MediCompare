import { useEffect, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import loincService from "../../services/loinc.service";

const MIN_QUERY_LENGTH = 2;

export default function LoincSearchInput({ value, onChange, onSelect, error, category }) {
  const [results,setResults]=useState([]);
  const [loading,setLoading]=useState(false);
  const [requestError,setRequestError]=useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedQuery = useDebounce(value,400);

  useEffect(()=>{
    let active=true;

    if (!category || debouncedQuery.trim().length < MIN_QUERY_LENGTH){
      setResults([]);
      setRequestError("");
      return;
    }

    const fetch=async()=>{
      try{
        setLoading(true);
        setRequestError("");
        const data = await loincService.searchLoincTests(debouncedQuery.trim(),category);
        if(active) {
          setResults(Array.isArray(data) ? data : []);
          setShowDropdown(true);
        }
      }catch(err){
        if(active){
          const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch suggestions";
          setRequestError(errorMsg);
          setResults([]);
        }
      }finally{
        if(active) setLoading(false);
      }
    };

    fetch();
    return ()=>{active=false};
  },[debouncedQuery,category]);

  return (
    <div>
      <input
        value={value}
        onChange={(e)=>{
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        placeholder={category?"Type test name":"Select category first"}
        className="w-full border px-3 py-2 rounded"
      />

      {loading && <p className="text-sm text-gray-500">Searching...</p>}
      {requestError && <p className="text-red-500 text-sm">{requestError}</p>}
      
      {!loading && !requestError && value.length >= MIN_QUERY_LENGTH && results.length === 0 && !showDropdown && (
        <p className="text-gray-500 text-sm mt-2">❌ No results found</p>
      )}

      {showDropdown && results.length > 0 && (
        <div className="border mt-2 rounded bg-white max-h-96 overflow-y-auto shadow-lg z-10">
          <div className="sticky top-0 bg-gray-100 px-3 py-2 text-xs text-gray-600 border-b">
            📊 Showing {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
          {results.map(item=>(
            <button
              key={item.loincCode}
              type="button"
              onClick={()=>{
                onSelect(item);
                setShowDropdown(false);
                setResults([]);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-100 border-b transition"
            >
              <div className="font-medium text-sm">{item.displayName}</div>
              <div className="text-xs text-gray-500">{item.loincCode}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
