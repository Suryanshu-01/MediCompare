import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { getRejectedHospitals } from '../services/admin.service';

export default function AdminRejectedHospitals() {
    const { user } = useContext(AuthContext);
    const adminName = user?.name || '';

    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getRejectedHospitals();
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

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-6xl mx-auto py-4 px-8 flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">MediCompare</span>
                    <span className="text-blue-600">{adminName}</span>
                </div>
            </header>

            <main className="p-8 max-w-6xl mx-auto">
                {loading && <p>Loading rejected hospitals...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && hospitals.length === 0 && (
                    <p>No rejected hospitals.</p>
                )}

                {!loading && !error && hospitals.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white shadow rounded-lg">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Email</th>
                                    <th className="px-4 py-2 border">Phone</th>
                                    <th className="px-4 py-2 border">Address</th>
                                    <th className="px-4 py-2 border">Document</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hospitals.map((h) => (
                                    <tr key={h._id}>
                                        <td className="px-4 py-2 border">{h.name}</td>
                                        <td className="px-4 py-2 border">{h.email}</td>
                                        <td className="px-4 py-2 border">{h.phone}</td>
                                        <td className="px-4 py-2 border">{h.address}</td>
                                        <td className="px-4 py-2 border">
                                            {h.document ? (
                                                <a
                                                    href={h.document.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}