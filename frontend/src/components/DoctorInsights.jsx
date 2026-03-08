const insightLabels = {
  highestRated: "Highest Rated",
  mostAffordable: "Most Affordable",
  mostExperienced: "Most Experienced",
  bestOverall: "Best Overall",
};

const formatInsightValue = (key, value) => {
  if (key === "highestRated") return `${value}/10`;
  if (key === "mostAffordable") return `Rs ${value}`;
  if (key === "mostExperienced") return `${value} years`;
  if (key === "bestOverall") return `${value}/100`;
  return String(value);
};

export default function DoctorInsights({ insights }) {
  const insightEntries = Object.entries(insights || {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {insightEntries.map(([key, value]) => (
        <div
          key={key}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
            {insightLabels[key] || key}
          </p>
          <p className="text-lg font-bold text-gray-900 mt-2">
            {value?.name || "N/A"}
          </p>
          <p className="text-sm text-blue-700 font-semibold mt-1">
            {value ? formatInsightValue(key, value.value) : "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
}
