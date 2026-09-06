import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Patient } from '../../types';

export default function SyncQueuePanel() {
  const [items, setItems] = useState<Array<Patient & { id: string }>>([]);

  useEffect(() => {
    axios.get<{ items: Array<Patient & { id: string }> }>('/api/sync/queue')
      .then((response) => setItems(response.data.items))
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;
  return <span className="queue-panel">{items.length} offline patient{items.length === 1 ? '' : 's'} queued</span>;
}