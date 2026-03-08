const getScoreColor = (score) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

export default function DoctorScoreCard({ doctor, scoreData, isBestOverall }) {
  const score = scoreData?.smartScore || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
          <p className="text-sm text-blue-700 font-semibold">
            {doctor.specialization}
          </p>
          <p className="text-xs text-gray-500 mt-1">{doctor.hospitalName}</p>
        </div>

        {isBestOverall && (
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            Best Overall
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
          Smart Score
        </p>
        <div className="h-2 w-full rounded-full bg-gray-100 mt-2 overflow-hidden">
          <div
            className={`h-full ${getScoreColor(score)}`}
            style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
          />
        </div>
        <p className="text-xl font-extrabold text-gray-900 mt-2">
          {score.toFixed(2)}/100
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <p className="text-gray-600">
          Rating:{" "}
          <span className="font-semibold text-gray-900">
            {(doctor.doctorRating ?? 0).toFixed(1)}/10
          </span>
        </p>
        <p className="text-gray-600">
          Fee:{" "}
          <span className="font-semibold text-gray-900">
            Rs {doctor.consultationFee ?? 0}
          </span>
        </p>
        <p className="text-gray-600">
          Experience:{" "}
          <span className="font-semibold text-gray-900">
            {doctor.experience ?? 0} yrs
          </span>
        </p>
        <p className="text-gray-600">
          Badge:{" "}
          <span className="font-semibold text-gray-900">
            {scoreData?.experienceBadge || "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
}
