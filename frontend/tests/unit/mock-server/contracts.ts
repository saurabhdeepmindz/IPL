/**
 * @file    contracts.ts
 * @module  MockServer
 *
 * @description
 * The 18 contracts of EPIC-ADM-01 as the mock server knows them (from the Stories document, API-USR, API-ROL and API-PRM). In plain words: each contract has its method, path, success answer and every documented error with its code.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
export interface MockError {
  status: number;
  code: string;
  /** Extra body fields the contract documents for this error, for example a count. */
  extra?: Record<string, unknown>;
}

export interface MockContract {
  id: string;
  method: 'GET' | 'POST' | 'PUT';
  /** Path under /api/v1, with {name} for parameters. */
  path: string;
  successStatus: number;
  success: unknown;
  errors: MockError[];
}

const E401: MockError = { status: 401, code: 'UNAUTHENTICATED' };
const E403: MockError = { status: 403, code: 'FORBIDDEN' };
const E422: MockError = { status: 422, code: 'VALIDATION_FAILED' };
const user = { employeeCode: '10002', name: 'A. Kumar', email: 'a.kumar@example.invalid', department: 'Finance', designation: 'Manager', companies: [{ code: 'IPL', roles: ['Initiator'] }], signIn: 'SSO', status: 'ACTIVE', lastSignIn: '2026-11-20T09:30:00Z' };
const role = { roleId: '11111111-1111-4111-8111-111111111111', name: 'Initiator', description: 'Starts proposals', type: 'STANDARD', userCount: 12, lastChanged: '2026-11-18T10:00:00Z', status: 'ACTIVE' };

/** Every contract, in the order of the Stories document. */
export const CONTRACTS: MockContract[] = [
  { id: 'API-USR-01', method: 'GET', path: '/users', successStatus: 200, success: { items: [user], counts: { all: 1, active: 1, inactive: 0, locked: 0 }, page: 1, pageSize: 25, total: 1 }, errors: [E401, E403, E422] },
  { id: 'API-USR-02', method: 'POST', path: '/users', successStatus: 201, success: { employeeCode: '10003', status: 'ACTIVE', oneTimePassword: { required: false, emailStatus: null } }, errors: [{ status: 409, code: 'DUPLICATE_EMPLOYEE_CODE' }, { status: 409, code: 'DUPLICATE_EMAIL' }, E422, E403] },
  { id: 'API-USR-03', method: 'GET', path: '/users/{employeeCode}', successStatus: 200, success: { ...user, firstSignInAt: '2026-11-01T08:00:00Z', signInLocked: false, summaryText: 'Initiator in IPL', activity: [] }, errors: [{ status: 404, code: 'USER_NOT_FOUND' }, E403] },
  { id: 'API-USR-04', method: 'PUT', path: '/users/{employeeCode}', successStatus: 200, success: user, errors: [{ status: 422, code: 'EMPLOYEE_CODE_READ_ONLY' }, { status: 409, code: 'DUPLICATE_EMAIL' }, { status: 404, code: 'USER_NOT_FOUND' }] },
  { id: 'API-USR-05', method: 'POST', path: '/users/{employeeCode}/deactivate', successStatus: 200, success: { status: 'INACTIVE' }, errors: [{ status: 409, code: 'HOLDS_PROPOSALS', extra: { count: 3 } }, { status: 404, code: 'USER_NOT_FOUND' }, { status: 422, code: 'LAST_ADMINISTRATOR' }] },
  { id: 'API-USR-06', method: 'POST', path: '/users/{employeeCode}/unlock', successStatus: 200, success: { status: 'ACTIVE' }, errors: [{ status: 409, code: 'NOT_LOCKED' }, { status: 404, code: 'USER_NOT_FOUND' }] },
  { id: 'API-USR-07', method: 'POST', path: '/users/{employeeCode}/reset-password', successStatus: 200, success: { emailStatus: 'SENT' }, errors: [{ status: 422, code: 'NOT_LOCAL_USER' }, { status: 404, code: 'USER_NOT_FOUND' }] },
  { id: 'API-USR-08', method: 'POST', path: '/users/{employeeCode}/one-time-password', successStatus: 200, success: { emailStatus: 'SENT' }, errors: [{ status: 422, code: 'NOT_LOCAL_USER' }, { status: 422, code: 'ALREADY_SIGNED_IN' }, { status: 404, code: 'USER_NOT_FOUND' }] },
  { id: 'API-ROL-01', method: 'GET', path: '/roles', successStatus: 200, success: { items: [role] }, errors: [E403] },
  { id: 'API-ROL-02', method: 'POST', path: '/roles', successStatus: 201, success: { roleId: '22222222-2222-4222-8222-222222222222' }, errors: [{ status: 409, code: 'ROLE_NAME_EXISTS' }, E422, E403] },
  { id: 'API-ROL-03', method: 'PUT', path: '/roles/{roleId}', successStatus: 200, success: role, errors: [{ status: 403, code: 'ROLE_LOCKED' }, { status: 409, code: 'ROLE_NAME_EXISTS' }, { status: 404, code: 'ROLE_NOT_FOUND' }] },
  { id: 'API-ROL-04', method: 'POST', path: '/roles/{roleId}/deactivate', successStatus: 200, success: { status: 'INACTIVE' }, errors: [{ status: 409, code: 'ROLE_IN_USE', extra: { userCount: 12 } }, { status: 403, code: 'ROLE_LOCKED' }] },
  { id: 'API-ROL-05', method: 'GET', path: '/roles/{roleId}', successStatus: 200, success: { ...role, users: [{ employeeCode: '10002', name: 'A. Kumar', department: 'Finance', company: 'IPL', assignedOn: '2026-11-01' }], allows: ['users.view'] }, errors: [{ status: 404, code: 'ROLE_NOT_FOUND' }] },
  { id: 'API-ROL-06', method: 'POST', path: '/roles/{roleId}/users', successStatus: 200, success: { assigned: 1 }, errors: [{ status: 404, code: 'ROLE_NOT_FOUND' }, { status: 404, code: 'USER_NOT_FOUND' }, { status: 422, code: 'ROLE_INACTIVE' }] },
  { id: 'API-PRM-01', method: 'GET', path: '/roles/permissions/matrix', successStatus: 200, success: { matrixVersion: '33333333-3333-4333-8333-333333333333', roles: [{ roleId: role.roleId, name: 'Initiator', userCount: 12 }], groups: [{ module: 'Users', permissions: [{ key: 'users.view', label: 'View users', hint: 'See the user list', cells: { [role.roleId]: { allowed: true, scope: 'COMPANY', locked: false } } }] }] }, errors: [E403] },
  { id: 'API-PRM-02', method: 'POST', path: '/roles/permissions/review', successStatus: 200, success: { rows: [{ role: 'Initiator', permission: 'users.view', before: false, after: true, usersAffected: 12, sensitive: false }], warnings: [] }, errors: [{ status: 403, code: 'LOCKED_CELL' }, E422] },
  { id: 'API-PRM-03', method: 'PUT', path: '/roles/permissions', successStatus: 200, success: { saved: 1, auditId: '44444444-4444-4444-8444-444444444444', matrixVersion: '55555555-5555-4555-8555-555555555555' }, errors: [{ status: 409, code: 'STALE_MATRIX' }, { status: 422, code: 'SENSITIVE_CONFIRM_REQUIRED' }, { status: 403, code: 'LOCKED_CELL' }] },
];
