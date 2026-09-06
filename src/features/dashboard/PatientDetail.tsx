import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import PremiumIcon from '../../components/PremiumIcon';
import type { Encounter, PatientRecord } from '../../types';
import '../../styles/pages.css';

const encounterTypes: Encounter['type'][] = ['Assessment', 'Follow-up', 'Admission', 'Discharge'];

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [form, setForm] = useState({ type: 'Assessment' as Encounter['type'], diagnosis: '', notes: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadPatient = () => {
    setIsLoading(true);
    axios.get<PatientRecord>(`/api/patients/${id}`)
      .then((response) => { setPatient(response.data); setError(''); })
      .catch(() => setError('Unable to load this patient record.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadPatient(); }, [id]);

  const submitEncounter = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await axios.post(`/api/patients/${id}/encounters`, form);
      setForm({ type: 'Assessment', diagnosis: '', notes: '' });
      loadPatient();
    } catch {
      setError('Encounter could not be saved. Check the required fields.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="page"><div className="premium-surface directory-empty">Loading patient record...</div></div>;
  if (!patient) return <div className="page"><div className="premium-surface directory-empty">{error || 'Patient not found.'}</div></div>;

  return (
    <div className="page">
      <Link to="/patients" className="back-link"><PremiumIcon name="chevron" /> Patient Directory</Link>
      <div className="patient-record-header premium-surface">
        <span className="patient-record-avatar"><PremiumIcon name="medical" /></span>
        <div><p className="eyebrow">Patient record / #{patient.id}</p><h2>{patient.name}</h2><p className="muted">National ID: {patient.nationalId || 'Not recorded'}</p></div>
        <span className="status-pill">Active record</span>
      </div>
      <div className="patient-record-grid">
        <div className="patient-record-column">
          <div className="premium-surface record-summary">
            <div className="card-header"><h3>Clinical Summary</h3><PremiumIcon name="file" className="card-icon" /></div>
            <div className="record-facts"><span><small>Blood group</small><b>{patient.bloodGroup}</b></span><span><small>Allergies</small><b>{patient.allergies.length ? patient.allergies.join(', ') : 'None known'}</b></span></div>
            <p className="muted">{patient.clinicalNotes || 'No clinical notes recorded.'}</p>
          </div>
          <div className="premium-surface">
            <div className="card-header"><h3>Encounter Timeline</h3><span className="section-count">{patient.encounters.length} total</span></div>
            <div className="encounter-timeline">
              {patient.encounters.map((encounter) => <article className="encounter-item" key={encounter.id}><span className="encounter-dot" /><div><div className="encounter-meta"><b>{encounter.type}</b><time>{new Date(encounter.date).toLocaleString()}</time></div><strong>{encounter.diagnosis}</strong><p>{encounter.notes}</p><small>Recorded by {encounter.author}</small></div></article>)}
              {!patient.encounters.length && <p className="muted">No encounters recorded yet.</p>}
            </div>
          </div>
        </div>
        <form className="premium-surface encounter-form" onSubmit={submitEncounter}>
          <div className="card-header"><h3>New Encounter</h3><PremiumIcon name="clipboard" className="card-icon" /></div>
          <label>Encounter type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as Encounter['type'] })}>{encounterTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Diagnosis<input required value={form.diagnosis} onChange={(event) => setForm({ ...form, diagnosis: event.target.value })} placeholder="e.g. Acute malaria" /></label>
          <label>Clinical notes<textarea required rows={6} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Record assessment, treatment, and follow-up plan" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button primary" disabled={isSaving}><PremiumIcon name={isSaving ? 'sync' : 'check'} />{isSaving ? 'Saving encounter...' : 'Save encounter'}</button>
        </form>
      </div>
    </div>
  );
}
