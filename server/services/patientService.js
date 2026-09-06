import { randomUUID } from 'node:crypto';

export function createPatientService(store) {
  async function listPatients(query = '') {
    const patients = await store.read();
    const normalizedQuery = query.trim().toLowerCase();
    const results = normalizedQuery
      ? patients.filter((patient) => `${patient.name} ${patient.nationalId || ''}`.toLowerCase().includes(normalizedQuery))
      : patients;
    return results.map(({ encounters, ...patient }) => ({ ...patient, encounterCount: encounters.length }));
  }

  async function getPatient(id) {
    return (await store.read()).find((patient) => patient.id === id) || null;
  }

  async function addEncounter(id, input) {
    const patients = await store.read();
    const patient = patients.find((item) => item.id === id);
    if (!patient) return null;

    const encounter = {
      id: randomUUID(),
      date: new Date().toISOString(),
      type: input.type,
      diagnosis: input.diagnosis.trim(),
      notes: input.notes.trim(),
      author: input.author?.trim() || 'Clinical team',
    };
    patient.encounters.unshift(encounter);
    await store.write(patients);
    return encounter;
  }

  return { listPatients, getPatient, addEncounter };
}
