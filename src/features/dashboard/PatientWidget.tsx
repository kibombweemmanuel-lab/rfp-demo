import { useEffect, useState } from 'react';
import axios from 'axios';
import type { OHSPatient } from '../../types';

export default function PatientWidget() {
  const [patient, setPatient] = useState<OHSPatient | null>(null);

  useEffect(() => {
    axios.get<OHSPatient[]>('/api/ohs/patients').then((response) => setPatient(response.data[0] || null));
  }, []);

  if (!patient) return <div className="card"><p className="muted">Loading patient snapshot...</p></div>;

  return (
    <div className="card">
      <h3>👥 Patient Snapshot</h3>
      <p><b>{patient.name}</b> · ID {patient.id}</p>
      <p className="muted">Exposure: {patient.exposure} · Risk: {patient.risk}</p>
    </div>
  );
}