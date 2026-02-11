import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HospitalNavbar from '../../../components/layout/HospitalNavbar';
import ServiceTable from '../../../components/services/ServiceTable';
import servicesService from '../../../services/services.service';
import { SERVICE_CATEGORIES } from '../../../constants/serviceCategories';

export default function ServicesList() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingService, setEditingService] = useState(null);
  const [editData, setEditData] = useState({ displayName: '', category: '', price: '' });
  const [deletingId, setDeletingId] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setApiError('');
    try {
      const services = await servicesService.getHospitalServices();
      setServices(services || []);
    } catch (error) {
      setApiError(error?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditOpen = (service) => {
    setEditingService(service);
    setEditData({
      displayName: service.displayName || '',
      category: service.category || '',
      price: service.price ?? '',
    });
  };

  const handleEditClose = () => {
    setEditingService(null);
    setEditData({ displayName: '', category: '', price: '' });
  };

  const handleUpdate = async () => {
    if (!editingService) return;

    if (!editData.displayName.trim()) {
      setApiError('Service name is required');
      return;
    }
    if (editData.price === '' || Number(editData.price) < 0) {
      setApiError('Price must be a valid number');
      return;
    }

    try {
      await servicesService.updateService(editingService._id, {
        displayName: editData.displayName.trim(),
        category: editData.category.trim(),
        price: Number(editData.price),
      });
      setSuccessMessage('Service updated successfully');
      handleEditClose();
      fetchServices();
    } catch (error) {
      setApiError(error?.message || 'Failed to update service');
    }
  };

  const handleDisable = async (id) => {
    setDeletingId(id);
    try {
      await servicesService.deleteService(id);
      setSuccessMessage('Service disabled successfully');
      fetchServices();
    } catch (error) {
      setApiError(error?.message || 'Failed to disable service');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <HospitalNavbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Services</h1>
              <p className="text-gray-600 mt-2">Add, edit, and manage tests/services</p>
            </div>
            <button
              onClick={() => navigate('/hospital/services/add')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Add Service
            </button>
          </div>

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

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading services...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <ServiceTable services={services} onEdit={handleEditOpen} onDisable={handleDisable} deletingId={deletingId} />
            </div>
          )}
        </div>
      </div>

      {editingService && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Service</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Name</label>
                <input
                  type="text"
                  value={editData.displayName}
                  onChange={(e) => setEditData((prev) => ({ ...prev, displayName: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData((prev) => ({ ...prev, category: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData((prev) => ({ ...prev, price: e.target.value }))}
                  min="0"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleEditClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
