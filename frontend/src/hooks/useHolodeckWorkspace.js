import { useCallback, useEffect } from 'react';

export function useHolodeckWorkspace({
  apiFetch,
  currentUser,
  holodeckLogs,
  holodeckSearch,
  selectedHolodeckLogId,
  setError,
  setHolodeckPage,
  setHolodeckPrograms,
  setHolodeckUnits,
  setLoadingHolodeck,
  setSelectedHolodeckLog,
  setSelectedHolodeckLogId,
  setHolodeckLogs,
}) {
  const refreshHolodeckWorkspace = useCallback(async () => {
    const params = new URLSearchParams();
    if (holodeckSearch.trim()) {
      params.set('search', holodeckSearch.trim());
    }

    const [logData, programData, unitData] = await Promise.all([
      apiFetch(`/holodeck/logs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/holodeck/programs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch('/holodeck/units'),
    ]);

    setHolodeckLogs(logData);
    setHolodeckPrograms(programData);
    setHolodeckUnits(unitData);

    return { logData, programData, unitData };
  }, [
    apiFetch,
    holodeckSearch,
    setHolodeckLogs,
    setHolodeckPrograms,
    setHolodeckUnits,
  ]);

  useEffect(() => {
    async function loadHolodeckWorkspace() {
      if (!currentUser) {
        setLoadingHolodeck(false);
        return;
      }

      setLoadingHolodeck(true);
      setError('');

      try {
        await refreshHolodeckWorkspace();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingHolodeck(false);
      }
    }

    loadHolodeckWorkspace();
  }, [
    currentUser,
    refreshHolodeckWorkspace,
    setError,
    setLoadingHolodeck,
  ]);

  useEffect(() => {
    setHolodeckPage(1);
  }, [holodeckSearch, setHolodeckPage]);

  useEffect(() => {
    if (!selectedHolodeckLogId) {
      return;
    }

    if (!holodeckLogs.some((log) => log.log_id === selectedHolodeckLogId)) {
      setSelectedHolodeckLogId(null);
      setSelectedHolodeckLog(null);
    }
  }, [
    holodeckLogs,
    selectedHolodeckLogId,
    setSelectedHolodeckLog,
    setSelectedHolodeckLogId,
  ]);

  useEffect(() => {
    if (!selectedHolodeckLogId) {
      setSelectedHolodeckLog(null);
      return;
    }

    const matchingLog = holodeckLogs.find((log) => log.log_id === selectedHolodeckLogId) || null;
    setSelectedHolodeckLog(matchingLog);
  }, [holodeckLogs, selectedHolodeckLogId, setSelectedHolodeckLog]);

  return { refreshHolodeckWorkspace };
}
