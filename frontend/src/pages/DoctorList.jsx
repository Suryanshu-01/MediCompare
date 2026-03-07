
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import doctorService from "../services/doctor.service";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../utils/constants";
import HospitalNavbar from "../components/layout/HospitalNavbar";

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const navigate = useNavigate();

  const fetchDoctors = async () => {
    setLoading(true);
    setApiError("");

    try {
      const response = await doctorService.getDoctors();
      setDoctors(response.data || response);
    } catch (error) {
      setApiError(error.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (doctorId) => {
    try {
      await doctorService.deleteDoctor(doctorId);
      setSuccessMessage(SUCCESS_MESSAGES.DOCTOR_DELETED);
      setDeleteConfirmId(null);
      fetchDoctors();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setApiError(error.message || "Failed to delete doctor");
    }
  };

  const handleEdit = (doctorId) => {
    navigate(`/hospital/doctors/${doctorId}/edit`);
  };

  return (
    <>
      <HospitalNavbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">

        {/* PAGE CONTAINER */}
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Your Doctors
              </h1>

              <p className="text-gray-500 mt-1">
                Manage doctors in your hospital
              </p>
            </div>

            <button
              onClick={() => navigate("/hospital/doctors/add")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              + Add Doctor
            </button>

          </div>

          {/* ALERTS */}
          {apiError && (
            <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg flex justify-between">
              {apiError}
              <button onClick={() => setApiError("")}>✕</button>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-lg flex justify-between">
              {successMessage}
              <button onClick={() => setSuccessMessage("")}>✕</button>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="text-center py-16">

              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

              <p className="text-gray-500 mt-4">
                Loading doctors...
              </p>

            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && doctors.length === 0 && (

            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">

              <p className="text-gray-600 text-lg">
                No doctors added yet
              </p>

              <button
                onClick={() => navigate("/hospital/doctors/add")}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Add Your First Doctor
              </button>

            </div>

          )}

          {/* DOCTOR TABLE */}
          {!loading && doctors.length > 0 && (

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

              <table className="min-w-full">

                {/* TABLE HEADER */}
                <thead className="bg-gray-50 border-b">

                  <tr className="text-left text-sm font-semibold text-gray-700">

                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Experience</th>
                    <th className="px-6 py-4">Consultation Fee</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>

                  </tr>

                </thead>

                {/* TABLE BODY */}
                <tbody className="divide-y">

                  {doctors.map((doctor) => (

                    <tr
                      key={doctor._id}
                      className="hover:bg-gray-50 transition"
                    >

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {doctor.name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {doctor.specialization}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {doctor.experience} years
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        ₹{doctor.consultationFee}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doctor.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {doctor.isActive ? "Active" : "Inactive"}
                        </span>

                      </td>

                      <td className="px-6 py-4 flex gap-2">

                        <button
                          onClick={() => handleEdit(doctor._id)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-xs font-medium hover:bg-blue-200"
                        >
                          Edit
                        </button>

                        {deleteConfirmId === doctor._id ? (
                          <>
                            <button
                              onClick={() => handleDelete(doctor._id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md text-xs"
                            >
                              Confirm
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              setDeleteConfirmId(doctor._id)
                            }
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-xs hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </>
  );
}