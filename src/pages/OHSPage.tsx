import { useEffect, useState } from 'react';
import axios from 'axios';
import PremiumIcon from '../components/PremiumIcon';
import type { OHSPatient } from '../types';
import '../styles/pages.css';

export default function OHSPage() {
  const [patients, setPatients] = useState<OHSPatient[]>([]);
  useEffect(() => { axios.get<{ patients: OHSPatient[] }>('/api/ohs/patients').then((response) => setPatients(response.data.patients)); }, []);

  return (
    <div className="page">
      <div className="page-heading"><span className="heading-icon green"><PremiumIcon name="leaf" /></span><div><p className="eyebrow">Occupational health / field safety</p><h2>Environmental Exposure</h2></div></div>
      <div className="grid-two">
        <div className="card premium-surface">
          <div className="card-header"><h3>Risk Assessment</h3><span className="section-count">{patients.length} profile</span></div>
          {patients.map((p) => (
            <div key={p.id} className="patient-card">
              <h4>{p.name}</h4>
              <p>Exposure: {p.exposure}</p>
              <p>
                Spirometry: {p.lastSpirometry} <span className="badge">{p.risk}</span>
              </p>
              <button className="button secondary"><PremiumIcon name="file" />View OHS History</button>
            </div>
          ))}
        </div>
        <div className="card premium-surface">
          <div className="card-header"><h3>Equipment Integration</h3><PremiumIcon name="activity" className="card-icon" /></div>
          <div className="widget"><PremiumIcon name="activity" /> <span>Audiometry <b>Pending</b></span></div>
          <div className="widget"><PremiumIcon name="medical" /> <span>Vision Test <b>Normal</b></span></div>
          <div className="widget"><PremiumIcon name="pulse" /> <span>Spirometry <b>FEV1 = 3.2L (92%)</b></span></div>
          <button className="button primary"><PremiumIcon name="file" />Generate OHS Report</button>
        </div>
      </div>
    </div>
  );
}