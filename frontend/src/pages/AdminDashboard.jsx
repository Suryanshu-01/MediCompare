import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    getPendingHospitals,
    verifyHospital,
    rejectHospital,
} from '../services/admin.service';
import { ROUTES } from '../utils/constants';

// simple placeholder for admin area
export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const adminName = user?.name || '';
    const navigate = useNavigate();

    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({}); // track individual row actions

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getPendingHospitals();
                // sort by createdAt descending
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setHospitals(data);
            } catch (err) {
                setError(err.message || 'Failed to load hospitals');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleVerify = async (id) => {
        setActionLoading((s) => ({ ...s, [id]: true }));
        try {
            await verifyHospital(id);
            // remove from list
            setHospitals((prev) => prev.filter((h) => h._id !== id));
        } catch (err) {
            setError(err.message || 'Failed to verify hospital');
        } finally {
            setActionLoading((s) => ({ ...s, [id]: false }));
        }
    };

    const handleReject = async (id) => {
        setActionLoading((s) => ({ ...s, [id]: true }));
        try {
            await rejectHospital(id);
            setHospitals((prev) => prev.filter((h) => h._id !== id));
        } catch (err) {
            setError(err.message || 'Failed to reject hospital');
        } finally {
            setActionLoading((s) => ({ ...s, [id]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Header Bar */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-semibold text-blue-600 tracking-tight">Medi-Compare</span>
                        <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-500">
                            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
                            <span className="hover:text-blue-600 cursor-pointer">Hospitals</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-900 uppercase">{adminName}</p>
                            <p className="text-xs text-gray-500">System Administrator</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {adminName?.charAt(0) || 'A'}
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                navigate(ROUTES.LOGIN);
                            }}
                            className="bg-red-600 text-white px-5 py-2 rounded-md text-sm font-bold hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Pending Approvals</h1>
                    <p className="text-gray-500 mt-1"></p>
                </div>

                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {!loading && !error && hospitals.length === 0 && (
                    <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-400 italic">No pending hospitals at the moment.</p>
                    </div>
                )}

                {!loading && !error && hospitals.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital Details</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {hospitals.map((h) => (
                                    <tr key={h._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{h.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-50">{h.address}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="text-gray-900">{h.email}</div>
                                            <div className="text-gray-500">{h.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {h.location?.coordinates ?
                                                `${h.location.coordinates[1].toFixed(2)}, ${h.location.coordinates[0].toFixed(2)}`
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {h.document ? (
                                                <a
                                                    href={h.document.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 font-medium hover:underline text-sm"
                                                >
                                                    View PDF
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Missing</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-md hover:bg-green-600 transition-all disabled:opacity-50"
                                                disabled={actionLoading[h._id]}
                                                onClick={() => handleVerify(h._id)}
                                            >
                                                APPROVE
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-md hover:bg-red-600 transition-all disabled:opacity-50"
                                                disabled={actionLoading[h._id]}
                                                onClick={() => handleReject(h._id)}
                                            >
                                                REJECT
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Secondary Action Button - Styled like "Add Service" in your image */}
            <button
                className="fixed bottom-8 right-8 bg-[#8B5CF6] text-white px-6 py-3 rounded-lg shadow-xl hover:scale-105 transition-transform font-bold flex items-center gap-2"
                onClick={() => navigate(ROUTES.ADMIN_REJECTED_HOSPITALS)}
            >
                <span>View Rejected Hospitals</span>
            </button>
        </div>
    );
}
