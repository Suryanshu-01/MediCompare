import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import UserNavbar from '../components/layout/UserNavbar'; import useDebounce from '../hooks/useDebounce';
import { searchAll } from '../services/search.service';
import 'mapbox-gl/dist/mapbox-gl.css';

const UserDashboard = () => {
    const mapContainerRef = useRef();
    const mapRef = useRef();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const debouncedQuery = useDebounce(searchQuery, 400);
    const [searchResults, setSearchResults] = useState({ hospitals: [], doctors: [], services: [] });
    const [searchLoading, setSearchLoading] = useState(false);
    const [sortMode, setSortMode] = useState(null); // 'rating' | 'fees' | null

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

    const handleDoctorClick = (doctor) => {
        const hospital = hospitals.find((h) => h._id === doctor.hospitalId);
        if (!hospital) {
            console.warn('Hospital not found for doctor', doctor);
            return;
        }
        handleHospitalClick(hospital);
    };

    const handleServiceClick = (service) => {
        const hospital = hospitals.find((h) => h._id === service.hospitalId);
        if (!hospital) {
            console.warn('Hospital not found for service', service);
            return;
        }
        handleHospitalClick(hospital);
    };

    // helpers: get hospital-level metrics for a given doctor/service
    const getDoctorHospital = (doctor) =>
        hospitals.find((h) => h._id === doctor.hospitalId);

    const getServiceHospital = (service) =>
        hospitals.find((h) => h._id === service.hospitalId);

    const getDoctorRatingValue = (doctor) => {
        const hosp = getDoctorHospital(doctor);
        return typeof hosp?.doctorRating === 'number' ? hosp.doctorRating : 0;
    };

    const getServiceRatingValue = (service) => {
        const hosp = getServiceHospital(service);
        return typeof hosp?.serviceRating === 'number' ? hosp.serviceRating : 0;
    };

    // Derived, sorted lists for doctors and services based on sortMode
    const getSortedDoctors = () => {
        if (sortMode === 'rating') {
            return [...searchResults.doctors].sort(
                (a, b) => getDoctorRatingValue(b) - getDoctorRatingValue(a)
            );
        }
        if (sortMode === 'fees') {
            return [...searchResults.doctors].sort(
                (a, b) =>
                    (a.consultationFee ?? Number.MAX_VALUE) -
                    (b.consultationFee ?? Number.MAX_VALUE)
            );
        }
        return searchResults.doctors;
    };

    const getSortedServices = () => {
        if (sortMode === 'rating') {
            return [...searchResults.services].sort(
                (a, b) => getServiceRatingValue(b) - getServiceRatingValue(a)
            );
        }
        if (sortMode === 'fees') {
            return [...searchResults.services].sort(
                (a, b) =>
                    (a.price ?? Number.MAX_VALUE) -
                    (b.price ?? Number.MAX_VALUE)
            );
        }
        return searchResults.services;
    };

    // run search when debounced query changes
    useEffect(() => {
        const runSearch = async () => {
            if (!debouncedQuery) {
                setSearchResults({ hospitals: [], doctors: [], services: [] });
                return;
            }
            setSearchLoading(true);
            try {
                const data = await searchAll(debouncedQuery);
                setSearchResults(data);
            } catch (err) {
                console.error('Search error', err);
            } finally {
                setSearchLoading(false);
            }
        };
        runSearch();
    }, [debouncedQuery]);

    // Initialize map
    useEffect(() => {
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [78.163446, 26.200719], // default start position [lng, lat]
            style: 'mapbox://styles/mapbox/light-v11',
            zoom: 13 // starting zoom
        });

        // attempt to get user's geolocation and recenter map
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLng = position.coords.longitude;
                    const userLat = position.coords.latitude;
                    if (mapRef.current) {
                        mapRef.current.setCenter([userLng, userLat]);
                        mapRef.current.setZoom(12);
                        // add a marker for the user's location
                        new mapboxgl.Marker({ color: 'blue' })
                            .setLngLat([userLng, userLat])
                            .addTo(mapRef.current);
                    }
                },
                (err) => {
                    console.warn('Geolocation failed or denied:', err.message);
                }
            );
        }

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

            {/* Search bar */}
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search hospitals, doctors, services..."
                    className="flex-1 border rounded px-4 py-2"
                />
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() =>
                            setSortMode((prev) => (prev === 'rating' ? null : 'rating'))
                        }
                        className={`px-4 py-2 text-sm font-semibold rounded-lg border ${
                            sortMode === 'rating'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Rating
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            setSortMode((prev) => (prev === 'fees' ? null : 'fees'))
                        }
                        className={`px-4 py-2 text-sm font-semibold rounded-lg border ${
                            sortMode === 'fees'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Fees
                    </button>
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

                            {/* search results */}
                            {searchQuery && (
                                <div className="mb-4">
                                    {searchLoading ? (
                                        <p>Searching...</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {searchResults.hospitals.length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold">Hospitals</h3>
                                                    {searchResults.hospitals.map((h) => (
                                                        <div
                                                            key={h._id}
                                                            onClick={() => handleHospitalClick(h)}
                                                            className="p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50"
                                                        >
                                                            {h.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {getSortedDoctors().length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold">Doctors</h3>
                                                    {getSortedDoctors().map((d) => (
                                                        <div
                                                            key={d._id}
                                                            onClick={() => handleDoctorClick(d)}
                                                            className="p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                                                        >
                                                            <span>
                                                                {d.name} ({d.specialization})
                                                            </span>
                                                            {sortMode === 'rating' && (
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {(() => {
                                                                        const rating = getDoctorRatingValue(d);
                                                                        return rating > 0
                                                                            ? `${rating.toFixed(1)}/10`
                                                                            : 'N/A';
                                                                    })()}
                                                                </span>
                                                            )}
                                                            {sortMode === 'fees' && (
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {typeof d.consultationFee === 'number'
                                                                        ? `₹${d.consultationFee}`
                                                                        : 'N/A'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {getSortedServices().length > 0 && (
                                                <div>
                                                    <h3 className="font-semibold">Services</h3>
                                                    {getSortedServices().map((s) => (
                                                        <div
                                                            key={s._id}
                                                            onClick={() => handleServiceClick(s)}
                                                            className="p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                                                        >
                                                            <span>
                                                                {s.displayName} [{s.category}]
                                                            </span>
                                                            {sortMode === 'rating' && (
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {(() => {
                                                                        const rating = getServiceRatingValue(s);
                                                                        return rating > 0
                                                                            ? `${rating.toFixed(1)}/10`
                                                                            : 'N/A';
                                                                    })()}
                                                                </span>
                                                            )}
                                                            {sortMode === 'fees' && (
                                                                <span className="text-xs font-semibold text-gray-700">
                                                                    {typeof s.price === 'number'
                                                                        ? `₹${s.price}`
                                                                        : 'N/A'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {searchResults.hospitals.length === 0 &&
                                                searchResults.doctors.length === 0 &&
                                                searchResults.services.length === 0 && (
                                                    <p>No results found</p>
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}

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

                            {!loading && !searchQuery && hospitals.length > 0 && (
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
                                                    <span className="font-semibold mr-2">Address:</span>
                                                    <span>{hospital.address || 'Not available'}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                                                    <span>
                                                        <span className="font-semibold">Doctor Rating:</span>{' '}
                                                        {typeof hospital.doctorRating === 'number'
                                                            ? `${hospital.doctorRating.toFixed(1)}/10`
                                                            : 'N/A'}
                                                    </span>
                                                    <span>
                                                        <span className="font-semibold">Service Rating:</span>{' '}
                                                        {typeof hospital.serviceRating === 'number'
                                                            ? `${hospital.serviceRating.toFixed(1)}/10`
                                                            : 'N/A'}
                                                    </span>
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