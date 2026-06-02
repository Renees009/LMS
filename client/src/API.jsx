const API_BASE = "http://127.0.0.1:8000";

export default async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("lms_token");

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });


  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const error = new Error("Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return { data, status: res.status };
}


