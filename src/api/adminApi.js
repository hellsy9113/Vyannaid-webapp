import { api } from "./authApi";

// GET /admin/stats
export const getPlatformStats = () => api.get("/admin/stats");

// GET /admin/users?role=student|counsellor|admin
export const getAllUsers = (role) =>
  api.get("/admin/users", { params: role ? { role } : {} });

// GET /admin/users/:id
export const getUserById = (id) => api.get(`/admin/users/${id}`);

// PATCH /admin/users/:id/role — { role }
export const changeUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });

// DELETE /admin/users/:id
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// POST /admin/assign — { counsellorId, studentId }
export const assignStudentToCounsellor = (counsellorId, studentId) =>
  api.post("/admin/assign", { counsellorId, studentId });

// DELETE /admin/assign — { counsellorId, studentId }
export const unassignStudentFromCounsellor = (counsellorId, studentId) =>
  api.delete("/admin/assign", { data: { counsellorId, studentId } });

// POST /admin/users  (create counsellor / admin staff account)
export const createStaffUser = (data) =>
  api.post("/admin/users", data);

// GET /admin/counsellors/:id/students  — students assigned to a counsellor
export const getCounsellorStudents = (counsellorId) =>
  api.get(`/admin/counsellors/${counsellorId}/students`);