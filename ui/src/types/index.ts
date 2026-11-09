/** An employee record as returned by GET /employees and GET /employees/{id}. */
export interface Employee {
  employee_id: string
  name: string
  department: string
  role: string
  start_date: string
}

/** Payload for creating a new employee via POST /employees. */
export interface CreateEmployeePayload {
  name: string
  department: string
  role: string
  start_date: string
}

/** A leave record as returned by GET /employees/{id}/leave. */
export interface LeaveRecord {
  employee_id: string
  start_date: string
  end_date: string
  note?: string
}

/** Payload for creating a leave record via POST /employees/{id}/leave. */
export interface CreateLeavePayload {
  start_date: string
  end_date: string
  note?: string
}

/** Payload for updating a leave record via PUT /employees/{id}/leave/{start_date}. */
export interface UpdateLeavePayload {
  end_date: string
  note?: string
}

/** Response from HR request endpoints (POST /hr-requests/* returns 202 + execution ARN). */
export interface HrRequestResponse {
  execution_arn: string
  status?: string
}

/** A single message in the AI chat panel's conversation history. */
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
