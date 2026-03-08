import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import UserNavbar from "../components/layout/UserNavbar";
import CompareBar from "../components/CompareBar";
import doctorService from "../services/doctor.service";
import servicesService from "../services/services.service";
import ratingService from "../services/rating.service";
import useDoctorCompare from "../hooks/useDoctorCompare";

const HospitalUserDashboard = () => {
  const location = useLocation();
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  // Get hospital data from location state
  const hospitalData = location.state || {};
  const { name, selectedDoctorId } = hospitalData;

  // States
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [error, setError] = useState("");
  const [doctorRating, setDoctorRating] = useState(null);
  const [serviceRating, setServiceRating] = useState(null);
  const [showServiceRatingModal, setShowServiceRatingModal] = useState(false);
  const [serviceRatingInput, setServiceRatingInput] = useState(0);
  const [submittingServiceRating, setSubmittingServiceRating] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorPersonalRating, setDoctorPersonalRating] = useState(null);
  const [showDoctorRatingModal, setShowDoctorRatingModal] = useState(false);
  const [doctorRatingInput, setDoctorRatingInput] = useState(0);
  const [submittingDoctorRating, setSubmittingDoctorRating] = useState(false);
  const [compareActionMessage, setCompareActionMessage] = useState("");
  const { addDoctor } = useDoctorCompare();

  // Fetch doctors and services on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctors
        const doctorsResponse =
          await doctorService.getDoctorsByHospitalId(hospitalId);
        if (doctorsResponse.success) {
          setDoctors(doctorsResponse.data || []);
        }
        setLoadingDoctors(false);

        // Fetch services
        const servicesResponse =
          await servicesService.getServicesByHospitalId(hospitalId);
        setServices(servicesResponse || []);
        setLoadingServices(false);

        // Fetch existing ratings
        const ratingsResponse =
          await ratingService.getHospitalRatings(hospitalId);
        if (ratingsResponse.success) {
          setDoctorRating(ratingsResponse.doctorRating ?? null);
          setServiceRating(ratingsResponse.serviceRating ?? null);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load hospital details");
        setLoadingDoctors(false);
        setLoadingServices(false);
      }
    };

    if (hospitalId) {
      fetchData();
    }
  }, [hospitalId]);

  // Auto-open doctor modal if selectedDoctorId is provided
  useEffect(() => {
    if (selectedDoctorId && doctors.length > 0 && !loadingDoctors) {
      const doctor = doctors.find((d) => d._id === selectedDoctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
        setShowDoctorModal(true);
      }
    }
  }, [selectedDoctorId, doctors, loadingDoctors]);

  // Fetch doctor rating when doctor modal opens
  useEffect(() => {
    const fetchDoctorRating = async () => {
      if (showDoctorModal && selectedDoctor) {
        try {
          const ratingResponse = await ratingService.getDoctorRating(
            selectedDoctor._id,
          );
          if (ratingResponse.success) {
            setDoctorPersonalRating(ratingResponse.personalDoctorRating);
          } else {
            setDoctorPersonalRating(null);
          }
        } catch (err) {
          console.error("Error fetching doctor rating:", err);
          setDoctorPersonalRating(null);
        }
      } else {
        setDoctorPersonalRating(null);
      }
    };
    fetchDoctorRating();
  }, [showDoctorModal, selectedDoctor]);

  useEffect(() => {
    if (!showDoctorModal) {
      setCompareActionMessage("");
    }
  }, [showDoctorModal, selectedDoctor]);

  // Scroll to section based on URL hash after data loads
  useEffect(() => {
    if (doctors.length > 0 || services.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [doctors, services]);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <CompareBar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Hospital Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
                {name || "Hospital"}
              </h1>

              <p className="text-blue-700 text-sm mt-1">
                Explore doctors and available services
              </p>
            </div>

            {/* Ratings */}
            <div className="flex gap-4">
              <div className="bg-white/70 backdrop-blur px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                <p className="text-xs text-gray-500">Doctor Rating</p>
                <p className="font-semibold text-blue-700">
                  {typeof doctorRating === "number"
                    ? `${doctorRating.toFixed(1)}/10`
                    : "Not rated"}
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                <p className="text-xs text-gray-500">Service Rating</p>
                <p className="font-semibold text-blue-700">
                  {typeof serviceRating === "number"
                    ? `${serviceRating.toFixed(1)}/10`
                    : "Not rated"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        {/* Doctors Section */}
        <div id="doctors" className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            👨‍⚕️ Doctors
          </h2>
          {loadingDoctors ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading doctors...</p>
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    setShowDoctorModal(true);
                  }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                >
                  {/* Doctor Photo */}
                  {doctor.photo && doctor.photo.url && (
                    <img
                      src={doctor.photo.url}
                      alt={doctor.name}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <div className="p-6">
                    {/* Name and Specialization */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 font-semibold mb-4">
                      {doctor.specialization || "Specialist"}
                    </p>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm text-gray-700 mb-4">
                      {doctor.phone && (
                        <p>
                          <span className="font-semibold">📞 Phone:</span>{" "}
                          {doctor.phone}
                        </p>
                      )}
                      {doctor.email && (
                        <p>
                          <span className="font-semibold">📧 Email:</span>{" "}
                          {doctor.email}
                        </p>
                      )}
                      {doctor.experience && (
                        <p>
                          <span className="font-semibold">📚 Experience:</span>{" "}
                          {doctor.experience} years
                        </p>
                      )}
                      {typeof doctor.consultationFee === "number" && (
                        <p>
                          <span className="font-semibold">
                            💰 Consultation Fee:
                          </span>{" "}
                          ₹{doctor.consultationFee}
                        </p>
                      )}
                    </div>

                    {/* Click for more info */}
                    <p className="text-right text-sm text-blue-600">
                      Click for more info
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">
                No doctors found for this hospital
              </p>
            </div>
          )}
        </div>

        {/* Services Section */}
        <div id="services">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            🏥 Services & Tests
          </h2>
          {loadingServices ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading services...</p>
            </div>
          ) : services.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">
                        Service Name
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        LOINC Code
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, index) => (
                      <tr
                        key={service._id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition border-b`}
                      >
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {service.displayName || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {service.category || "General"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 font-mono text-sm">
                          {service.loincCode || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-blue-600 text-lg">
                            ₹{service.price || "0"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">
                No services found for this hospital
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setServiceRatingInput(0);
                setShowServiceRatingModal(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Rate our Services
            </button>
          </div>
        </div>

        {/* Rating Modals */}
        {showServiceRatingModal && (
          <div
            onClick={() => setShowServiceRatingModal(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200"
            >
              <h3 className="text-lg font-bold mb-4 text-gray-900">
                Rate our Services
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Tap a star from 1 to 10.
              </p>
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setServiceRatingInput(value)}
                    className="text-2xl focus:outline-none"
                  >
                    <span
                      className={
                        value <= serviceRatingInput
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setShowServiceRatingModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingServiceRating || serviceRatingInput === 0}
                  onClick={async () => {
                    if (!hospitalId || serviceRatingInput === 0) return;
                    try {
                      setSubmittingServiceRating(true);
                      const res = await ratingService.rateServices(
                        hospitalId,
                        serviceRatingInput,
                      );
                      if (res.success) {
                        setServiceRating(res.serviceRating);
                        setShowServiceRatingModal(false);
                      }
                    } catch (e) {
                      console.error("Failed to submit service rating", e);
                    } finally {
                      setSubmittingServiceRating(false);
                    }
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingServiceRating ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDoctorRatingModal && selectedDoctor && (
          <div
            onClick={() => setShowDoctorRatingModal(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-md flex items-center justify-center z-[110] p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200"
            >
              <h3 className="text-lg font-bold mb-4 text-gray-900">
                Rate {selectedDoctor.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Tap a star from 1 to 10.
              </p>
              <div className="flex justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDoctorRatingInput(value)}
                    className="text-2xl focus:outline-none"
                  >
                    <span
                      className={
                        value <= doctorRatingInput
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setShowDoctorRatingModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingDoctorRating || doctorRatingInput === 0}
                  onClick={async () => {
                    if (!selectedDoctor || doctorRatingInput === 0) return;
                    try {
                      setSubmittingDoctorRating(true);
                      const res = await ratingService.rateDoctors(
                        selectedDoctor._id,
                        doctorRatingInput,
                      );
                      if (res.success) {
                        setDoctorPersonalRating(res.personalDoctorRating);
                        setDoctorRating(res.hospitalDoctorRating); // Update hospital doctor rating
                        setShowDoctorRatingModal(false);
                      }
                    } catch (e) {
                      console.error("Failed to submit doctor rating", e);
                    } finally {
                      setSubmittingDoctorRating(false);
                    }
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingDoctorRating ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDoctorModal && selectedDoctor && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-sky-50/50">
                <h3 className="text-xl font-bold text-sky-900">
                  Doctor Profile
                </h3>

                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="p-2 rounded-full hover:bg-white hover:shadow-sm text-gray-400 hover:text-red-500 transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* LEFT COLUMN */}
                  <div className="md:w-1/2 space-y-4">
                    <div className="relative">
                      {selectedDoctor.photo?.url ? (
                        <img
                          src={selectedDoctor.photo.url}
                          alt={selectedDoctor.name}
                          className="w-full h-72 object-cover rounded-2xl shadow-md border-4 border-white"
                        />
                      ) : (
                        <div className="w-full h-72 bg-sky-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-sky-200">
                          <span className="text-sky-500 font-medium">
                            No Photo Available
                          </span>
                        </div>
                      )}

                      <div
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          selectedDoctor.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        ●{" "}
                        {selectedDoctor.isActive ? "Available" : "Unavailable"}
                      </div>
                    </div>

                    {/* Fee Card */}
                    <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
                      <label className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                        Consultation Fee
                      </label>

                      <p className="text-3xl font-black text-blue-700">
                        {typeof selectedDoctor.consultationFee === "number"
                          ? `₹${selectedDoctor.consultationFee}`
                          : "N/A"}
                      </p>

                      <p className="text-sm text-sky-600/80 mt-1">
                        {selectedDoctor.consultationType || "General"} Visit
                      </p>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="md:w-1/2 space-y-6">
                    <header>
                      <h4 className="text-2xl font-extrabold text-gray-900 leading-tight">
                        {selectedDoctor.name || "N/A"}
                      </h4>

                      <p className="text-blue-600 font-semibold text-lg">
                        {selectedDoctor.specialization || "General Physician"}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded italic text-sm">
                          Rating:{" "}
                          {typeof doctorPersonalRating === "number"
                            ? `${doctorPersonalRating.toFixed(1)}/10`
                            : "Not rated"}
                        </span>
                      </div>
                    </header>

                    <div className="space-y-4">
                      {/* Education */}
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Education
                        </label>

                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedDoctor.qualification?.length > 0 ? (
                            selectedDoctor.qualification.map((qual, idx) => (
                              <span
                                key={idx}
                                className="bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold"
                              >
                                {qual}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Schedule
                        </label>

                        {selectedDoctor.availability ? (
                          <div className="mt-2 space-y-1 text-sm text-gray-700">
                            <p className="flex justify-between">
                              <span className="font-medium">Days:</span>
                              <span className="text-blue-600">
                                {selectedDoctor.availability.days?.join(", ") ||
                                  "N/A"}
                              </span>
                            </p>

                            <p className="flex justify-between">
                              <span className="font-medium">Hours:</span>
                              <span className="text-blue-600">
                                {selectedDoctor.availability.timeSlots?.[0]
                                  ? `${selectedDoctor.availability.timeSlots[0].start} - ${selectedDoctor.availability.timeSlots[0].end}`
                                  : "Not specified"}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">Not specified</p>
                        )}
                      </div>

                      {/* About */}
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          About Doctor
                        </label>

                        <p className="text-sm text-gray-600 mt-1 leading-relaxed italic">
                          "
                          {selectedDoctor.description ||
                            "No description provided."}
                          "
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button
                  onClick={() => {
                    setDoctorRatingInput(0);
                    setShowDoctorRatingModal(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
                >
                  Rate this Doctor
                </button>
                <button
                  onClick={() => {
                    const result = addDoctor({
                      ...selectedDoctor,
                      hospitalName: name || "Unknown Hospital",
                    });
                    setCompareActionMessage(result.message);
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700"
                >
                  Compare Doctor
                </button>
                <button
                  onClick={() => setShowDoctorModal(false)}
                  className="ml-auto px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
              {compareActionMessage && (
                <p className="px-6 pb-4 text-sm font-medium text-indigo-700">
                  {compareActionMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalUserDashboard;
