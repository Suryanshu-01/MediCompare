export default function ServiceTable({ services, onEdit, onDisable, deletingId }) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No services added yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {services.map((service) => (
            <tr key={service._id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{service.displayName}</div>
                <div className="text-xs text-gray-500">{service.loincCode}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{service.category || '—'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">₹{service.price}</td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onEdit(service)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDisable(service._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                  disabled={deletingId === service._id}
                >
                  {deletingId === service._id ? 'Disabling...' : 'Disable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
