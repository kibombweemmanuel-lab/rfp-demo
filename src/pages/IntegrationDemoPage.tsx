import { useSAPSync } from '../hooks/useSAPSync';
import { useFHIRFetch } from '../hooks/useFHIRFetch';
import '../styles/pages.css';
import PremiumIcon from '../components/PremiumIcon';

export default function IntegrationDemoPage() {
  const { status: sapStatus, sapDoc, syncSAP } = useSAPSync();
  const { fhirData, fetchFHIR } = useFHIRFetch();

  const handleSyncSAP = () => syncSAP('Paracetamol', 100);

  return (
    <div className="page">
      <div className="page-heading"><span className="heading-icon violet"><PremiumIcon name="integration" /></span><div><p className="eyebrow">Interoperability / connected systems</p><h2>System Integrations</h2></div></div>
      <div className="grid-two">
        <div className="card premium-surface integration-card sap-card">
          <div className="card-header"><h2>SAP S/4HANA</h2><PremiumIcon name="package" className="card-icon" /></div>
          <button className="button primary" onClick={handleSyncSAP} disabled={sapStatus === 'loading'}>
            <PremiumIcon name={sapStatus === 'loading' ? 'sync' : 'package'} />{sapStatus === 'loading' ? 'Syncing...' : 'Re-order Stock'}
          </button>
          <p className="integration-status">Status: {sapStatus === 'success' ? `PR Created: ${sapDoc}` : 'Waiting for request'}</p>
        </div>
        <div className="card premium-surface integration-card fhir-card">
          <div className="card-header"><h2>HL7 FHIR Lab Results</h2><PremiumIcon name="flask" className="card-icon" /></div>
          <button className="button secondary" onClick={() => fetchFHIR()}>
            <PremiumIcon name="activity" />Fetch RBC / Hb
          </button>
          {fhirData && <p className="integration-status">Values: {fhirData.join(', ')}</p>}
        </div>
      </div>
    </div>
  );
}