import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ServerQueueAdmin() {
  const [pending, setPending] = useState(0);
  const refresh = () => axios.get<{ pending: number }>('/api/sync/status').then((response) => setPending(response.data.pending));
  useEffect(() => { refresh(); }, []);

  const processQueue = async () => {
    await axios.post('/api/sync/process');
    refresh();
  };

  return (
    <div className="page">
      <h2>Server Sync Queue</h2>
      <div className="card"><p>{pending} item{pending === 1 ? '' : 's'} pending</p><button className="button primary" onClick={processQueue}>Process Queue</button></div>
    </div>
  );
}