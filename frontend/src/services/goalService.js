import api from "./api";

export const getGoals = async () => {
  const response = await api.get("/goals");
  return response.data.goals;
};

export const createGoal = async (goalData) => {
  const response = await api.post("/goals", goalData);
  return response.data.goal;
};

export const updateGoal = async (id, goalData) => {
  const response = await api.put(`/goals/${id}`, goalData);
  return response.data.goal;
};

export const deleteGoal = async (id) => {
  const response = await api.delete(`/goals/${id}`);
  return response.data;
};