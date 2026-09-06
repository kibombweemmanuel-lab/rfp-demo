import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PremiumIcon from '../../components/PremiumIcon';
import type { Patient } from '../../types';
import '../../styles/pages.css';

interface PatientSearchResult extends Patient {
  encounterCount: number;
}

export default function PatientDirectory() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      axios.get<{ patients: PatientSearchResult[] }>('/api/patients', { params: { q: query } })
        .then((response) => setPatients(response.data.patients))
        .finally(() => setIsLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <div className="page">
      <div className="page-heading">
        <span className="heading-icon blue"><PremiumIcon name="medical" /></span>
        <div><p className="eyebrow">Clinical records / patient index</p><h2>Patient Directory</h2></div>
      </div>
      <div className="patient-directory-toolbar">
        <PremiumIcon name="activity" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or national ID" aria-label="Search patients" />
        <span>{patients.length} records</span>
      </div>
      <div className="patient-directory-list">
        {isLoading && <div className="premium-surface directory-empty">Searching records...</div>}
        {!isLoading && patients.map((patient) => (
          <Link to={`/patient/${patient.id}`} className="patient-directory-row" key={patient.id}>
            <span className="patient-avatar"><PremiumIcon name="medical" /></span>
            <span className="patient-directory-main"><b>{patient.name}</b><small>{patient.nationalId || 'No national ID'}</small></span>
            <span className="patient-directory-meta">{patient.encounterCount} encounter{patient.encounterCount === 1 ? '' : 's'}<PremiumIcon name="chevron" /></span>
          </Link>
        ))}
        {!isLoading && patients.length === 0 && <div className="premium-surface directory-empty">No patients match this search.</div>}
      </div>
    </div>
  );
}
