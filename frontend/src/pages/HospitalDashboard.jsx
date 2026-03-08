import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import doctorService from "../services/doctor.service";
import HospitalNavbar from "../components/layout/HospitalNavbar";
import { Plus, Users, Activity, ShieldCheck } from "lucide-react";

export default function HospitalDashboard(){
  const navigate = useNavigate();
  const { hospital, user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorService.getDoctors();
        setDoctors(response.data || response);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const totalDoctors = doctors.length;

  const activeDoctors = doctors.filter(
    (d) =>
      d.availability?.days?.length > 0 &&
      d.availability?.timeSlots?.length > 0
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">

      <HospitalNavbar />

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome to {hospital?.hospitalName || "Hospital"} Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your hospital, doctors and services
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* QUICK ACTIONS */}
        <section className="mb-12 pb-10 border-b border-gray-200">

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ADD DOCTOR */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

              <div className="flex gap-4">

                <div className="bg-blue-100 p-3 rounded-xl">
                  <Plus className="text-blue-600" size={26} />
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-gray-900 mb-1">
                    Add New Doctor
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    Register a new doctor with qualifications and availability.
                  </p>

                  <button
                    onClick={() => navigate("/hospital/doctors/add")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Add Doctor
                  </button>

                </div>
              </div>
            </div>

            {/* MANAGE DOCTORS */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

              <div className="flex gap-4">

                <div className="bg-green-100 p-3 rounded-xl">
                  <Users className="text-green-600" size={26} />
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-gray-900 mb-1">
                    Manage Doctors
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    View and manage all doctors registered under your hospital.
                  </p>

                  <button
                    onClick={() => navigate("/hospital/doctors")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    View Doctors
                  </button>

                </div>
              </div>
            </div>

            {/* ADD SERVICE */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

              <div className="flex gap-4">

                <div className="bg-purple-100 p-3 rounded-xl">
                  <Activity className="text-purple-600" size={26} />
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-gray-900 mb-1">
                    Add New Service
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    Add hospital tests with LOINC suggestions.
                  </p>

                  <button
                    onClick={() => navigate("/hospital/services/add")}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Add Service
                  </button>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* OVERVIEW */}
        <section className="mb-12 pb-10 border-b border-gray-200">

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* TOTAL DOCTORS */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-sm text-gray-500">Total Doctors</p>

                  <p className="text-3xl font-bold text-gray-900 tracking-tight mt-1">
                    {loading ? "..." : totalDoctors}
                  </p>
                </div>

                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="text-blue-600" size={22} />
                </div>

              </div>
            </div>

            {/* ACTIVE DOCTORS */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-sm text-gray-500">Active Doctors</p>

                  <p className="text-3xl font-bold text-green-600 tracking-tight mt-1">
                    {loading ? "..." : activeDoctors}
                  </p>
                </div>

                <div className="bg-green-100 p-3 rounded-xl">
                  <Activity className="text-green-600" size={22} />
                </div>

              </div>
            </div>

            {/* STATUS */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

              <div className="flex justify-between items-center">

                <div>
                  <p className="text-sm text-gray-500">Hospital Status</p>

                  <p className="text-xl font-bold text-green-600 mt-1">
                    {hospital?.status || "VERIFIED"}
                  </p>
                </div>

                <div className="bg-green-100 p-3 rounded-xl">
                  <ShieldCheck className="text-green-600" size={22} />
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* HOSPITAL INFO */}
        <section>

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Hospital Information
          </h2>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <p className="text-sm text-gray-500">Hospital Name</p>
                <p className="font-semibold text-gray-900">
                  {hospital?.hospitalName || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">
                  {hospital?.email || user?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">
                  {hospital?.phone || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold text-gray-900">
                  {hospital?.address || "N/A"}
                </p>
              </div>

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
