import axios from "axios";

const CATEGORY_MAP = {
  "Blood Test": "BLOOD_TEST",
  "Urine Test": "URINE_TEST",
  Imaging: "IMAGING",
};

const CATEGORY_KEYWORDS = {
  BLOOD_TEST: [
    "blood",
    "serum",
    "plasma",
    "hemoglobin",
    "glucose",
    "cholesterol",
    "cbc",
    "platelet",
    "wbc",
    "rbc",
    "hematology",
    "chemistry",
    "coagulation",
    "lipid",
    "thyroid",
    "hormone",
    "enzyme",
    "electrolyte",
    "protein",
    "vitamin",
    "mineral",
  ],
  URINE_TEST: [
    "urine",
    "urinalysis",
    "albumin",
    "creatinine",
    "protein",
    "kidney",
  ],
  IMAGING: [
    "x-ray",
    "ct",
    "mri",
    "ultrasound",
    "radiograph",
    "scan",
    "echo",
    "doppler",
  ],
};

const CATEGORY_EXCLUSIONS = {
  BLOOD_TEST: [
    "urine",
    "stool",
    "x-ray",
    "ct",
    "mri",
    "ultrasound",
    "ecg",
    "ekg",
  ],
  URINE_TEST: ["blood", "serum", "plasma", "x-ray", "ct", "mri", "ultrasound"],
  IMAGING: ["blood", "serum", "plasma", "urine"],
};

const EXCLUDE_KEYWORDS = [
  "machine",
  "device",
  "instrument",
  "survey",
  "questionnaire",
  "assessment",
  "form",
  "score",
  "note",
  "panel",
];

const MAX_RESULTS = 200;

export const searchLoincTests = async (req, res) => {
  try {
    const { q, category } = req.query;
    const query = q?.trim();

    if (!query || query.length < 2)
      return res.status(400).json({
        success: false,
        message: "Query must be at least 2 characters",
      });

    if (!category)
      return res
        .status(400)
        .json({ success: false, message: "Category is required" });

    const normalizedCategory = CATEGORY_MAP[category] || category;

    if (!CATEGORY_KEYWORDS[normalizedCategory])
      return res
        .status(400)
        .json({ success: false, message: "Invalid category" });

    const apiUrl = `https://clinicaltables.nlm.nih.gov/api/loinc_items/v3/search?terms=${encodeURIComponent(query)}&maxList=${MAX_RESULTS}`;

    const response = await axios.get(apiUrl, { timeout: 5000 });

    const codes = response.data?.[1] || [];
    const nameGroups = response.data?.[3] || [];

    const exclusions = CATEGORY_EXCLUSIONS[normalizedCategory] || [];
    const preferred = CATEGORY_KEYWORDS[normalizedCategory] || [];

    const results = codes
      .map((code, index) => {
        const name = nameGroups[index]?.[0];
        if (!name) return null;

        const lower = name.toLowerCase();
        const queryLower = query.toLowerCase();
        let score = 0;

        if (EXCLUDE_KEYWORDS.some((k) => lower.includes(k))) return null;
        if (exclusions.some((k) => lower.includes(k))) return null;

        if (lower.includes(queryLower)) score += 50;

        queryLower.split(" ").forEach((word) => {
          if (lower.includes(word)) score += 10;
        });

        preferred.forEach((k) => {
          if (lower.includes(k)) score += 5;
        });

        if (lower.includes("serum") || lower.includes("plasma")) score += 8;
        if (lower.includes("unspecified") || lower.includes("other"))
          score -= 10;

        return { loincCode: code, displayName: name, score };
      })
      .filter(Boolean)
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...rest }) => rest);

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    console.error("❌ LOINC ERROR:", err.message);
    console.error("Response status:", err.response?.status);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch LOINC tests" });
  }
};
