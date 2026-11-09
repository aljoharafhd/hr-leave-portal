import { fetchAuthSession } from 'aws-amplify/auth'
import type {
  CreateEmployeePayload,
  CreateLeavePayload,
  Employee,
  HrRequestResponse,
  LeaveRecord,
  UpdateLeavePayload,
} from '../types'

/** Thrown on any non-2xx HTTP response from the backend API. */
export class ApiError extends Error {
  readonly status: number
  readonly body: string

  constructor(
    status: number,
    body: string,
    message?: string,
  ) {
    super(message ?? `API error ${status}: ${body}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/** Retrieve the Cognito JWT for the currently signed-in user. */
async function getBearerToken(): Promise<string> {
  const session = await fetchAuthSession()
  const token = session.tokens?.idToken?.toString()
  if (!token) {
    throw new ApiError(401, '', 'No active Cognito session — please sign in.')
  }
  return token
}

/** Base URL for the REST API — set via VITE_API_URL at build time. */
function apiBase(): string {
  const base = import.meta.env.VITE_API_URL as string | undefined
  if (!base) {
    throw new Error('VITE_API_URL is not configured.')
  }
  // Ensure no trailing slash so callers can use /path without double-slash
  return base.replace(/\/$/, '')
}

/**
 * Perform an authenticated fetch against the backend API.
 * Automatically attaches `Authorization: Bearer <jwt>` and
 * throws `ApiError` on non-2xx responses.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getBearerToken()
  const url = `${apiBase()}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new ApiError(response.status, body)
  }

  // 204 No Content — return empty object cast to T
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Employee endpoints
// ---------------------------------------------------------------------------

/** GET /employees — list all employees. */
export async function getEmployees(): Promise<Employee[]> {
  return apiFetch<Employee[]>('/employees')
}

/** POST /employees — create a new employee record. */
export async function createEmployee(
  payload: CreateEmployeePayload,
): Promise<Employee> {
  return apiFetch<Employee>('/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** GET /employees/{employee_id} — retrieve a single employee. */
export async function getEmployee(employeeId: string): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${encodeURIComponent(employeeId)}`)
}

// ---------------------------------------------------------------------------
// Leave endpoints
// ---------------------------------------------------------------------------

/** GET /employees/{employee_id}/leave — list leave records, optionally filtered by month. */
export async function listLeave(
  employeeId: string,
  month?: string,
): Promise<LeaveRecord[]> {
  const query = month ? `?month=${encodeURIComponent(month)}` : ''
  return apiFetch<LeaveRecord[]>(
    `/employees/${encodeURIComponent(employeeId)}/leave${query}`,
  )
}

/** POST /employees/{employee_id}/leave — create a leave record. */
export async function createLeave(
  employeeId: string,
  payload: CreateLeavePayload,
): Promise<LeaveRecord> {
  return apiFetch<LeaveRecord>(
    `/employees/${encodeURIComponent(employeeId)}/leave`,
    { method: 'POST', body: JSON.stringify(payload) },
  )
}

/** PUT /employees/{employee_id}/leave/{start_date} — update an existing leave record. */
export async function updateLeave(
  employeeId: string,
  startDate: string,
  payload: UpdateLeavePayload,
): Promise<LeaveRecord> {
  return apiFetch<LeaveRecord>(
    `/employees/${encodeURIComponent(employeeId)}/leave/${encodeURIComponent(startDate)}`,
    { method: 'PUT', body: JSON.stringify(payload) },
  )
}

// ---------------------------------------------------------------------------
// HR request endpoints
// ---------------------------------------------------------------------------

/** POST /hr-requests/time-off — submit a time-off request workflow. */
export async function submitTimeOffRequest(payload: {
  user_id: string
  start_date: string
  end_date: string
}): Promise<HrRequestResponse> {
  return apiFetch<HrRequestResponse>('/hr-requests/time-off', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** POST /hr-requests — submit a general HR enquiry workflow. */
export async function submitHrRequest(payload: {
  user_id: string
  prompt: string
}): Promise<HrRequestResponse> {
  return apiFetch<HrRequestResponse>('/hr-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
