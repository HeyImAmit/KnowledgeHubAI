import axios from "axios";

const aiClient = axios.create({
  baseURL: process.env.AI_SERVICE_URL,
  timeout: 10000,
});

export async function checkAIService() {
  const response = await aiClient.get("/api/health");

  return response.data;
}