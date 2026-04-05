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
  setReplicatorCrewOptions,
  setSelectedHolodeckLog,
  setSelectedHolodeckLogId,
  setHolodeckLogs,
}) {
  const refreshHolodeckWorkspace = useCallback(async () => {
    const params = new URLSearchParams();
    if (holodeckSearch.trim()) {
      params.set('search', holodeckSearch.trim());
    }

    const [logData, programData, unitData, crewData] = await Promise.all([
      apiFetch(`/holodeck/logs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/holodeck/programs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch('/holodeck/units'),
      apiFetch('/crew'),
    ]);

    setHolodeckLogs(logData);
    setHolodeckPrograms(programData);
    setHolodeckUnits(unitData);
    setReplicatorCrewOptions(crewData);

    return { logData, programData, unitData, crewData };
  }, [
    apiFetch,
    holodeckSearch,
    setHolodeckLogs,
    setHolodeckPrograms,
    setHolodeckUnits,
    setReplicatorCrewOptions,
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
        const { logData, programData, unitData, crewData } = await refreshHolodeckWorkspace();
        setHolodeckPrograms(programData);
        setHolodeckUnits(unitData);
        setReplicatorCrewOptions(crewData);

        if (selectedHolodeckLogId && !logData.some((log) => log.log_id === selectedHolodeckLogId)) {
          setSelectedHolodeckLogId(null);
          setSelectedHolodeckLog(null);
        }
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
    selectedHolodeckLogId,
    setError,
    setHolodeckPrograms,
    setHolodeckUnits,
    setLoadingHolodeck,
    setReplicatorCrewOptions,
    setSelectedHolodeckLog,
    setSelectedHolodeckLogId,
  ]);

  useEffect(() => {
    setHolodeckPage(1);
  }, [holodeckSearch, setHolodeckPage]);

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
