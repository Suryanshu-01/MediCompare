import apiClient from "./apiClient";

const searchLoincTests = async (query, category) => {
  try {
    const response = await apiClient.get("/services/loinc/search", {
      params: { q: query, category },
    });
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
};

export default { searchLoincTests };
