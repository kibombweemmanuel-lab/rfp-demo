import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJsonStore } from './storage/jsonStore.js';
import { createPostgresStore } from './storage/postgresStore.js';
import { createPatientService } from './services/patientService.js';
import { createQueueService } from './services/queueService.js';
import { createUserService } from './services/userService.js';
import { encounterSchema, parseBody, queueItemSchema, requisitionSchema } from './validation.js';

const port = Number(process.env.API_PORT || 4000);
const dataFile = join(dirname(fileURLToPath(import.meta.url)), 'data', 'queue.json');
const patientsFile = join(dirname(fileURLToPath(import.meta.url)), 'data', 'patients.json');
const usersFile = join(dirname(fileURLToPath(import.meta.url)), 'data', 'users.json');

const fhirValues = [12.4, 13.1, 4.8, 97.2];
const roles = ['Nurse', 'Doctor', 'Pharmacist', 'Cashier', 'Admin'];
const emergencyPatients = [
  { id: 1, name: 'Grace Moyo', triage: 'Red', condition: 'Chest Pain', status: 'In Triage' },
  { id: 2, name: 'John Banda', triage: 'Yellow', condition: 'Fracture', status: 'Waiting' },
  { id: 3, name: 'Mary Phiri', triage: 'Green', condition: 'Mild Fever', status: 'Discharged' },
];
const ohsPatients = [
  { id: 101, name: 'Peter Kamanga', exposure: 'Pesticides', lastSpirometry: '92%', risk: 'High' },
];
const dashboardSummary = {
  patientsToday: 24,
  pendingPrescriptions: 8,
  revenue: 1250,
  satisfaction: 98,
  trends: { patientsToday: 12, pendingPrescriptions: -5, revenue: 18, satisfaction: 3 },
};
const medicalAdmission = { patientId: 202, diagnosis: 'Malaria (Severe)', ward: 'Medical B3', consentUploaded: true, labs: ['CBC', 'Malaria Smear'] };
const surgicalSchedule = [
  { theatre: 'OT 1', procedure: 'Appendectomy', time: '10:00 AM', status: 'scheduled' },
  { theatre: 'OT 2', procedure: 'Cesarean', time: '11:30 AM', status: 'scheduled' },
  { theatre: 'OT 3', procedure: 'Emergency Laparotomy', time: 'NOW', status: 'emergency' },
];
const sessions = new Map();
const configuredUsers = JSON.parse(process.env.AUTH_USERS || '[]');

function getAuthenticatedUser(request) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  return token ? sessions.get(token) : null;
}
const initialPatients = [
  {
    id: 101,
    name: 'Peter Kamanga',
    nationalId: '90010001',
    clinicalNotes: 'Agricultural worker with pesticide exposure.',
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    encounters: [],
  },
  {
    id: 202,
    name: 'Sarah Mwale',
    nationalId: '20260819',
    clinicalNotes: 'Admitted with severe malaria.',
    bloodGroup: 'A+',
    allergies: [],
    encounters: [],
  },
];

const createStore = (filePath, documentName, initialValue) => process.env.DATABASE_URL
  ? createPostgresStore(process.env.DATABASE_URL, documentName, initialValue)
  : createJsonStore(filePath, initialValue);

const patientService = createPatientService(createStore(patientsFile, 'patients', initialPatients));
const queueService = createQueueService(createStore(dataFile, 'sync_queue', []));
const userService = createUserService(createStore(usersFile, 'users', configuredUsers));

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(JSON.stringify(payload));
}

function requirePermission(request, response, permission) {
  if (request.user.permissions.includes('all') || request.user.permissions.includes(permission)) return true;
  sendJson(response, 403, { error: `Permission required: ${permission}` });
  return false;
}

function requireAdmin(request, response) {
  return requirePermission(request, response, 'user_management');
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    const error = new Error('Request body must be valid JSON');
    error.status = 400;
    throw error;
  }
}

async function handleRequest(request, response) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const path = url.pathname;

  const isPublicRoute = path === '/health'
    || path === '/api/auth/login'
    || path === '/api/auth/me'
    || path === '/api/auth/logout';
  if (path.startsWith('/api/') && !isPublicRoute) {
    request.user = getAuthenticatedUser(request);
    if (!request.user) {
      sendJson(response, 401, { error: 'Authentication required' });
      return;
    }
  }

  if (request.method === 'GET' && path === '/health') {
    sendJson(response, 200, { status: 'ok', service: 'rfp-emr-api' });
    return;
  }

  if (request.method === 'POST' && path === '/api/auth/login') {
    const body = await readBody(request);
    const user = await userService.authenticate(body.email || '', body.password || '');
    if (!user) {
      sendJson(response, 401, { error: 'Invalid email or password' });
      return;
    }
    const token = randomUUID();
    sessions.set(token, user);
    sendJson(response, 200, { token, user });
    return;
  }

  if (request.method === 'GET' && path === '/api/auth/me') {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const user = token ? sessions.get(token) : null;
    if (!user) {
      sendJson(response, 401, { error: 'Authentication required' });
      return;
    }
    sendJson(response, 200, { user });
    return;
  }

  if (request.method === 'POST' && path === '/api/auth/logout') {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (token) sessions.delete(token);
    sendJson(response, 200, { loggedOut: true });
    return;
  }

  if (request.method === 'GET' && path === '/api/admin/users') {
    if (!requireAdmin(request, response)) return;
    sendJson(response, 200, { users: await userService.list() });
    return;
  }

  if (request.method === 'POST' && path === '/api/admin/users') {
    if (!requireAdmin(request, response)) return;
    const body = await readBody(request);
    if (!body.name || !body.email || !body.password || !roles.includes(body.role)) {
      sendJson(response, 400, { error: 'name, email, password, and a valid role are required' });
      return;
    }
    const created = await userService.create({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      permissions: body.permissions || [],
    });
    if (!created) {
      sendJson(response, 409, { error: 'email already exists' });
      return;
    }
    sendJson(response, 201, { user: created });
    return;
  }

  const adminUserMatch = path.match(/^\/api\/admin\/users\/([^/]+)\/status$/);
  if (request.method === 'PATCH' && adminUserMatch) {
    if (!requireAdmin(request, response)) return;
    const body = await readBody(request);
    if (typeof body.active !== 'boolean') {
      sendJson(response, 400, { error: 'active must be boolean' });
      return;
    }
    const updated = await userService.setActive(adminUserMatch[1], body.active);
    if (!updated) {
      sendJson(response, 404, { error: 'user not found' });
      return;
    }
    if (!body.active) {
      for (const [token, sessionUser] of sessions) if (sessionUser.id === updated.id) sessions.delete(token);
    }
    sendJson(response, 200, { user: updated });
    return;
  }

  if (request.method === 'GET' && path === '/api/reference/roles') {
    sendJson(response, 200, { roles });
    return;
  }

  if (request.method === 'GET' && path === '/api/dashboard/summary') {
    sendJson(response, 200, dashboardSummary);
    return;
  }

  if (request.method === 'GET' && path === '/api/emergency/triage') {
    if (!requirePermission(request, response, 'triage')) return;
    sendJson(response, 200, { patients: emergencyPatients });
    return;
  }

  if (request.method === 'GET' && path === '/api/ohs/patients') {
    if (!requirePermission(request, response, 'patient_records')) return;
    sendJson(response, 200, { patients: ohsPatients });
    return;
  }

  if (request.method === 'GET' && path === '/api/medical/admission') {
    if (!requirePermission(request, response, 'patient_records')) return;
    const patient = await patientService.getPatient(medicalAdmission.patientId);
    sendJson(response, 200, { ...medicalAdmission, patientName: patient?.name || 'Unknown patient', nationalId: patient?.nationalId || null });
    return;
  }

  if (request.method === 'GET' && path === '/api/surgical/schedule') {
    if (!requirePermission(request, response, 'patient_records')) return;
    sendJson(response, 200, { schedule: surgicalSchedule });
    return;
  }

  if (request.method === 'GET' && /^\/api\/fhir\/patient\/[^/]+\/observation$/.test(path)) {
    sendJson(response, 200, {
      resourceType: 'Bundle',
      type: 'searchset',
      total: fhirValues.length,
      entry: fhirValues.map((value) => ({
        resource: {
          resourceType: 'Observation',
          status: 'final',
          valueQuantity: { value, unit: 'g/dL' },
        },
      })),
    });
    return;
  }

  if (request.method === 'GET' && path === '/api/sync/status') {
    const queue = await queueService.list();
    sendJson(response, 200, { pending: queue.length });
    return;
  }

  if (request.method === 'GET' && path === '/api/sync/queue') {
    sendJson(response, 200, { items: await queueService.list() });
    return;
  }

  if (request.method === 'GET' && path === '/api/patients') {
    if (!requirePermission(request, response, 'patient_records')) return;
    sendJson(response, 200, { patients: await patientService.listPatients(url.searchParams.get('q') || '') });
    return;
  }

  const patientMatch = path.match(/^\/api\/patients\/(\d+)$/);
  if (request.method === 'GET' && patientMatch) {
    if (!requirePermission(request, response, 'patient_records')) return;
    const patient = await patientService.getPatient(Number(patientMatch[1]));
    if (!patient) {
      sendJson(response, 404, { error: 'patient not found' });
      return;
    }
    sendJson(response, 200, patient);
    return;
  }

  const encounterMatch = path.match(/^\/api\/patients\/(\d+)\/encounters$/);
  if (request.method === 'POST' && encounterMatch) {
    if (!requirePermission(request, response, 'patient_records')) return;
    const encounter = await patientService.addEncounter(Number(encounterMatch[1]), parseBody(encounterSchema, await readBody(request)));
    if (!encounter) {
      sendJson(response, 404, { error: 'patient not found' });
      return;
    }
    sendJson(response, 201, encounter);
    return;
  }

  if (request.method === 'POST' && path === '/api/sap/requisition') {
    if (!requirePermission(request, response, 'pharmacy')) return;
    const body = parseBody(requisitionSchema, await readBody(request));
    const documentNumber = `PR-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    sendJson(response, 201, { sapDocumentNumber: documentNumber });
    return;
  }

  if (request.method === 'POST' && path === '/api/sync/queue') {
    const item = await queueService.enqueue(parseBody(queueItemSchema, await readBody(request)));
    sendJson(response, 201, item);
    return;
  }

  if (request.method === 'POST' && path === '/api/sync/process') {
    sendJson(response, 200, await queueService.process());
    return;
  }

  const queueItem = path.match(/^\/api\/sync\/queue\/([^/]+)$/);
  if (request.method === 'DELETE' && queueItem) {
    if (!await queueService.remove(queueItem[1])) {
      sendJson(response, 404, { error: 'queue item not found' });
      return;
    }
    sendJson(response, 200, { deleted: true });
    return;
  }

  sendJson(response, 404, { error: 'route not found' });
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    sendJson(response, error.status || 500, { error: error.message || 'Internal server error' });
  });
});

server.listen(port, () => {
  console.log(`RFP EMR API listening on http://localhost:${port}`);
});