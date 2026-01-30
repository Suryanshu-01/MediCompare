import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/layout/UserNavbar';

const HospitalList = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/api/hospitalslocation");
            const data = await response.json();

            if (data.success && data.data) {
                setHospitals(data.data);
                setError('');
            } else {
                setError('Failed to fetch hospitals');
            }
        } catch (err) {
            console.error('Error fetching hospitals:', err);
            setError('Error fetching hospitals. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleHospitalClick = (hospital) => {
        navigate(`/hospital/${hospital._id}`, {
            state: {
                name: hospital.name,
                lng: hospital.lng,
                lat: hospital.lat,
                hospitalId: hospital._id
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <UserNavbar />

            {/* Header Section */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Hospital List
                            </h1>
                            <p className="text-gray-600 mt-1">Browse all verified hospitals</p>
                        </div>
                        <button
                            onClick={() => navigate('/user/dashboard')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            ← Back to Map
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="ml-4 text-gray-600">Loading hospitals...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                        {error}
                    </div>
                )}

                {!loading && hospitals.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hospitals.map((hospital) => (
                            <div
                                key={hospital._id}
                                onClick={() => handleHospitalClick(hospital)}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer transform hover:scale-105"
                            >
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                                        {hospital.name}
                                    </h3>

                                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <span className="font-semibold text-gray-700 mr-2">ID:</span>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                {hospital._id}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold text-gray-700 mr-2">Longitude:</span>
                                            <span>{hospital.lng.toFixed(6)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-semibold text-gray-700 mr-2">Latitude:</span>
                                            <span>{hospital.lat.toFixed(6)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleHospitalClick(hospital);
                                        }}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && hospitals.length === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                        <p className="text-blue-700 text-lg">No hospitals found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalList;
