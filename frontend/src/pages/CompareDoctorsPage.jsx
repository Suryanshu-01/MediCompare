import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components/layout/UserNavbar";
import CompareBar from "../components/CompareBar";
import DoctorScoreCard from "../components/DoctorScoreCard";
import DoctorCompareTable from "../components/DoctorCompareTable";
import DoctorRadarChart from "../components/DoctorRadarChart";
import DoctorInsights from "../components/DoctorInsights";
import useDoctorCompare from "../hooks/useDoctorCompare";
import doctorService from "../services/doctor.service";

export default function CompareDoctorsPage() {
  const navigate = useNavigate();
  const { selectedDoctors, selectedIds, minCompare } = useDoctorCompare();

  const [comparisonData, setComparisonData] = useState({
    doctors: [],
    scores: {},
    insights: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasDoctors = selectedDoctors.length > 0;
  const hasMinimumDoctors = selectedDoctors.length >= minCompare;

  useEffect(() => {
    const fetchComparison = async () => {
      if (!hasMinimumDoctors) {
        setComparisonData({ doctors: [], scores: {}, insights: {} });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await doctorService.compareDoctors(selectedIds);

        setComparisonData({
          doctors: response?.doctors || [],
          scores: response?.scores || {},
          insights: response?.insights || {},
        });
      } catch (apiError) {
        setError(apiError?.message || "Failed to load doctor comparison");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [hasMinimumDoctors, selectedIds]);

  const bestOverallId = useMemo(() => {
    return comparisonData?.insights?.bestOverall?.doctorId || null;
  }, [comparisonData]);

  if (!hasDoctors) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            No doctors selected for comparison
          </h1>
          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className="mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Go back and add doctors
          </button>
        </div>
      </div>
    );
  }

  if (!hasMinimumDoctors) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <CompareBar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Select at least 2 doctors to compare
          </h1>
          <button
            type="button"
            onClick={() => navigate("/user/dashboard")}
            className="mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Go back and add doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <CompareBar />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Smart Doctor Comparison
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Compare doctor quality, affordability, and availability with
            weighted scoring.
          </p>
        </section>

        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
            Loading comparison...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {comparisonData.doctors.map((doctor) => (
                <DoctorScoreCard
                  key={doctor._id}
                  doctor={doctor}
                  scoreData={comparisonData.scores?.[doctor._id]}
                  isBestOverall={bestOverallId === doctor._id}
                />
              ))}
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Smart Score Bars
              </h2>
              <div className="space-y-3">
                {comparisonData.doctors.map((doctor) => {
                  const score =
                    comparisonData.scores?.[doctor._id]?.smartScore || 0;
                  return (
                    <div key={`score-${doctor._id}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-800">
                          {doctor.name}
                        </span>
                        <span className="font-bold text-gray-900">
                          {score.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{
                            width: `${Math.max(0, Math.min(score, 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Detailed Comparison
              </h2>
              <DoctorCompareTable
                doctors={comparisonData.doctors}
                scores={comparisonData.scores}
              />
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Metric Radar
              </h2>
              <DoctorRadarChart
                doctors={comparisonData.doctors}
                scores={comparisonData.scores}
              />
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Comparison Insights
              </h2>
              <DoctorInsights insights={comparisonData.insights} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
