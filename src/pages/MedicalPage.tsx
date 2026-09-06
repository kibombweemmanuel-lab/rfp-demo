import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/pages.css';
import PremiumIcon from '../components/PremiumIcon';

interface AdmissionData {
  patientName: string;
  nationalId: string | null;
  diagnosis: string;
  ward: string;
  consentUploaded: boolean;
  labs: string[];
}

export default function MedicalPage() {
  const [admission, setAdmission] = useState<AdmissionData | null>(null);
  useEffect(() => { axios.get<AdmissionData>('/api/medical/admission').then((response) => setAdmission(response.data)); }, []);

  return (
    <div className="page">
      <div className="page-heading"><span className="heading-icon blue"><PremiumIcon name="stethoscope" /></span><div><p className="eyebrow">Medical ward / admission desk</p><h2>Medical Admission</h2></div></div>
      <div className="card premium-surface">
        <div className="card-header"><h3>Patient Demographics & Admission Form</h3><span className="status-pill">Ready for review</span></div>
        {!admission ? <p className="muted">Loading admission record...</p> : <>
          <p><b>Name:</b> {admission.patientName} | <b>ID:</b> {admission.nationalId || 'Not recorded'}</p>
          <p><b>Diagnosis:</b> {admission.diagnosis} | <b>Ward:</b> {admission.ward}</p>
        </>}
        <div className="inline-values">
          <span><PremiumIcon name="file" />Consent: {admission?.consentUploaded ? 'Uploaded' : 'Pending'}</span>
          <span><PremiumIcon name="flask" />Labs: {admission?.labs.join(', ') || 'Loading...'}</span>
        </div>
        <button className="button primary"><PremiumIcon name="check" />Admit Patient</button>
      </div>
    </div>
  );
}