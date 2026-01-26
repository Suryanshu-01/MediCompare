// ==========================================
// ADD DOCTOR PAGE
// ==========================================
// Hospital staff can add new doctors to their profile
// Form includes: name, gender, qualifications, specialization, experience, etc.
// Doctor availability with dropdown day selection and per-day time slots

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import doctorService from '../services/doctor.service';
import { validateName, validateRequired } from '../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, GENDER, CONSULTATION_TYPE } from '../utils/constants';
import HospitalNavbar from '../components/layout/HospitalNavbar';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// ==========================================
// COMPONENT
// ==========================================
export default function AddDoctor() {
  // ========== STATE ==========
  const [formData, setFormData] = useState({
    name: '',
    gender: 'MALE',
    specialization: '',
    experience: '',
    registrationNumber: '',
    consultationType: 'OPD',
    consultationFee: '',
    description: '',
    qualifications: '',
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [selectedDays, setSelectedDays] = useState([]);
  const [dayTimeSlots, setDayTimeSlots] = useState({}); // { Monday: [{start, end}], ... }
  const [bulkTimeSlots, setBulkTimeSlots] = useState([{ start: '09:00', end: '17:00' }]);
  const [daysToApply, setDaysToApply] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Time slot definition
  const [templateTimeSlots, setTemplateTimeSlots] = useState([{ start: '09:00', end: '17:00' }]);
  const [daysToApplySlots, setDaysToApplySlots] = useState([]);

  const navigate = useNavigate();

  // ========== DAY TOGGLE ==========
  const toggleDay = (day) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        // Remove day
        const newDays = prev.filter((d) => d !== day);
        const newSlots = { ...dayTimeSlots };
        delete newSlots[day];
        setDayTimeSlots(newSlots);
        return newDays;
      } else {
        // Add day with default time slot
        const newDays = [...prev, day];
        if (!dayTimeSlots[day]) {
          setDayTimeSlots((prev) => ({
            ...prev,
            [day]: [{ start: '09:00', end: '17:00' }],
          }));
        }
        return newDays;
      }
    });
  };

  // ========== TIME SLOT CHANGE FOR A DAY ==========
  const handleTimeSlotChange = (day, index, field, value) => {
    setDayTimeSlots((prev) => {
      const slots = [...(prev[day] || [])];
      slots[index][field] = value;
      return { ...prev, [day]: slots };
    });
  };

  // ========== ADD TIME SLOT FOR A DAY ==========
  const addTimeSlotForDay = (day) => {
    setDayTimeSlots((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '09:00', end: '17:00' }],
    }));
  };

  // ========== REMOVE TIME SLOT FOR A DAY ==========
  const removeTimeSlotForDay = (day, index) => {
    setDayTimeSlots((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((_, i) => i !== index),
    }));
  };

  // ========== BULK TIME SLOT FUNCTIONS ==========
  const handleBulkTimeSlotChange = (index, field, value) => {
    const updatedSlots = [...bulkTimeSlots];
    updatedSlots[index][field] = value;
    setBulkTimeSlots(updatedSlots);
  };

  const addBulkTimeSlot = () => {
    setBulkTimeSlots([...bulkTimeSlots, { start: '09:00', end: '17:00' }]);
  };

  const removeBulkTimeSlot = (index) => {
    setBulkTimeSlots(bulkTimeSlots.filter((_, i) => i !== index));
  };

  const toggleDayToApply = (day) => {
    setDaysToApply((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const applyBulkSlotsToSelectedDays = () => {
    if (daysToApply.length === 0) {
      alert('Please select at least one day');
      return;
    }

    // Apply bulk slots to all selected days
    setDayTimeSlots((prev) => {
      const updated = { ...prev };
      daysToApply.forEach((day) => {
        updated[day] = bulkTimeSlots.map((slot) => ({ ...slot }));
      });
      return updated;
    });

    // Reset bulk selection
    setDaysToApply([]);
    alert(`✓ Time slots applied to ${daysToApply.length} day(s)`);
  };

  // ========== TEMPLATE TIME SLOT FUNCTIONS ==========
  const handleTemplateTimeSlotChange = (index, field, value) => {
    const updatedSlots = [...templateTimeSlots];
    updatedSlots[index][field] = value;
    setTemplateTimeSlots(updatedSlots);
  };

  const addTemplateTimeSlot = () => {
    setTemplateTimeSlots([...templateTimeSlots, { start: '09:00', end: '17:00' }]);
  };

  const removeTemplateTimeSlot = (index) => {
    setTemplateTimeSlots(templateTimeSlots.filter((_, i) => i !== index));
  };

  const toggleDayForSlots = (day) => {
    setDaysToApplySlots((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const applyTemplateSlotsToSelectedDays = () => {
    if (daysToApplySlots.length === 0) {
      alert('Please select at least one day to apply slots to');
      return;
    }

    // Apply template slots to all selected days
    setDayTimeSlots((prev) => {
      const updated = { ...prev };
      daysToApplySlots.forEach((day) => {
        updated[day] = templateTimeSlots.map((slot) => ({ ...slot }));
      });
      return updated;
    });

    // Reset
    setDaysToApplySlots([]);
    alert(`✓ Time slots applied to ${daysToApplySlots.length} day(s)`);
  };

  // ========== INPUT CHANGE ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ========== PHOTO UPLOAD ==========
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

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');
    setSuccessMessage('');

    // Validate all fields
    const newErrors = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) newErrors.name = nameValidation.error;

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.experience || formData.experience < 0) {
      newErrors.experience = 'Experience must be a valid number';
    }

    if (!formData.registrationNumber) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    if (!formData.consultationFee || formData.consultationFee < 0) {
      newErrors.consultationFee = 'Consultation fee must be a valid number';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.qualifications.trim()) {
      newErrors.qualifications = 'Qualifications are required';
    }

    if (selectedDays.length === 0) {
      newErrors.days = 'At least one day is required';
    }

    // Check if each selected day has at least one time slot
    for (const day of selectedDays) {
      if (!dayTimeSlots[day] || dayTimeSlots[day].length === 0) {
        newErrors.days = `${day} has no time slots`;
        break;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for API (schema expects availability.days and availability.timeSlots as array)
    const mergedSlots = selectedDays.length > 0 ? dayTimeSlots[selectedDays[0]] || [] : [];
    
    // Use FormData for file upload
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('gender', formData.gender);
    formDataToSend.append('specialization', formData.specialization);
    formDataToSend.append('experience', Number(formData.experience));
    formDataToSend.append('registrationNumber', Number(formData.registrationNumber));
    formDataToSend.append('consultationType', formData.consultationType);
    formDataToSend.append('consultationFee', Number(formData.consultationFee));
    formDataToSend.append('description', formData.description);
    
    // Add qualifications array - send as individual items
    const qualifications = formData.qualifications.split(',').map((q) => q.trim());
    qualifications.forEach((qual, index) => {
      formDataToSend.append(`qualification[${index}]`, qual);
    });
    
    // Add availability as JSON
    formDataToSend.append('availability[days]', JSON.stringify(selectedDays));
    formDataToSend.append('availability[timeSlots]', JSON.stringify(mergedSlots));
    
    // Add photo if uploaded
    if (photo) {
      formDataToSend.append('photo', photo);
    }

    console.log('Submitting doctor data with photo');

    setLoading(true);
    try {
      const response = await doctorService.addDoctor(formDataToSend);
      console.log('Doctor added successfully:', response);
      setSuccessMessage(SUCCESS_MESSAGES.DOCTOR_ADDED);
      setTimeout(() => {
        navigate('/hospital/doctors');
      }, 1500);
    } catch (error) {
      console.error('Error adding doctor:', error);
      setApiError(error.message || ERROR_MESSAGES.REGISTRATION_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER ==========
  return (
    <>
      <HospitalNavbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
          <p className="text-gray-600 mt-2">Fill in the doctor's details and set availability</p>
        </div>

        {/* Errors & Success */}
        {apiError && (
          <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className="p-4 mb-6 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Dr. John Smith"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-sm text-gray-500 mt-1">Upload a professional photo (JPG, PNG)</p>
              </div>
            </div>
          </div>

          {/* Specialization & Experience */}
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
                placeholder="10"
                min="0"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.experience && <p className="text-red-600 text-sm mt-1">{errors.experience}</p>}
            </div>
          </div>

          {/* Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Qualifications (comma-separated)</label>
            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleInputChange}
              placeholder="MD, MBBS, PhD"
              rows="2"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.qualifications && <p className="text-red-600 text-sm mt-1">{errors.qualifications}</p>}
          </div>

          {/* Registration & Consultation Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <input
                type="number"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                placeholder="123456"
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
                <option value="OPD">OPD (Outpatient)</option>
                <option value="IPD">IPD (Inpatient)</option>
                <option value="BOTH">Both</option>
              </select>
            </div>
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Consultation Fee (₹)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleInputChange}
              placeholder="50"
              min="0"
              step="0.01"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.consultationFee && <p className="text-red-600 text-sm mt-1">{errors.consultationFee}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description about the doctor"
              rows="3"
              maxLength="500"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-500 text-xs mt-1">{formData.description.length}/500</p>
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Availability - Day Selection */}
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

          {/* Bulk Time Slots Section */}
          {selectedDays.length > 0 && (
            <div className="border-t pt-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Add Time Slots to Multiple Days</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create time slots below, then select which days should have these exact same slots.
                </p>

                {/* Define Bulk Time Slots */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Define Time Slots</label>
                  <div className="space-y-2 mb-4">
                    {bulkTimeSlots.map((slot, index) => (
                      <div key={index} className="flex gap-2 items-end bg-white p-3 rounded-lg">
                        <div className="flex-1">
                          <label className="text-xs text-gray-600">Start Time</label>
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              handleBulkTimeSlotChange(index, 'start', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-600">End Time</label>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              handleBulkTimeSlotChange(index, 'end', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {bulkTimeSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBulkTimeSlot(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addBulkTimeSlot}
                    className="text-sm bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 font-medium"
                  >
                    + Add Another Time Slot
                  </button>
                </div>

                {/* Select Days to Apply */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Apply to These Days</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {selectedDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDayToApply(day)}
                        className={`px-3 py-2 rounded font-medium text-sm transition ${
                          daysToApply.includes(day)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={applyBulkSlotsToSelectedDays}
                  disabled={daysToApply.length === 0}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                  ✓ Apply Slots to {daysToApply.length} Day{daysToApply.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {/* Time Slots for Selected Days */}
          {selectedDays.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Review & Edit Time Slots by Day</h3>
              <p className="text-sm text-gray-600 mb-4">Time slots are now set for each day. Click a day to expand and make individual adjustments if needed.</p>

              {selectedDays.map((day) => (
                <div key={day} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Day Header - Clickable */}
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

                  {/* Time Slots for this day - Expandable */}
                  {expandedDay === day && (
                    <div className="p-4 bg-white space-y-3">
                      {dayTimeSlots[day]?.length > 0 ? (
                        <>
                          {dayTimeSlots[day]?.map((slot, index) => (
                        <div key={index} className="flex gap-3 items-end p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-600 block mb-1">Start Time</label>
                            <input
                              type="time"
                              value={slot.start}
                              onChange={(e) =>
                                handleTimeSlotChange(day, index, 'start', e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs font-medium text-gray-600 block mb-1">End Time</label>
                            <input
                              type="time"
                              value={slot.end}
                              onChange={(e) =>
                                handleTimeSlotChange(day, index, 'end', e.target.value)
                              }
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

                          {/* Add Another Time Slot Button */}
                          <button
                            type="button"
                            onClick={() => addTimeSlotForDay(day)}
                            className="w-full mt-2 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium transition"
                          >
                            + Add Another Slot
                          </button>
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No time slots set. Use bulk apply above or add here.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Adding Doctor...' : 'Add Doctor'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
