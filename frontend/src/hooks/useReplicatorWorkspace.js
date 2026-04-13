import { useCallback, useEffect } from 'react';

export function useReplicatorWorkspace({
  apiFetch,
  currentUser,
  replicatorLogs,
  replicatorSearch,
  selectedReplicatorLogId,
  setError,
  setLoadingReplicator,
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

    const [logData, patternData, unitData] = await Promise.all([
      apiFetch(`/replicator/logs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/replicator/patterns${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/replicator/units${params.toString() ? `?${params.toString()}` : ''}`),
    ]);

    setReplicatorLogs(logData);
    setReplicatorPatterns(patternData);
    setReplicatorUnits(unitData);
    return { logData, patternData, unitData };
  }, [
    apiFetch,
    replicatorSearch,
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
        await refreshReplicatorWorkspace();
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
    setError,
    setLoadingReplicator,
  ]);

  useEffect(() => {
    setReplicatorPage(1);
  }, [replicatorSearch, setReplicatorPage]);

  useEffect(() => {
    setReplicatorPatternPage(1);
  }, [replicatorSearch, setReplicatorPatternPage]);

  useEffect(() => {
    if (!selectedReplicatorLogId) {
      return;
    }

    if (!replicatorLogs.some((log) => log.log_id === selectedReplicatorLogId)) {
      setSelectedReplicatorLogId(null);
      setSelectedReplicatorLog(null);
    }
  }, [
    replicatorLogs,
    selectedReplicatorLogId,
    setSelectedReplicatorLog,
    setSelectedReplicatorLogId,
  ]);

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
