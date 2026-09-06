import { useContext, useCallback, useState, useEffect, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AuthContext } from '../features/auth/context/AuthContext';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import PatientWidget from '../features/dashboard/PatientWidget';
import type { UserRole } from '../types';
import '../styles/dashboard.css';

// Premium Icons Component
const PremiumIcons = {
  doctor: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  nurse: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  pharmacist: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  cashier: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  admin: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

const RoleMeta: Record<UserRole, { title: string; subtitle: string; gradient: string; icon: ReactNode }> = {
  Doctor: {
    title: 'Clinical Dashboard',
    subtitle: 'Patient Care & Prescriptions',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: PremiumIcons.doctor,
  },
  Nurse: {
    title: 'Nursing Station',
    subtitle: 'Patient Monitoring & Care',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: PremiumIcons.nurse,
  },
  Pharmacist: {
    title: 'Pharmacy Hub',
    subtitle: 'Inventory & Dispensing',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: PremiumIcons.pharmacist,
  },
  Cashier: {
    title: 'Billing Center',
    subtitle: 'Payments & Invoicing',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: PremiumIcons.cashier,
  },
  Admin: {
    title: 'Admin Console',
    subtitle: 'System Oversight & Analytics',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: PremiumIcons.admin,
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  trend: number;
  icon: ReactNode;
  delay: number;
}

const StatCard = ({ label, value, trend, icon, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="stat-card premium-card"
  >
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      <span className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </span>
    </div>
  </motion.div>
);

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  onSync: () => void;
}

interface DashboardSummary {
  patientsToday: number;
  pendingPrescriptions: number;
  revenue: number;
  satisfaction: number;
  trends: Record<'patientsToday' | 'pendingPrescriptions' | 'revenue' | 'satisfaction', number>;
}

const OfflineIndicator = ({ isOnline, pendingCount, onSync }: OfflineIndicatorProps) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}
  >
    <div className="connection-status">
      <span className="status-dot" />
      <span>{isOnline ? 'Connected' : 'Offline Mode'}</span>
    </div>
    {pendingCount > 0 && (
      <div className="pending-badge">
        {pendingCount} pending sync
      </div>
    )}
    <button className="sync-button" onClick={onSync} disabled={!isOnline && pendingCount === 0}>
      <svg className="sync-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Sync Now
    </button>
  </motion.div>
);

export default function HomePage() {
  const authContext = useContext(AuthContext);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);

  const { savePatientOffline, pendingCount, syncOfflineData } = useOfflineQueue();

  useEffect(() => {
    axios.get<DashboardSummary>('/api/dashboard/summary').then((response) => setStats(response.data));
    axios.get<{ roles: UserRole[] }>('/api/reference/roles').then((response) => setRoles(response.data.roles));
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  if (!authContext) {
    return (
      <div className="error-container">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="error-card"
        >
          <h2>⚠️ Authentication Error</h2>
          <p>Please refresh the page or contact support.</p>
        </motion.div>
      </div>
    );
  }

  const { role, permissions } = authContext;
  const roleMeta = RoleMeta[role] || RoleMeta.Admin;

  const hasAccess = useCallback(
    (feature: string) => permissions.includes('all') || permissions.includes(feature),
    [permissions]
  );

  const handleSavePatient = useCallback(() => {
    const patientData = {
      name: `Patient_${Date.now()}`,
      nationalId: `9001${Math.floor(Math.random() * 10000)}`,
      clinicalNotes: 'Saved offline at ' + new Date().toISOString(),
    };
    savePatientOffline(patientData);
    showToast('Patient saved offline successfully!', 'success');
  }, [savePatientOffline, showToast]);

  const handleSync = async () => {
    if (pendingCount === 0) {
      showToast('No pending items to sync', 'info');
      return;
    }
    try {
      await syncOfflineData();
      setLastSyncTime(new Date());
      showToast('Data synced successfully!', 'success');
    } catch (error) {
      showToast('Sync failed. Please try again.', 'error');
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole !== role) showToast('Role changes are managed by an administrator.', 'info');
  };

  const renderRoleWidgets = useMemo(() => {
    const widgets = [];
    
    if (hasAccess('prescribe')) {
      widgets.push(
        <motion.div
          key="prescribe"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="widget premium-widget prescription-widget"
        >
          <div className="widget-header">
            <span className="widget-icon">💊</span>
            <h4>Prescription Pad</h4>
          </div>
          <div className="widget-content">
            <p>Quick prescribe medications</p>
            <button className="widget-action">New Prescription</button>
          </div>
        </motion.div>
      );
    }
    
    if (hasAccess('billing')) {
      widgets.push(
        <motion.div
          key="billing"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="widget premium-widget billing-widget"
        >
          <div className="widget-header">
            <span className="widget-icon">💰</span>
            <h4>Cashier Terminal</h4>
          </div>
          <div className="widget-content">
            <p>Process payments & invoices</p>
            <button className="widget-action">Open Terminal</button>
          </div>
        </motion.div>
      );
    }
    
    if (hasAccess('pharmacy')) {
      widgets.push(
        <motion.div
          key="pharmacy"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="widget premium-widget pharmacy-widget"
        >
          <div className="widget-header">
            <span className="widget-icon">📦</span>
            <h4>Inventory Stock</h4>
          </div>
          <div className="widget-content">
            <p>Manage medication inventory</p>
            <button className="widget-action">View Stock</button>
          </div>
        </motion.div>
      );
    }
    
    if (hasAccess('audit_logs')) {
      widgets.push(
        <motion.div
          key="audit"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="widget premium-widget audit-widget"
        >
          <div className="widget-header">
            <span className="widget-icon">🔐</span>
            <h4>Audit Trail Viewer</h4>
          </div>
          <div className="widget-content">
            <p>Monitor system activities</p>
            <button className="widget-action">View Logs</button>
          </div>
        </motion.div>
      );
    }
    
    return widgets;
  }, [hasAccess]);

  return (
    <div className="page premium-dashboard" style={{ background: roleMeta.gradient }}>
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-blob blob-1" />
        <div className="gradient-blob blob-2" />
        <div className="gradient-blob blob-3" />
      </div>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className={`toast toast-${toast.type}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header glass-card"
      >
        <div className="header-content">
          <div className="role-info">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="role-icon"
            >
              {roleMeta.icon}
            </motion.div>
            <div>
              <h1>{roleMeta.title}</h1>
              <p>{roleMeta.subtitle}</p>
            </div>
          </div>
          <OfflineIndicator 
            isOnline={isOnline} 
            pendingCount={pendingCount} 
            onSync={handleSync}
          />
        </div>
        {lastSyncTime && (
          <div className="last-sync">
            Last synced: {lastSyncTime.toLocaleTimeString()}
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          label="Patients Today" 
          value={stats?.patientsToday ?? '—'} 
          trend={stats?.trends.patientsToday ?? 0}
          icon="👥"
          delay={0.1}
        />
        <StatCard 
          label="Pending Prescriptions" 
          value={stats?.pendingPrescriptions ?? '—'} 
          trend={stats?.trends.pendingPrescriptions ?? 0}
          icon="📋"
          delay={0.2}
        />
        <StatCard 
          label="Revenue Today" 
          value={stats ? `$${stats.revenue}` : '—'} 
          trend={stats?.trends.revenue ?? 0}
          icon="💰"
          delay={0.3}
        />
        <StatCard 
          label="Patient Satisfaction" 
          value={stats ? `${stats.satisfaction}%` : '—'} 
          trend={stats?.trends.satisfaction ?? 0}
          icon="⭐"
          delay={0.4}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Role Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="card premium-card role-card glass-card"
        >
          <div className="card-header">
            <h3>👤 Role Management</h3>
            <span className="badge">Practice Legality 3.1.1</span>
          </div>
          <div className="role-toggle">
            {roles.map((option) => (
              <motion.button
                key={option}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`role-chip ${role === option ? 'active' : ''}`}
                onClick={() => handleRoleChange(option)}
              >
                <span className="role-chip-icon">{RoleMeta[option]?.icon}</span>
                {option.charAt(0).toUpperCase() + option.slice(1)}
                {role === option && (
                  <motion.span
                    layoutId="activeRole"
                    className="active-indicator"
                  />
                )}
              </motion.button>
            ))}
          </div>
          <div className="permissions-display">
            <p className="muted">Active Permissions:</p>
            <div className="permission-tags">
              {permissions.map((permission) => (
                <span key={permission} className="permission-tag">
                  {permission.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Offline Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="card premium-card offline-card glass-card"
        >
          <div className="card-header">
            <h3>📴 Offline Capture</h3>
            <span className="badge">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="button primary premium-button"
            onClick={handleSavePatient}
          >
            <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Save Patient Offline
          </motion.button>
          <div className="pending-indicator">
            {pendingCount > 0 ? (
              <span className="pending-count">
                {pendingCount} items pending sync
              </span>
            ) : (
              <span className="synced-state">All data synced</span>
            )}
          </div>
        </motion.div>

        {/* Patient Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="patient-widget-wrapper"
        >
          <PatientWidget />
        </motion.div>

        {/* Dynamic Role Widgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card premium-card role-widgets glass-card"
        >
          <div className="card-header">
            <h3>📋 Role-Specific Features</h3>
            <span className="badge">{role}</span>
          </div>
          <div className="widgets-grid">
            {renderRoleWidgets.length > 0 ? (
              renderRoleWidgets
            ) : (
              <div className="no-access">
                <p>No specific features for this role</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}