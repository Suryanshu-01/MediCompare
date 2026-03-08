import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "doctorCompareSelection";
const MAX_DOCTOR_COMPARE = 4;
const MIN_DOCTOR_COMPARE = 2;
const COMPARE_EVENT = "doctor-compare-updated";

const hasSameDoctors = (currentValue, incomingValue) =>
  JSON.stringify(currentValue) === JSON.stringify(incomingValue);

const readStoredDoctors = () => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read compare doctors from storage", error);
    return [];
  }
};

const normalizeDoctor = (doctor) => ({
  _id: doctor._id,
  name: doctor.name,
  specialization: doctor.specialization,
  qualification: doctor.qualification,
  experience: doctor.experience,
  consultationFee: doctor.consultationFee,
  availability: doctor.availability,
  consultationType: doctor.consultationType,
  doctorRating: doctor.doctorRating,
  hospitalId: doctor.hospitalId,
  hospitalName: doctor.hospitalName,
});

export default function useDoctorCompare() {
  const [selectedDoctors, setSelectedDoctors] = useState(readStoredDoctors);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedDoctors));
    window.dispatchEvent(new Event(COMPARE_EVENT));
  }, [selectedDoctors]);

  useEffect(() => {
    const syncSelection = () => {
      const incomingDoctors = readStoredDoctors();
      setSelectedDoctors((previousDoctors) =>
        hasSameDoctors(previousDoctors, incomingDoctors)
          ? previousDoctors
          : incomingDoctors,
      );
    };

    window.addEventListener("storage", syncSelection);
    window.addEventListener(COMPARE_EVENT, syncSelection);

    return () => {
      window.removeEventListener("storage", syncSelection);
      window.removeEventListener(COMPARE_EVENT, syncSelection);
    };
  }, []);

  const addDoctor = (doctor) => {
    if (!doctor?._id) {
      return { success: false, message: "Invalid doctor data" };
    }

    if (selectedDoctors.some((item) => item._id === doctor._id)) {
      return { success: false, message: "Doctor already added" };
    }

    if (selectedDoctors.length >= MAX_DOCTOR_COMPARE) {
      return {
        success: false,
        message: `Maximum ${MAX_DOCTOR_COMPARE} doctors allowed`,
      };
    }

    setSelectedDoctors((prev) => [...prev, normalizeDoctor(doctor)]);
    return { success: true, message: "Doctor added for comparison" };
  };

  const removeDoctor = (doctorId) => {
    setSelectedDoctors((prev) =>
      prev.filter((doctor) => doctor._id !== doctorId),
    );
  };

  const clearDoctors = () => {
    setSelectedDoctors([]);
  };

  const selectedIds = useMemo(
    () => selectedDoctors.map((doctor) => doctor._id),
    [selectedDoctors],
  );

  return {
    selectedDoctors,
    selectedIds,
    addDoctor,
    removeDoctor,
    clearDoctors,
    canCompare: selectedDoctors.length >= MIN_DOCTOR_COMPARE,
    minCompare: MIN_DOCTOR_COMPARE,
    maxCompare: MAX_DOCTOR_COMPARE,
  };
}
