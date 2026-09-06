import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/pages.css';
import PremiumIcon from '../components/PremiumIcon';

interface TheatreSlot { theatre: string; procedure: string; time: string; status: string; }

export default function SurgicalPage() {
  const [schedule, setSchedule] = useState<TheatreSlot[]>([]);
  useEffect(() => { axios.get<{ schedule: TheatreSlot[] }>('/api/surgical/schedule').then((response) => setSchedule(response.data.schedule)); }, []);

  return (
    <div className="page">
      <div className="page-heading"><span className="heading-icon red"><PremiumIcon name="surgery" /></span><div><p className="eyebrow">Theatre operations / scheduling</p><h2>Surgical Admission</h2></div></div>
      <div className="grid-two">
        <div className="card premium-surface">
          <div className="card-header"><h3>Theatre Scheduler</h3><PremiumIcon name="calendar" className="card-icon" /></div>
          <ul className="schedule-list">{schedule.map((slot) => <li key={slot.theatre}><span className={`schedule-dot ${slot.status}`} /><span><b>{slot.theatre}</b> {slot.procedure}</span><time>{slot.time}</time></li>)}</ul>
          <button className="button secondary"><PremiumIcon name="calendar" />Book Slot</button>
        </div>
        <div className="card premium-surface">
          <div className="card-header"><h3>Pre-op Checklist</h3><PremiumIcon name="clipboard" className="card-icon" /></div>
          <ul>
            <li>✅ Consent Signed</li>
            <li>⏳ Blood Cross-match</li>
            <li>✅ NBM Status</li>
          </ul>
          <button className="button primary"><PremiumIcon name="surgery" />Send to Theatre</button>
        </div>
      </div>
    </div>
  );
}