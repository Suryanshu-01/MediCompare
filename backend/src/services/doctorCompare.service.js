import Doctor from "../models/doctor.model.js";

const MIN_IDS = 2;
const MAX_IDS = 4;

const roundToTwo = (value) => Math.round(value * 100) / 100;

const clamp = (value, min = 0, max = 100) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const normalize = (value, min, max, sameValue = 100) => {
  if (max === min) return sameValue;
  return clamp(((value - min) / (max - min)) * 100);
};

const getQualificationScore = (qualification = []) => {
  const values = Array.isArray(qualification)
    ? qualification.map((item) => String(item).toUpperCase())
    : [String(qualification).toUpperCase()];

  const hasSuperSpeciality = values.some(
    (item) =>
      item.includes("DM") || item.includes("MCH") || item.includes("M.CH"),
  );

  if (hasSuperSpeciality) return 100;
  if (values.some((item) => item.includes("MD"))) return 80;
  if (values.some((item) => item.includes("MBBS"))) return 60;
  return 50;
};

const getAvailabilityScore = (availability = {}) => {
  const days = Array.isArray(availability?.days) ? availability.days : [];
  const normalizedDays = days.map((day) => String(day).toLowerCase());
  const uniqueDays = [...new Set(normalizedDays)];

  const weekendOnly =
    uniqueDays.length > 0 &&
    uniqueDays.every((day) => day.includes("sat") || day.includes("sun"));

  if (weekendOnly) return 40;
  if (uniqueDays.length >= 6) return 100;
  if (uniqueDays.length >= 3 && uniqueDays.length <= 5) return 70;
  if (uniqueDays.length > 0) return 55;
  return 0;
};

const getExperienceBadge = (experience) => {
  const years = Number(experience) || 0;

  if (years <= 3) return "Junior";
  if (years < 10) return "Experienced";
  if (years < 20) return "Senior Specialist";
  return "Veteran";
};

const pickBest = (items, getter, mode = "max") => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return items.reduce((best, current) => {
    if (!best) return current;
    const bestValue = getter(best);
    const currentValue = getter(current);

    if (mode === "min") {
      return currentValue < bestValue ? current : best;
    }

    return currentValue > bestValue ? current : best;
  }, null);
};

const validateIdsCount = (ids = []) => {
  if (ids.length < MIN_IDS || ids.length > MAX_IDS) {
    throw new Error("Please select between 2 and 4 doctors for comparison");
  }
};

const compareDoctorsByIds = async (ids = []) => {
  const uniqueIds = [...new Set(ids)];
  validateIdsCount(uniqueIds);

  const doctors = await Doctor.find({ _id: { $in: uniqueIds } })
    .select(
      "name specialization qualification experience consultationFee availability consultationType doctorRating hospitalId",
    )
    .populate("hospitalId", "name")
    .lean();

  if (doctors.length !== uniqueIds.length) {
    throw new Error("One or more doctors were not found");
  }

  const doctorsById = new Map(
    doctors.map((doctor) => [String(doctor._id), doctor]),
  );
  const orderedDoctors = uniqueIds.map((id) => doctorsById.get(String(id)));

  const experienceValues = orderedDoctors.map(
    (doctor) => Number(doctor.experience) || 0,
  );
  const feeValues = orderedDoctors.map(
    (doctor) => Number(doctor.consultationFee) || 0,
  );

  const minExperience = Math.min(...experienceValues);
  const maxExperience = Math.max(...experienceValues);
  const minFee = Math.min(...feeValues);
  const maxFee = Math.max(...feeValues);

  const scores = {};

  orderedDoctors.forEach((doctor) => {
    const doctorId = String(doctor._id);

    const ratingScore = clamp((Number(doctor.doctorRating) || 0) * 10);
    const experienceScore = normalize(
      Number(doctor.experience) || 0,
      minExperience,
      maxExperience,
    );
    const qualificationScore = getQualificationScore(doctor.qualification);
    const availabilityScore = getAvailabilityScore(doctor.availability);
    const normalizedFee = normalize(
      Number(doctor.consultationFee) || 0,
      minFee,
      maxFee,
      0,
    );
    const priceScore = clamp(100 - normalizedFee);

    const smartScore =
      ratingScore * 0.4 +
      experienceScore * 0.25 +
      qualificationScore * 0.15 +
      availabilityScore * 0.1 +
      priceScore * 0.1;

    scores[doctorId] = {
      smartScore: roundToTwo(smartScore),
      experienceBadge: getExperienceBadge(Number(doctor.experience) || 0),
      breakdown: {
        rating: roundToTwo(ratingScore),
        experience: roundToTwo(experienceScore),
        qualification: roundToTwo(qualificationScore),
        availability: roundToTwo(availabilityScore),
        affordability: roundToTwo(priceScore),
      },
    };
  });

  const doctorsResponse = orderedDoctors.map((doctor) => ({
    _id: doctor._id,
    name: doctor.name,
    specialization: doctor.specialization,
    qualification: doctor.qualification,
    experience: doctor.experience,
    consultationFee: doctor.consultationFee,
    availability: doctor.availability,
    consultationType: doctor.consultationType,
    doctorRating: doctor.doctorRating,
    hospitalId: doctor.hospitalId?._id || doctor.hospitalId,
    hospitalName: doctor.hospitalId?.name || "Unknown Hospital",
  }));

  const highestRated = pickBest(
    doctorsResponse,
    (doctor) => Number(doctor.doctorRating) || 0,
    "max",
  );
  const mostAffordable = pickBest(
    doctorsResponse,
    (doctor) => Number(doctor.consultationFee) || 0,
    "min",
  );
  const mostExperienced = pickBest(
    doctorsResponse,
    (doctor) => Number(doctor.experience) || 0,
    "max",
  );
  const bestOverall = pickBest(
    doctorsResponse,
    (doctor) => scores[String(doctor._id)]?.smartScore || 0,
    "max",
  );

  const insights = {
    highestRated: highestRated
      ? {
          doctorId: highestRated._id,
          name: highestRated.name,
          value: roundToTwo(Number(highestRated.doctorRating) || 0),
        }
      : null,
    mostAffordable: mostAffordable
      ? {
          doctorId: mostAffordable._id,
          name: mostAffordable.name,
          value: Number(mostAffordable.consultationFee) || 0,
        }
      : null,
    mostExperienced: mostExperienced
      ? {
          doctorId: mostExperienced._id,
          name: mostExperienced.name,
          value: Number(mostExperienced.experience) || 0,
        }
      : null,
    bestOverall: bestOverall
      ? {
          doctorId: bestOverall._id,
          name: bestOverall.name,
          value: scores[String(bestOverall._id)]?.smartScore || 0,
        }
      : null,
  };

  return {
    doctors: doctorsResponse,
    scores,
    insights,
  };
};

export { compareDoctorsByIds, MIN_IDS, MAX_IDS };
