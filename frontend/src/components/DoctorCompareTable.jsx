export default function DoctorCompareTable({ doctors, scores }) {
  const rows = [
    {
      key: "specialization",
      label: "Specialization",
      render: (doctor) => doctor.specialization || "N/A",
    },
    {
      key: "qualification",
      label: "Qualification",
      render: (doctor) =>
        Array.isArray(doctor.qualification) && doctor.qualification.length > 0
          ? doctor.qualification.join(", ")
          : "N/A",
    },
    {
      key: "experience",
      label: "Experience",
      render: (doctor) => `${doctor.experience || 0} years`,
    },
    {
      key: "consultationFee",
      label: "Consultation Fee",
      render: (doctor) => `Rs ${doctor.consultationFee || 0}`,
    },
    {
      key: "consultationType",
      label: "Consultation Type",
      render: (doctor) => doctor.consultationType || "N/A",
    },
    {
      key: "availability",
      label: "Availability",
      render: (doctor) => doctor.availability?.days?.join(", ") || "N/A",
    },
    {
      key: "doctorRating",
      label: "Doctor Rating",
      render: (doctor) => `${(doctor.doctorRating || 0).toFixed(1)}/10`,
    },
    {
      key: "smartScore",
      label: "Smart Score",
      render: (doctor) =>
        `${scores?.[doctor._id]?.smartScore?.toFixed(2) || "0.00"}/100`,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Metric
              </th>
              {doctors.map((doctor) => (
                <th
                  key={doctor._id}
                  className="px-4 py-3 text-left text-sm font-semibold"
                >
                  {doctor.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.key}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                  {row.label}
                </td>
                {doctors.map((doctor) => (
                  <td
                    key={`${row.key}-${doctor._id}`}
                    className="px-4 py-3 text-sm text-gray-800 align-top"
                  >
                    {row.render(doctor)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
