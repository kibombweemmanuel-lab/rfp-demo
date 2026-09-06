import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { useSyncStatus } from '../hooks/useSyncStatus';
import SyncQueuePanel from '../features/offline/SyncQueuePanel';
import PremiumIcon from './PremiumIcon';
import { useAuth } from '../features/auth/context/AuthContext';
import '../styles/layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { processSyncQueue } = useOfflineQueue();
  const { syncPending } = useSyncStatus();
  const { user, logout } = useAuth();

  return (
    <>
      <header className="navbar">
        <div className="nav-left">
          <strong className="brand-lockup"><span className="brand-mark"><PremiumIcon name="medical" /></span>RFP EMR</strong>
          <span className="badge">v2.0 / clinical</span>
        </div>
        <nav className="nav-links">
          <Link to="/"><PremiumIcon name="activity" />Dashboard</Link>
          <Link to="/patients"><PremiumIcon name="clipboard" />Patients</Link>
          <Link to="/emergency"><PremiumIcon name="emergency" />Emergency</Link>
          <Link to="/ohs"><PremiumIcon name="leaf" />OHS</Link>
          <Link to="/medical"><PremiumIcon name="stethoscope" />Medical</Link>
          <Link to="/surgical"><PremiumIcon name="surgery" />Surgical</Link>
          <Link to="/integrations"><PremiumIcon name="integration" />Integrations</Link>
            {user?.permissions.includes('all') && <Link to="/admin"><PremiumIcon name="shield" />Admin</Link>}
        </nav>
        <div className="nav-right">
          <button className="sync-btn" onClick={processSyncQueue}>
            <PremiumIcon name="sync" /> Sync ({syncPending} pending)
          </button>
          <div className="sync-panel-divider">
            <SyncQueuePanel />
          </div>
          <button className="user-menu" onClick={logout} title="Sign out">
            <span className="user-avatar">{user?.name.slice(0, 1)}</span>
            <span className="user-name">{user?.name}</span>
            <PremiumIcon name="logout" />
          </button>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </>
  );
}