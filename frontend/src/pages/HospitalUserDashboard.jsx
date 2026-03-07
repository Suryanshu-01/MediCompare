import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../components/layout/UserNavbar';
import doctorService from '../services/doctor.service';
import servicesService from '../services/services.service';
import ratingService from '../services/rating.service';

const HospitalUserDashboard = () => {
    const location = useLocation();
    const { hospitalId } = useParams();
    const navigate = useNavigate();

    // Get hospital data from location state
    const hospitalData = location.state || {};
    const { name } = hospitalData;

    // States
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingServices, setLoadingServices] = useState(true);
    const [error, setError] = useState('');
    const [doctorRating, setDoctorRating] = useState(null);
    const [serviceRating, setServiceRating] = useState(null);
    const [showDoctorRatingModal, setShowDoctorRatingModal] = useState(false);
    const [showServiceRatingModal, setShowServiceRatingModal] = useState(false);
    const [doctorRatingInput, setDoctorRatingInput] = useState(0);
    const [serviceRatingInput, setServiceRatingInput] = useState(0);
    const [submittingDoctorRating, setSubmittingDoctorRating] = useState(false);
    const [submittingServiceRating, setSubmittingServiceRating] = useState(false);

    // Fetch doctors and services on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch doctors
                const doctorsResponse = await doctorService.getDoctorsByHospitalId(hospitalId);
                if (doctorsResponse.success) {
                    setDoctors(doctorsResponse.data || []);
                }
                setLoadingDoctors(false);

                // Fetch services
                const servicesResponse = await servicesService.getServicesByHospitalId(hospitalId);
                setServices(servicesResponse || []);
                setLoadingServices(false);

                // Fetch existing ratings
                const ratingsResponse = await ratingService.getHospitalRatings(hospitalId);
                if (ratingsResponse.success) {
                    setDoctorRating(ratingsResponse.doctorRating ?? null);
                    setServiceRating(ratingsResponse.serviceRating ?? null);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load hospital details');
                setLoadingDoctors(false);
                setLoadingServices(false);
            }
        };

        if (hospitalId) {
            fetchData();
        }
    }, [hospitalId]);

    // Ensure page opens from the top whenever this dashboard is mounted
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Scroll to section based on URL hash after data loads
    useEffect(() => {
        if (doctors.length > 0 || services.length > 0) {
            const hash = window.location.hash;
            if (hash) {
                const element = document.getElementById(hash.substring(1));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }, [doctors, services]);

    return (
        <div className="min-h-screen bg-gray-50">
            <UserNavbar />

            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <button
                                onClick={() => navigate(-1)}
                                className="mb-4 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
                            >
                                ← Back
                            </button>
                            <h1 className="text-4xl font-bold">{name || 'Hospital Details'}</h1>
                            <p className="text-blue-100 mt-2">Hospital ID: {hospitalId}</p>
                        </div>
                        <div className="text-right text-sm text-blue-100 space-y-1">
                            <p>
                                <span className="font-semibold">Doctor Rating:</span>{' '}
                                {typeof doctorRating === 'number' ? `${doctorRating.toFixed(1)}/10` : 'Not rated yet'}
                            </p>
                            <p>
                                <span className="font-semibold">Service Rating:</span>{' '}
                                {typeof serviceRating === 'number' ? `${serviceRating.toFixed(1)}/10` : 'Not rated yet'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-7xl mx-auto px-8 py-4 mt-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* Doctors Section */}
                <div id="doctors" className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">👨‍⚕️ Doctors</h2>
                    {loadingDoctors ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading doctors...</p>
                        </div>
                    ) : doctors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.map((doctor) => (
                                <div key={doctor._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
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
                                            {doctor.specialization || 'Specialist'}
                                        </p>

                                        {/* Contact Info */}
                                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                                            {doctor.phone && (
                                                <p>
                                                    <span className="font-semibold">📞 Phone:</span> {doctor.phone}
                                                </p>
                                            )}
                                            {doctor.email && (
                                                <p>
                                                    <span className="font-semibold">📧 Email:</span> {doctor.email}
                                                </p>
                                            )}
                                            {doctor.experience && (
                                                <p>
                                                    <span className="font-semibold">📚 Experience:</span> {doctor.experience} years
                                                </p>
                                            )}
                                            {typeof doctor.consultationFee === 'number' && (
                                                <p>
                                                    <span className="font-semibold">💰 Consultation Fee:</span> ₹{doctor.consultationFee}
                                                </p>
                                            )}
                                        </div>

                                        {/* Qualifications */}
                                        {doctor.qualification && doctor.qualification.length > 0 && (
                                            <div className="mb-4">
                                                <p className="font-semibold text-gray-700 mb-2">🎓 Qualifications:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {doctor.qualification.map((qual, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs"
                                                        >
                                                            {qual}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Availability */}
                                        {doctor.availability && (
                                            <div className="bg-green-50 rounded-lg p-3">
                                                <p className="font-semibold text-gray-700 text-sm mb-2">⏰ Availability</p>
                                                <div className="text-xs text-gray-600 space-y-1">
                                                    <p>
                                                        <span className="font-semibold">Days:</span>{' '}
                                                        {doctor.availability.days?.join(', ') || 'Not specified'}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold">Time:</span>{' '}
                                                        {doctor.availability.timeSlots && doctor.availability.timeSlots.length > 0
                                                            ? doctor.availability.timeSlots
                                                                .map((slot) => `${slot.start} - ${slot.end}`)
                                                                .join(', ')
                                                            : 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-500 text-lg">No doctors found for this hospital</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => {
                                setDoctorRatingInput(0);
                                setShowDoctorRatingModal(true);
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            Rate our Doctors
                        </button>
                    </div>
                </div>

                {/* Services Section */}
                <div id="services">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">🏥 Services & Tests</h2>
                    {loadingServices ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Loading services...</p>
                        </div>
                    ) : services.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-blue-600 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-semibold">Service Name</th>
                                        <th className="px-6 py-4 text-left font-semibold">Category</th>
                                        <th className="px-6 py-4 text-left font-semibold">LOINC Code</th>
                                        <th className="px-6 py-4 text-left font-semibold">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service, index) => (
                                        <tr
                                            key={service._id}
                                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                } hover:bg-blue-50 transition border-b`}
                                        >
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                {service.displayName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                    {service.category || 'General'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-mono text-sm">
                                                {service.loincCode || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-blue-600 text-lg">
                                                    ₹{service.price || '0'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-500 text-lg">No services found for this hospital</p>
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
                {showDoctorRatingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-900">Rate our Doctors</h3>
                            <p className="text-sm text-gray-600 mb-3">Tap a star from 1 to 10.</p>
                            <div className="flex justify-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setDoctorRatingInput(value)}
                                        className="text-2xl focus:outline-none"
                                    >
                                        <span className={value <= doctorRatingInput ? 'text-yellow-400' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4">
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
                                        if (!hospitalId || doctorRatingInput === 0) return;
                                        try {
                                            setSubmittingDoctorRating(true);
                                            const res = await ratingService.rateDoctors(hospitalId, doctorRatingInput);
                                            if (res.success) {
                                                setDoctorRating(res.doctorRating);
                                                setShowDoctorRatingModal(false);
                                            }
                                        } catch (e) {
                                            console.error('Failed to submit doctor rating', e);
                                        } finally {
                                            setSubmittingDoctorRating(false);
                                        }
                                    }}
                                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submittingDoctorRating ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showServiceRatingModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-900">Rate our Services</h3>
                            <p className="text-sm text-gray-600 mb-3">Tap a star from 1 to 10.</p>
                            <div className="flex justify-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setServiceRatingInput(value)}
                                        className="text-2xl focus:outline-none"
                                    >
                                        <span className={value <= serviceRatingInput ? 'text-yellow-400' : 'text-gray-300'}>
                                            ★
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4">
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
                                            const res = await ratingService.rateServices(hospitalId, serviceRatingInput);
                                            if (res.success) {
                                                setServiceRating(res.serviceRating);
                                                setShowServiceRatingModal(false);
                                            }
                                        } catch (e) {
                                            console.error('Failed to submit service rating', e);
                                        } finally {
                                            setSubmittingServiceRating(false);
                                        }
                                    }}
                                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {submittingServiceRating ? 'Submitting...' : 'Submit Rating'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HospitalUserDashboard;
