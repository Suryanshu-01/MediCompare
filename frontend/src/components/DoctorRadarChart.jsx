import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04"];

export default function DoctorRadarChart({ doctors, scores }) {
  if (!Array.isArray(doctors) || doctors.length === 0) return null;

  const radarData = [
    { metric: "Experience" },
    { metric: "Rating" },
    { metric: "Affordability" },
    { metric: "Availability" },
    { metric: "Qualification" },
  ];

  doctors.forEach((doctor) => {
    const doctorScore = scores?.[doctor._id]?.breakdown || {};

    radarData[0][doctor.name] = doctorScore.experience || 0;
    radarData[1][doctor.name] = doctorScore.rating || 0;
    radarData[2][doctor.name] = doctorScore.affordability || 0;
    radarData[3][doctor.name] = doctorScore.availability || 0;
    radarData[4][doctor.name] = doctorScore.qualification || 0;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <Tooltip />
          <Legend />
          {doctors.map((doctor, index) => (
            <Radar
              key={doctor._id}
              name={doctor.name}
              dataKey={doctor.name}
              stroke={COLORS[index % COLORS.length]}
              fill={COLORS[index % COLORS.length]}
              fillOpacity={0.2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
