import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import PremiumIcon from '../components/PremiumIcon';
import { useAuth } from '../features/auth/context/AuthContext';
import '../styles/auth.css';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Sign in failed. Check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-atmosphere" />
      <section className="auth-panel">
        <div className="auth-brand"><span className="auth-brand-mark"><PremiumIcon name="medical" /></span><span>RFP EMR</span></div>
        <p className="eyebrow">Clinical operations platform</p>
        <h1>Welcome back.</h1>
        <p className="auth-subtitle">Sign in to continue to your care workspace.</p>
        <form onSubmit={submit} className="auth-form">
          <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-submit" disabled={isSubmitting}>{isSubmitting ? 'Authenticating...' : 'Sign in'}<PremiumIcon name="chevron" /></button>
        </form>
        <p className="auth-footnote">Access is provisioned by your organization administrator.</p>
      </section>
      <aside className="auth-aside"><PremiumIcon name="activity" /><p>One workspace for safer, faster clinical decisions.</p><span>Connected care / offline ready</span></aside>
    </main>
  );
}
