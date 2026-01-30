import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import UserNavbar from '../components/layout/UserNavbar';

import 'mapbox-gl/dist/mapbox-gl.css';

const UserDashboard = () => {
    const mapContainerRef = useRef();
    const mapRef = useRef();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch hospitals
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

    // Initialize map
    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoicHJha2hhci0yMDA1LTA5IiwiYSI6ImNta2ppc25kNzE0bm0zZ3IxOWg5ZXlzdWcifQ.QVPY73GP8VqBxJWYko0cGg';

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [78.163446, 26.200719], // starting position [lng, lat]
            style: 'mapbox://styles/mapbox/light-v11',
            zoom: 13 // starting zoom
        });
        // Fetch hospitals when map is loaded
        mapRef.current.on('load', () => {
            fetchHospitals();
            fetch("http://localhost:5000/api/hospitalslocation")
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        data.data.forEach(({ _id, name, lng, lat, minFees }) => {
                            const popup = new mapboxgl.Popup({
                                offset: 25,
                                closeButton: false,
                                closeOnClick: false
                            })
                                .setHTML(`
                                    <div class="popup-card">
                                        <h3 class="popup-title" style="margin: 0; padding: 5px; font-size: 14px; font-weight: bold;">
                                            ${name}
                                        </h3>
                                        <h4>${minFees}</h4>
                                    </div>
                                `);

                            const marker = new mapboxgl.Marker({ color: "black" })
                                .setLngLat([lng, lat])
                                .setPopup(popup)
                                .addTo(mapRef.current);

                            const markerElement = marker.getElement();

                            // Show popup on hover
                            markerElement.addEventListener('mouseenter', () => {
                                marker.togglePopup();
                            });

                            // Hide popup on mouse leave
                            markerElement.addEventListener('mouseleave', () => {
                                marker.togglePopup();
                            });

                            // Navigate on click
                            markerElement.addEventListener('click', (e) => {
                                e.stopPropagation();
                                navigate(`/hospital/${_id}`, { state: { name, lng, lat, hospitalId: _id } });
                            });

                        });
                    }
                })
                .catch(error => console.error('Error fetching hospitals:', error));
        });

    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <UserNavbar />

            {/* Header Section */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome to User Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Explore hospitals and find the best services</p>
                </div>
            </div>

            {/* Main Content - Two Column Layout */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Side - Hospital List */}
                    <div className="flex flex-col justify-start">
                        <div className="bg-white rounded-lg shadow-lg p-8 overflow-y-auto" style={{ maxHeight: '600px' }}>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 sticky top-0 bg-white">

                            </h2>

                            {loading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <p className="ml-4 text-gray-600">Loading hospitals...</p>
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                                    {error}
                                </div>
                            )}

                            {!loading && hospitals.length > 0 && (
                                <div className="space-y-4">
                                    {hospitals.map((hospital) => (
                                        <div
                                            key={hospital._id}
                                            onClick={() => handleHospitalClick(hospital)}
                                            className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-md transition cursor-pointer border-l-4 border-blue-600"
                                        >
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                {hospital.name}
                                            </h3>

                                            <div className="space-y-1 text-sm text-gray-700">
                                                <div className="flex items-center">
                                                    <span className="font-semibold mr-2">Lng:</span>
                                                    <span>{hospital.lng.toFixed(6)}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="font-semibold mr-2">Lat:</span>
                                                    <span>{hospital.lat.toFixed(6)}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleHospitalClick(hospital);
                                                }}
                                                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && hospitals.length === 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                                    <p className="text-blue-700">No hospitals found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Map */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-96 lg:h-auto">
                        <div
                            style={{ height: '600px' }}
                            ref={mapContainerRef}
                            className="map-container w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;