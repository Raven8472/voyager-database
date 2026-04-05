import { useEffect } from 'react';

export function useAuthBootstrap({
  apiFetch,
  authToken,
  setAuthLoading,
  setAuthToken,
  setCurrentUser,
  setDepartments,
  setError,
  setHealth,
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
        window.localStorage.removeItem('voyager_auth_token');
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
        const [healthData, departmentData, actionData] = await Promise.all([
          apiFetch('/health'),
          apiFetch('/departments'),
          apiFetch('/personnel-actions/recent'),
        ]);
        setHealth(healthData);
        setDepartments(departmentData);
        setRecentActions(actionData);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadMeta();
  }, [apiFetch, authToken, setDepartments, setError, setHealth, setRecentActions]);
}
