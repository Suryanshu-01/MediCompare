// ==========================================
// EDIT DOCTOR PAGE
// ==========================================
// Hospital staff can edit an existing doctor's profile

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import doctorService from '../services/doctor.service';
import { validateName } from '../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, CONSULTATION_TYPE } from '../utils/constants';
import HospitalNavbar from '../components/layout/HospitalNavbar';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditDoctor() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  // -------- State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'MALE',
    specialization: '',
    experience: '',
    registrationNumber: '',
    consultationType: CONSULTATION_TYPE.OPD,
    consultationFee: '',
    description: '',
    qualifications: '',
  });

  const [selectedDays, setSelectedDays] = useState([]);
  const [dayTimeSlots, setDayTimeSlots] = useState({}); // { Monday: [{start, end}] }
  const [expandedDay, setExpandedDay] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  // -------- Derived
  const hasAvailability = useMemo(() => selectedDays.length > 0, [selectedDays]);

  // -------- Fetch existing doctor
  useEffect(() => {
    const loadDoctor = async () => {
      setApiError('');
      try {
        const response = await doctorService.getDoctorById(doctorId);
        const doctor = response.data || response;

        setFormData({
          name: doctor.name || '',
          gender: doctor.gender || 'MALE',
          specialization: doctor.specialization || '',
          experience: doctor.experience ?? '',
          registrationNumber: doctor.registrationNumber ?? '',
          consultationType: doctor.consultationType || CONSULTATION_TYPE.OPD,
          consultationFee: doctor.consultationFee ?? '',
          description: doctor.description || '',
          qualifications: (doctor.qualification || doctor.qualifications || []).join(', '),
        });

        const days = doctor?.availability?.days || [];
        const sharedSlots = doctor?.availability?.timeSlots || [{ start: '09:00', end: '17:00' }];
        setSelectedDays(days);
        setDayTimeSlots(() => {
          const mapped = {};
          days.forEach((day) => {
            mapped[day] = (sharedSlots || [{ start: '09:00', end: '17:00' }]).map((slot) => ({
              start: slot.start || '09:00',
              end: slot.end || '17:00',
            }));
          });
          return mapped;
        });

        setExpandedDay(days[0] || null);

        // Load existing photo
        if (doctor.photo?.url) {
          setExistingPhoto(doctor.photo.url);
          setPhotoPreview(doctor.photo.url);
        }
      } catch (error) {
        setApiError(error.message || 'Failed to load doctor');
      } finally {
        setLoading(false);
      }
    };

    loadDoctor();
  }, [doctorId]);

  // -------- Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        const updatedDays = prev.filter((d) => d !== day);
        const nextSlots = { ...dayTimeSlots };
        delete nextSlots[day];
        setDayTimeSlots(nextSlots);
        return updatedDays;
      }
      const newDays = [...prev, day];
      if (!dayTimeSlots[day]) {
        setDayTimeSlots((prevSlots) => ({
          ...prevSlots,
          [day]: [{ start: '09:00', end: '17:00' }],
        }));
      }
      return newDays;
    });
  };

  const handleTimeSlotChange = (day, index, field, value) => {
    setDayTimeSlots((prev) => {
      const slots = [...(prev[day] || [])];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, [day]: slots };
    });
  };

  const addTimeSlotForDay = (day) => {
    setDayTimeSlots((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '09:00', end: '17:00' }],
    }));
  };

  const removeTimeSlotForDay = (day, index) => {
    setDayTimeSlots((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) newErrors.name = nameValidation.error;

    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.experience || formData.experience < 0) newErrors.experience = 'Experience must be a valid number';
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
    if (!formData.consultationFee || formData.consultationFee < 0) newErrors.consultationFee = 'Consultation fee must be a valid number';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.qualifications.trim()) newErrors.qualifications = 'Qualifications are required';
    if (selectedDays.length === 0) newErrors.days = 'At least one day is required';

    for (const day of selectedDays) {
      if (!dayTimeSlots[day] || dayTimeSlots[day].length === 0) {
        newErrors.days = `${day} has no time slots`;
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    const mergedSlots = selectedDays.length > 0 ? dayTimeSlots[selectedDays[0]] || [] : [];
    
    // Use FormData if photo is uploaded, otherwise use JSON
    let dataToSend;
    if (photo) {
      dataToSend = new FormData();
      dataToSend.append('name', formData.name);
      dataToSend.append('gender', formData.gender);
      dataToSend.append('specialization', formData.specialization);
      dataToSend.append('experience', Number(formData.experience));
      dataToSend.append('registrationNumber', Number(formData.registrationNumber));
      dataToSend.append('consultationType', formData.consultationType);
      dataToSend.append('consultationFee', Number(formData.consultationFee));
      dataToSend.append('description', formData.description);
      
      const qualifications = formData.qualifications.split(',').map((q) => q.trim());
      qualifications.forEach((qual, index) => {
        dataToSend.append(`qualification[${index}]`, qual);
      });
      
      dataToSend.append('availability[days]', JSON.stringify(selectedDays));
      dataToSend.append('availability[timeSlots]', JSON.stringify(mergedSlots));
      dataToSend.append('photo', photo);
    } else {
      dataToSend = {
        name: formData.name,
        gender: formData.gender,
        specialization: formData.specialization,
        experience: Number(formData.experience),
        registrationNumber: Number(formData.registrationNumber),
        consultationType: formData.consultationType,
        consultationFee: Number(formData.consultationFee),
        description: formData.description,
        qualification: formData.qualifications.split(',').map((q) => q.trim()),
        availability: {
          days: selectedDays,
          timeSlots: mergedSlots,
        },
      };
    }

    setSaving(true);
    try {
      await doctorService.updateDoctor(doctorId, dataToSend);
      setSuccessMessage(SUCCESS_MESSAGES.DOCTOR_UPDATED);
      setTimeout(() => navigate('/hospital/doctors'), 1200);
    } catch (error) {
      setApiError(error.message || ERROR_MESSAGES.REGISTRATION_FAILED);
    } finally {
      setSaving(false);
    }
  };

  // -------- Render
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading doctor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HospitalNavbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Doctor</h1>
              <p className="text-gray-600 mt-1">Update doctor details and availability</p>
            </div>
            <button
              onClick={() => navigate('/hospital/doctors')}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to list
            </button>
          </div>

        {apiError && (
          <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. John Smith"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Photo</label>
            <div className="flex items-start gap-4">
              {photoPreview && (
                <div className="shrink-0">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {existingPhoto && !photo ? 'Current photo shown. Upload new to replace.' : 'Upload a professional photo (JPG, PNG)'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                placeholder="Cardiology"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.specialization && <p className="text-red-600 text-sm mt-1">{errors.specialization}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.experience && <p className="text-red-600 text-sm mt-1">{errors.experience}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Qualifications (comma-separated)</label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleInputChange}
              rows="2"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.qualifications && <p className="text-red-600 text-sm mt-1">{errors.qualifications}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input
                type="number"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.registrationNumber && <p className="text-red-600 text-sm mt-1">{errors.registrationNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Consultation Type</label>
              <select
                name="consultationType"
                value={formData.consultationType}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={CONSULTATION_TYPE.OPD}>OPD (Outpatient)</option>
                <option value={CONSULTATION_TYPE.IPD}>IPD (Inpatient)</option>
                <option value={CONSULTATION_TYPE.BOTH}>Both</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.consultationFee && <p className="text-red-600 text-sm mt-1">{errors.consultationFee}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              maxLength="500"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-500 text-xs mt-1">{formData.description.length}/500</p>
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Availability */}
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">Select Available Days</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-3 rounded-lg font-medium transition ${
                    selectedDays.includes(day)
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            {errors.days && <p className="text-red-600 text-sm mt-2">{errors.days}</p>}
          </div>

          {hasAvailability && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Slots by Day</h3>
              <p className="text-sm text-gray-600 mb-4">Edit slots per day. Defaults to 09:00-17:00 when adding a day.</p>

              {selectedDays.map((day) => (
                <div key={day} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                    className="w-full flex justify-between items-center py-3 px-4 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <span className="font-semibold text-gray-900">{day}</span>
                    <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
                      {dayTimeSlots[day]?.length || 0} slot{(dayTimeSlots[day]?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </button>

                  {expandedDay === day && (
                    <div className="p-4 bg-white space-y-3">
                      {dayTimeSlots[day]?.length > 0 ? (
                        <>
                          {dayTimeSlots[day].map((slot, index) => (
                            <div key={index} className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <label className="text-xs font-medium text-gray-600 block mb-1">Start Time</label>
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => handleTimeSlotChange(day, index, 'start', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs font-medium text-gray-600 block mb-1">End Time</label>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => handleTimeSlotChange(day, index, 'end', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              {dayTimeSlots[day].length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlotForDay(day, index)}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 font-medium"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addTimeSlotForDay(day)}
                            className="w-full mt-2 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium transition"
                          >
                            + Add Another Slot
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500 text-sm mb-2">No time slots set for {day}.</p>
                          <button
                            type="button"
                            onClick={() => addTimeSlotForDay(day)}
                            className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 font-medium"
                          >
                            Add Slot
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
