import { useRef, useState } from 'react';
import './App.css';
import AuthScreen from './components/AuthScreen';
import LcarsShell from './components/LcarsShell';
import WorkspaceContent from './components/WorkspaceContent';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import {
  API_BASE_URL,
  AUTH_STORAGE_KEY,
  initialAuthForm,
} from './lib/constants';
import { apiFetch } from './lib/api';
import { updateNamedValue } from './lib/episodeForms';
import { getWorkspaceMeta } from './lib/workspaceMeta';

function App() {
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem(AUTH_STORAGE_KEY) || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('personnel');
  const [health, setHealth] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [replicatorCrewOptions, setReplicatorCrewOptions] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dossierRef = useRef(null);

  useAuthBootstrap({
    apiFetch,
    authToken,
    setAuthLoading,
    setAuthToken,
    setCurrentUser,
    setDepartments,
    setError,
    setHealth,
    setReplicatorCrewOptions,
    setRecentActions,
  });

  function handleAuthChange(event) {
    updateNamedValue(setAuthForm, event);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthSubmitting(true);
    setError('');
    setSuccessMessage('');

    if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
      setAuthSubmitting(false);
      setError('Authorization code confirmation does not match.');
      return;
    }

    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const authData = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });

      window.localStorage.setItem(AUTH_STORAGE_KEY, authData.token);
      setAuthToken(authData.token);
      setCurrentUser(authData.user);
      setAuthForm(initialAuthForm);
      setSuccessMessage(authMode === 'register' ? 'Access node created. Credentials accepted.' : 'Access granted. Vital databases unlocked.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setAuthSubmitting(false);
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (logoutError) {
      // Even if the remote session is already invalid, the local terminal should still close cleanly.
    } finally {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthToken('');
      setCurrentUser(null);
      setAuthMode('login');
      setAuthForm(initialAuthForm);
      setHealth(null);
      setReplicatorCrewOptions([]);
      setRecentActions([]);
      setError('');
      setSuccessMessage('');
    }
  }

  const { title: workspaceTitle, mode: workspaceMode } = getWorkspaceMeta(activeWorkspace);

  if (authLoading) {
    return (
      <AuthScreen
        authForm={authForm}
        authLoading={authLoading}
        authMode={authMode}
        authSubmitting={authSubmitting}
        error={error}
        handleAuthChange={handleAuthChange}
        handleAuthSubmit={handleAuthSubmit}
        setAuthMode={setAuthMode}
        successMessage={successMessage}
      />
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        authForm={authForm}
        authLoading={authLoading}
        authMode={authMode}
        authSubmitting={authSubmitting}
        error={error}
        handleAuthChange={handleAuthChange}
        handleAuthSubmit={handleAuthSubmit}
        setAuthMode={setAuthMode}
        successMessage={successMessage}
      />
    );
  }

  return (
    <LcarsShell
      activeWorkspace={activeWorkspace}
      apiBaseUrl={API_BASE_URL}
      currentUser={currentUser}
      error={error}
      handleLogout={handleLogout}
      health={health}
      recentActionCount={recentActions.length}
      setActiveWorkspace={setActiveWorkspace}
      successMessage={successMessage}
      workspaceMode={workspaceMode}
      workspaceTitle={workspaceTitle}
    >
      <WorkspaceContent
        activeWorkspace={activeWorkspace}
        apiFetch={apiFetch}
        currentUser={currentUser}
        departments={departments}
        dossierRef={dossierRef}
        replicatorCrewOptions={replicatorCrewOptions}
        recentActions={recentActions}
        setCrewOptions={setReplicatorCrewOptions}
        setError={setError}
        setHealth={setHealth}
        setRecentActions={setRecentActions}
        setSuccessMessage={setSuccessMessage}
      />
    </LcarsShell>
  );
}

export default App;
