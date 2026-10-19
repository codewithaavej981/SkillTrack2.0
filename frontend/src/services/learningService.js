import api from "./api";

export const getLearningResources = async () => {
  const response = await api.get("/learning");
  return response.data;
};

export const createLearningResource = async (data) => {
  const response = await api.post("/learning", data);
  return response.data;
};

export const updateLearningResource = async (id, data) => {
  const response = await api.put(`/learning/${id}`, data);
  return response.data;
};

export const deleteLearningResource = async (id) => {
  const response = await api.delete(`/learning/${id}`);
  return response.data;
};