import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../components/layout/UserNavbar';

const HospitalUserDashboard = () => {
    const location = useLocation();
    const { hospitalId } = useParams();
    const navigate = useNavigate();

    // Get hospital data from location state or query params
    const hospitalData = location.state || {};
    const { name, lng, lat } = hospitalData;

    // Parse query params if state is not available
    const queryParams = new URLSearchParams(location.search);
    const hospitalName = name || queryParams.get('name');
    const hospitalLng = lng || parseFloat(queryParams.get('lng'));
    const hospitalLat = lat || parseFloat(queryParams.get('lat'));

    return (
        <div className="min-h-screen bg-gray-50">
            <UserNavbar />

            {/* Header Section */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Hospital Details
                    </h1>
                    <p className="text-gray-600 mt-1">View hospital information and services</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        ← Back to Map
                    </button>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {hospitalName || 'Hospital Name Not Found'}
                            </h2>
                            <p className="text-gray-600">
                                Hospital ID: <span className="font-semibold">{hospitalId}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Longitude
                                </h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {hospitalLng || 'Not available'}
                                </p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Latitude
                                </h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {hospitalLat || 'Not available'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 mt-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Location Coordinates
                            </h3>
                            <p className="text-gray-700 font-mono">
                                {hospitalLng && hospitalLat
                                    ? `[${hospitalLng}, ${hospitalLat}]`
                                    : 'Coordinates not available'}
                            </p>
                        </div>

                        <div className="mt-8 p-6 bg-blue-100 border-l-4 border-blue-600 rounded">
                            <p className="text-blue-800">
                                <span className="font-semibold">Note:</span> More hospital details like doctors, services, and consultation fees will be added here soon.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalUserDashboard;
