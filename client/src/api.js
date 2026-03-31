const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed");
  }

  return response.json();
}

export const api = {
  getDashboard: () => request("/dashboard"),
  getAnalytics: () => request("/analytics"),
  getTasks: () => request("/tasks"),
  addTask: (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  toggleTask: (id) => request(`/tasks/${id}/toggle`, { method: "PATCH" }),
  generatePlan: (payload) => request("/planner/generate", { method: "POST", body: JSON.stringify(payload) }),
  generateQuiz: (payload) => request("/quiz/generate", { method: "POST", body: JSON.stringify(payload) }),
  chat: (payload) => request("/tutor/chat", { method: "POST", body: JSON.stringify(payload) }),
  getProfile: () => request("/profile"),
  saveProfile: (profile) => request("/profile", { method: "PUT", body: JSON.stringify(profile) })
};
