import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import type { Patient } from '../types';

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const response = await axios.get<{ pending: number }>('/api/sync/status');
    setPendingCount(response.data.pending);
  }, []);

  useEffect(() => {
    refreshPendingCount().catch(() => setPendingCount(0));
  }, [refreshPendingCount]);

  const savePatientOffline = useCallback(async (patient: Omit<Patient, 'id'>) => {
    await axios.post('/api/sync/queue', patient);
    await refreshPendingCount();
  }, [refreshPendingCount]);

  const syncOfflineData = useCallback(async () => {
    await axios.post('/api/sync/process');
    await refreshPendingCount();
  }, [refreshPendingCount]);

  return { savePatientOffline, pendingCount, syncOfflineData, processSyncQueue: syncOfflineData };
}