import { useCallback, useEffect } from 'react';

export function useReplicatorWorkspace({
  apiFetch,
  currentUser,
  replicatorLogs,
  replicatorSearch,
  selectedReplicatorLogId,
  setError,
  setLoadingReplicator,
  setReplicatorCrewOptions,
  setReplicatorLogs,
  setReplicatorPage,
  setReplicatorPatternPage,
  setReplicatorPatterns,
  setReplicatorUnits,
  setSelectedReplicatorLog,
  setSelectedReplicatorLogId,
}) {
  const refreshReplicatorWorkspace = useCallback(async () => {
    const params = new URLSearchParams();
    if (replicatorSearch.trim()) {
      params.set('search', replicatorSearch.trim());
    }

    const [logData, patternData, unitData, crewData] = await Promise.all([
      apiFetch(`/replicator/logs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/replicator/patterns${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/replicator/units${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch('/crew'),
    ]);

    setReplicatorLogs(logData);
    setReplicatorPatterns(patternData);
    setReplicatorUnits(unitData);
    setReplicatorCrewOptions(crewData);
    return { logData, patternData, unitData, crewData };
  }, [
    apiFetch,
    replicatorSearch,
    setReplicatorCrewOptions,
    setReplicatorLogs,
    setReplicatorPatterns,
    setReplicatorUnits,
  ]);

  useEffect(() => {
    async function loadReplicatorWorkspace() {
      if (!currentUser) {
        setLoadingReplicator(false);
        return;
      }

      setLoadingReplicator(true);
      setError('');

      try {
        const { logData } = await refreshReplicatorWorkspace();
        if (selectedReplicatorLogId && !logData.some((log) => log.log_id === selectedReplicatorLogId)) {
          setSelectedReplicatorLogId(null);
          setSelectedReplicatorLog(null);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingReplicator(false);
      }
    }

    loadReplicatorWorkspace();
  }, [
    currentUser,
    refreshReplicatorWorkspace,
    selectedReplicatorLogId,
    setError,
    setLoadingReplicator,
    setSelectedReplicatorLog,
    setSelectedReplicatorLogId,
  ]);

  useEffect(() => {
    setReplicatorPage(1);
  }, [replicatorSearch, setReplicatorPage]);

  useEffect(() => {
    setReplicatorPatternPage(1);
  }, [replicatorSearch, setReplicatorPatternPage]);

  useEffect(() => {
    if (!selectedReplicatorLogId) {
      setSelectedReplicatorLog(null);
      return;
    }

    const matchingLog = replicatorLogs.find((log) => log.log_id === selectedReplicatorLogId) || null;
    setSelectedReplicatorLog(matchingLog);
  }, [replicatorLogs, selectedReplicatorLogId, setSelectedReplicatorLog]);

  return { refreshReplicatorWorkspace };
}
