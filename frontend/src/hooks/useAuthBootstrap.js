import { useEffect } from 'react';
import { AUTH_STORAGE_KEY } from '../lib/constants';

export function useAuthBootstrap({
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
}) {
  useEffect(() => {
    async function loadCurrentUser() {
      if (!authToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const authData = await apiFetch('/auth/me');
        setCurrentUser(authData.user);
      } catch (loadError) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthToken('');
        setCurrentUser(null);
        setError(loadError.message);
      } finally {
        setAuthLoading(false);
      }
    }

    loadCurrentUser();
  }, [apiFetch, authToken, setAuthLoading, setAuthToken, setCurrentUser, setError]);

  useEffect(() => {
    async function loadMeta() {
      if (!authToken) {
        return;
      }

      try {
        const [healthData, departmentData, actionData, crewData] = await Promise.all([
          apiFetch('/health'),
          apiFetch('/departments'),
          apiFetch('/personnel-actions/recent'),
          apiFetch('/crew'),
        ]);
        setHealth(healthData);
        setDepartments(departmentData);
        setRecentActions(actionData);
        setReplicatorCrewOptions(crewData);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadMeta();
  }, [apiFetch, authToken, setDepartments, setError, setHealth, setRecentActions, setReplicatorCrewOptions]);
}
