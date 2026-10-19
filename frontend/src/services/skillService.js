import api from "./api";

export const getSkills = async () => {
  const response = await api.get("/skills");
  return response.data.skills;
};

export const createSkill = async (skillData) => {
  const response = await api.post("/skills", skillData);
  return response.data.skill;
};

export const updateSkill = async (id, skillData) => {
  const response = await api.put(`/skills/${id}`, skillData);
  return response.data.skill;
};

export const deleteSkill = async (id) => {
  const response = await api.delete(`/skills/${id}`);
  return response.data;
};