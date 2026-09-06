import { useEffect, useState } from 'react';
import axios from 'axios';
import PremiumIcon from '../components/PremiumIcon';
import type { TriagePatient } from '../types';
import '../styles/pages.css';

export default function EmergencyPage() {
  const [patients, setPatients] = useState<TriagePatient[]>([]);
  useEffect(() => { axios.get<{ patients: TriagePatient[] }>('/api/emergency/triage').then((response) => setPatients(response.data.patients)); }, []);

  return (
    <div className="page">
      <div className="page-heading emergency-heading"><span className="heading-icon"><PremiumIcon name="emergency" /></span><div><p className="eyebrow">Critical care / live queue</p><h2>Emergency Case Flow</h2></div><span className="live-pill"><span />Live</span></div>
      <div className="grid-two">
        <div className="card premium-surface">
          <div className="card-header"><h3>Triage Queue</h3><span className="section-count">{patients.length} cases</span></div>
          <ul className="patient-list">
            {patients.map((p) => (
              <li key={p.id} className={`triage-${p.triage.toLowerCase()}`}>
                <span>
                  <b>{p.name}</b> - {p.condition}
                </span>
                <span className="badge">
                  {p.triage} | {p.status}
                </span>
              </li>
            ))}
          </ul>
          <button className="button secondary"><PremiumIcon name="clipboard" />Admit to Observation</button>
        </div>
        <div className="card premium-surface vitals-card">
          <div className="card-header"><h3>Real-time Vitals</h3><PremiumIcon name="pulse" className="card-icon" /></div>
          <p className="muted">(Integration with Biometrics/OHS Devices)</p>
          <div className="vitals-row"><span><b>88</b><small>HR / bpm</small></span><span><b>98%</b><small>SpO2</small></span><span><b>120/80</b><small>BP / mmHg</small></span></div>
          <button className="button primary"><PremiumIcon name="check" />Complete Emergency Assessment</button>
        </div>
      </div>
    </div>
  );
}