import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import PremiumIcon from '../../components/PremiumIcon';
import { useAuth } from '../auth/context/AuthContext';
import type { UserRole } from '../../types';
import '../../styles/pages.css';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  active?: boolean;
  createdAt?: string;
}

const roleOptions: UserRole[] = ['Nurse', 'Doctor', 'Pharmacist', 'Cashier', 'Admin'];

export default function ServerQueueAdmin() {
  const { permissions } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [pending, setPending] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Nurse' as UserRole });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    const [userResponse, queueResponse] = await Promise.all([
      axios.get<{ users: ManagedUser[] }>('/api/admin/users'),
      axios.get<{ pending: number }>('/api/sync/status'),
    ]);
    setUsers(userResponse.data.users);
    setPending(queueResponse.data.pending);
  };

  useEffect(() => { refresh().catch(() => setError('Admin access is required to view this workspace.')); }, []);

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await axios.post('/api/admin/users', form);
      setForm({ name: '', email: '', password: '', role: 'Nurse' });
      setNotice('User account created.');
      await refresh();
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.error || 'Unable to create user.' : 'Unable to create user.');
    }
  };

  const toggleUser = async (user: ManagedUser) => {
    setError('');
    await axios.patch(`/api/admin/users/${user.id}/status`, { active: user.active === false });
    await refresh();
  };

  const processQueue = async () => {
    await axios.post('/api/sync/process');
    await refresh();
  };

  if (!permissions.includes('all')) return <div className="page"><div className="premium-surface directory-empty">Administrator permission required.</div></div>;

  return (
    <div className="page">
      <div className="page-heading"><span className="heading-icon violet"><PremiumIcon name="shield" /></span><div><p className="eyebrow">Administration / access control</p><h2>System Administration</h2></div></div>
      {error && <p className="form-error">{error}</p>}
      {notice && <p className="admin-notice">{notice}</p>}
      <div className="admin-grid">
        <section className="premium-surface">
          <div className="card-header"><h3>Access Overview</h3><PremiumIcon name="activity" className="card-icon" /></div>
          <div className="admin-metrics"><span><b>{users.length}</b><small>Accounts</small></span><span><b>{users.filter((user) => user.active !== false).length}</b><small>Active</small></span><span><b>{pending}</b><small>Queued sync</small></span></div>
          <button className="button secondary" onClick={processQueue}><PremiumIcon name="sync" />Process sync queue</button>
        </section>
        <form className="premium-surface admin-form" onSubmit={createUser}>
          <div className="card-header"><h3>Create User</h3><PremiumIcon name="clipboard" className="card-icon" /></div>
          <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Work email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Temporary password<input required minLength={10} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>{roleOptions.map((role) => <option key={role}>{role}</option>)}</select></label>
          <button className="button primary"><PremiumIcon name="check" />Create account</button>
        </form>
      </div>
      <section className="premium-surface admin-users-panel">
        <div className="card-header"><h3>Organization Users</h3><span className="section-count">{users.length} accounts</span></div>
        <div className="admin-user-list">{users.map((user) => <div className="admin-user-row" key={user.id}><span className="patient-avatar"><PremiumIcon name="medical" /></span><span className="admin-user-main"><b>{user.name}</b><small>{user.email}</small></span><span className="admin-role">{user.role}</span><span className={`user-state ${user.active === false ? 'inactive' : ''}`}>{user.active === false ? 'Inactive' : 'Active'}</span><button className="button secondary compact-button" onClick={() => toggleUser(user)}>{user.active === false ? 'Activate' : 'Deactivate'}</button></div>)}</div>
      </section>
    </div>
  );
}
