const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      message = body.detail ?? JSON.stringify(body)
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string
  token_type: string
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const body = new URLSearchParams({ username: email, password })
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail ?? "Login failed")
  }
  return res.json()
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  name: string
}

export async function register(email: string, password: string, name: string): Promise<User> {
  return request<User>("/users/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  })
}

export async function getMe(): Promise<User> {
  return request<User>("/users/me")
}

// ── Organizations ─────────────────────────────────────────────────────────────

export interface Organization {
  id: number
  name: string
}

export interface Membership {
  id: number
  role: "admin" | "member"
  organization: Organization
}

export interface Member {
  id: number
  role: "admin" | "member"
  user: User
}

export async function getOrgs(): Promise<Membership[]> {
  return request<Membership[]>("/orgs")
}

export async function createOrg(name: string): Promise<Organization> {
  return request<Organization>("/orgs", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export async function getMembers(orgId: number): Promise<Member[]> {
  return request<Member[]>(`/orgs/${orgId}/members`)
}

export async function addMember(orgId: number, userId: number, role: "admin" | "member"): Promise<Member> {
  return request<Member>(`/orgs/${orgId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, role }),
  })
}

export async function removeMember(orgId: number, userId: number): Promise<void> {
  return request<void>(`/orgs/${orgId}/members/${userId}`, { method: "DELETE" })
}

// ── Projects ──────────────────────────────────────────────────────────────────

export interface Project {
  id: number
  name: string
  description: string | null
  organization_id: number
}

export async function getProjects(orgId: number): Promise<Project[]> {
  return request<Project[]>(`/orgs/${orgId}/projects`)
}

export async function createProject(orgId: number, name: string, description?: string): Promise<Project> {
  return request<Project>(`/orgs/${orgId}/projects`, {
    method: "POST",
    body: JSON.stringify({ name, description: description ?? null }),
  })
}

export async function updateProject(projectId: number, name: string, description?: string): Promise<Project> {
  return request<Project>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify({ name, description: description ?? null }),
  })
}

export async function deleteProject(projectId: number): Promise<void> {
  return request<void>(`/projects/${projectId}`, { method: "DELETE" })
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done"

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  project_id: number
  created_by: number
}

export async function getTasks(projectId: number): Promise<Task[]> {
  return request<Task[]>(`/projects/${projectId}/tasks`)
}

export async function createTask(
  projectId: number,
  title: string,
  description?: string
): Promise<Task> {
  return request<Task>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title, description: description ?? null, status: "todo" }),
  })
}

export async function updateTask(
  taskId: number,
  fields: Partial<{ title: string; description: string | null; status: TaskStatus }>
): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  })
}

export async function deleteTask(taskId: number): Promise<void> {
  return request<void>(`/tasks/${taskId}`, { method: "DELETE" })
}
