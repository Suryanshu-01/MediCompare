// ==========================================
// DOCTOR LIST PAGE
// ==========================================
// Hospital staff can view and manage their doctors
// Shows: doctor name, specialization, experience, consultation fee, actions

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import HospitalNavbar from '../components/layout/HospitalNavbar';

// ==========================================
// COMPONENT
// ==========================================
export default function DoctorList() {
  // ========== STATE ==========
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const navigate = useNavigate();

  // ========== FETCH DOCTORS ==========
  const fetchDoctors = async () => {
    setLoading(true);
    setApiError('');
    try {
      const response = await doctorService.getDoctors();
      setDoctors(response.data || response);
    } catch (error) {
      setApiError(error.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  // ========== USE EFFECT ==========
  useEffect(() => {
    fetchDoctors();
  }, []);

  // ========== DELETE DOCTOR ==========
  const handleDelete = async (doctorId) => {
    try {
      await doctorService.deleteDoctor(doctorId);
      setSuccessMessage(SUCCESS_MESSAGES.DOCTOR_DELETED);
      setDeleteConfirmId(null);
      fetchDoctors();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setApiError(error.message || 'Failed to delete doctor');
    }
  };

  // ========== EDIT DOCTOR ==========
  const handleEdit = (doctorId) => {
    navigate(`/hospital/doctors/${doctorId}/edit`);
  };

  // ========== RENDER ==========
  return (
    <>
      <HospitalNavbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Doctors</h1>
            <p className="text-gray-600 mt-2">Manage doctors in your hospital</p>
          </div>
          <button
            onClick={() => navigate('/hospital/doctors/add')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add Doctor
          </button>
        </div>

        {/* Errors & Success */}
        {apiError && (
          <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{apiError}</span>
            <button onClick={() => setApiError('')} className="text-red-700 hover:text-red-900">✕</button>
          </div>
        )}
        {successMessage && (
          <div className="p-4 mb-6 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600 mt-4">Loading doctors...</p>
          </div>
        )}

        {/* No Doctors */}
        {!loading && doctors.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg">No doctors added yet</p>
            <button
              onClick={() => navigate('/hospital/doctors/add')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add First Doctor
            </button>
          </div>
        )}

        {/* Doctors Table */}
        {!loading && doctors.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Specialization</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Experience</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Consultation Fee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor, index) => (
                  <tr
                    key={doctor._id || index}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {doctor.name}
                    </td>

                    {/* Specialization */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doctor.specialization}
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {doctor.experience} years
                    </td>

                    {/* Consultation Fee */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      ₹{doctor.consultationFee}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        doctor.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(doctor._id)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-xs font-semibold"
                      >
                        Edit
                      </button>

                      {deleteConfirmId === doctor._id ? (
                        <>
                          <button
                            onClick={() => handleDelete(doctor._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs font-semibold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(doctor._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-xs font-semibold"
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
