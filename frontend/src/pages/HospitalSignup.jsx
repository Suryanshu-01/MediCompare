// ==========================================
// HOSPITAL SIGNUP FORM
// ==========================================
// Hospital registration with:
// - Name, Email, Phone, Address
// - Location (Longitude, Latitude)
// - Document upload (PDF, JPG, PNG)
// - Upload progress bar (0-100%)
// Calls auth.service.hospitalRegister() with FormData

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateFile,
  validateCoordinates,
  validateRequired,
  validatePassword,
} from '../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

// ==========================================
// COMPONENT
// ==========================================
export default function HospitalSignup() {
  // ========== STATE ==========
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    lng: '',
    lat: '',
  });

  const [document, setDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // ========== INPUT CHANGE ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ========== FILE CHANGE ==========
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setErrors({ document: validation.error });
      return;
    }

    setDocument(file);
    setErrors((prev) => ({ ...prev, document: '' }));
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

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) newErrors.email = emailValidation.error;

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) newErrors.phone = phoneValidation.error;

    const addressValidation = validateRequired(formData.address, 'Address');
    if (!addressValidation.isValid) newErrors.address = addressValidation.error;

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.error;

    const coordValidation = validateCoordinates(formData.lng, formData.lat);
    if (!coordValidation.isValid) newErrors.coordinates = coordValidation.error;

    if (!document) {
      newErrors.document = 'Please upload a document';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('Validation errors:', newErrors);
      return;
    }

    console.log('Form validation passed, preparing submission...');

    // Prepare FormData
    const fd = new FormData();
    fd.append('hospitalName', formData.name);
    fd.append('email', formData.email);
    fd.append('password', formData.password);
    fd.append('phone', formData.phone);
    fd.append('address', formData.address);
    fd.append('longitude', formData.lng);
    fd.append('latitude', formData.lat);
    fd.append('document', document);

    // API call with upload progress
    setLoading(true);
    setUploading(true);
    try {
      console.log('Starting API call with FormData:', {
        hospitalName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        lng: formData.lng,
        lat: formData.lat,
        hasDocument: !!document,
      });

      // Simulate progress (0-90%, capped at 90%)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 20;
          // Cap at 90% until upload completes
          return Math.min(newProgress, 90);
        });
      }, 300);

      const response = await authService.hospitalRegister(fd);
      console.log('API Response:', response);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setSuccessMessage(SUCCESS_MESSAGES.HOSPITAL_SUBMITTED);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.log('Error occurred:', error);
      setApiError(error.message || ERROR_MESSAGES.REGISTRATION_FAILED);
    } finally {
      setLoading(false);
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // ========== RENDER ==========
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* API Error */}
      {apiError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {apiError}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Hospital Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="City Hospital"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="hospital@example.com"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="••••••••"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="9876543210"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="123 Hospital Lane"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="number"
            name="lng"
            value={formData.lng}
            onChange={handleInputChange}
            placeholder="-73.9352"
            step="0.0001"
            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="number"
            name="lat"
            value={formData.lat}
            onChange={handleInputChange}
            placeholder="40.7580"
            step="0.0001"
            className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {errors.coordinates && <p className="text-red-600 text-sm">{errors.coordinates}</p>}

      {/* Document Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Registration Document</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg"
        />
        {document && <p className="text-green-600 text-sm mt-1">✓ {document.name}</p>}
        {errors.document && <p className="text-red-600 text-sm mt-1">{errors.document}</p>}
      </div>

      {/* Upload Progress Bar */}
      {uploading && uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      {uploading && <p className="text-sm text-gray-600">{Math.round(uploadProgress)}%</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || uploading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition"
      >
        {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Submit for Verification'}
      </button>
    </form>
  );
}
