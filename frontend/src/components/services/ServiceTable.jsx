export default function ServiceTable({ services, onEdit, onDisable, deletingId }) {

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-500 text-sm">No services added yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

      <table className="min-w-full">

        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Test
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Category
            </th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Price
            </th>

            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">

          {services.map((service) => (
            <tr
              key={service._id}
              className="hover:bg-gray-50 transition"
            >

              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">
                  {service.displayName}
                </div>

                <div className="text-xs text-gray-500">
                  {service.loincCode}
                </div>
              </td>

              <td className="px-6 py-4 text-sm text-gray-700">
                {service.category || "—"}
              </td>

              <td className="px-6 py-4 text-sm font-medium text-gray-800">
                ₹{service.price}
              </td>

              <td className="px-6 py-4 text-right">

                <button
                  onClick={() => onEdit(service)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition mr-3"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDisable(service._id)}
                  disabled={deletingId === service._id}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
                >
                  {deletingId === service._id ? "Disabling..." : "Disable"}
                </button>

              </td>
            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
}