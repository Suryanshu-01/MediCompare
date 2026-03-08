import { useNavigate, useLocation } from "react-router-dom";
import useDoctorCompare from "../hooks/useDoctorCompare";

export default function CompareBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDoctors, removeDoctor, clearDoctors, minCompare } =
    useDoctorCompare();

  const isOnComparePage = location.pathname === "/compare-doctors";

  if (selectedDoctors.length === 0) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Compare Queue: {selectedDoctors.length} selected
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedDoctors.map((doctor) => (
              <span
                key={doctor._id}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-semibold text-blue-700"
              >
                {doctor.name}
                <button
                  type="button"
                  onClick={() => removeDoctor(doctor._id)}
                  className="text-red-500 hover:text-red-700"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearDoctors}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Clear
          </button>
          {!isOnComparePage && (
            <button
              type="button"
              onClick={() => navigate("/compare-doctors")}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Compare Now
            </button>
          )}
        </div>
      </div>

      {selectedDoctors.length < minCompare && (
        <p className="max-w-7xl mx-auto text-xs text-blue-700 mt-2">
          Select at least {minCompare} doctors to compare.
        </p>
      )}
    </div>
  );
}
