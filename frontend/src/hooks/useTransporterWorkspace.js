import { useCallback, useEffect } from 'react';

export function useTransporterWorkspace({
  apiFetch,
  currentUser,
  selectedTransporterEventId,
  setError,
  setLoadingTransporter,
  setReplicatorCrewOptions,
  setSelectedTransporterEvent,
  setSelectedTransporterEventId,
  setTransporterLocations,
  setTransporterLogs,
  setTransporterPage,
  setTransporterUnits,
  transporterLogs,
  transporterSearch,
}) {
  const refreshTransporterWorkspace = useCallback(async () => {
    const params = new URLSearchParams();
    if (transporterSearch.trim()) {
      params.set('search', transporterSearch.trim());
    }

    const [logData, unitData, locationData, crewData] = await Promise.all([
      apiFetch(`/transporter/logs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch('/transporter/units'),
      apiFetch('/transporter/locations'),
      apiFetch('/crew'),
    ]);

    setTransporterLogs(logData);
    setTransporterUnits(unitData);
    setTransporterLocations(locationData);
    setReplicatorCrewOptions(crewData);
    return { logData, unitData, locationData, crewData };
  }, [
    apiFetch,
    setReplicatorCrewOptions,
    setTransporterLocations,
    setTransporterLogs,
    setTransporterUnits,
    transporterSearch,
  ]);

  useEffect(() => {
    async function loadTransporterWorkspace() {
      if (!currentUser) {
        setLoadingTransporter(false);
        return;
      }

      setLoadingTransporter(true);
      setError('');

      const params = new URLSearchParams();
      if (transporterSearch.trim()) {
        params.set('search', transporterSearch.trim());
      }

      try {
        const [logResult, unitResult, locationResult, crewResult] = await Promise.allSettled([
          apiFetch(`/transporter/logs${params.toString() ? `?${params.toString()}` : ''}`),
          apiFetch('/transporter/units'),
          apiFetch('/transporter/locations'),
          apiFetch('/crew'),
        ]);

        if (logResult.status === 'fulfilled') {
          setTransporterLogs(logResult.value);
          if (selectedTransporterEventId && !logResult.value.some((event) => event.event_id === selectedTransporterEventId)) {
            setSelectedTransporterEventId(null);
            setSelectedTransporterEvent(null);
          }
        } else {
          setTransporterLogs([]);
          setError(logResult.reason.message);
        }

        if (unitResult.status === 'fulfilled') {
          setTransporterUnits(unitResult.value);
        } else {
          setTransporterUnits([]);
          setError(unitResult.reason.message);
        }

        if (locationResult.status === 'fulfilled') {
          setTransporterLocations(locationResult.value);
        } else {
          setTransporterLocations([]);
          setError(locationResult.reason.message);
        }

        if (crewResult.status === 'fulfilled') {
          setReplicatorCrewOptions(crewResult.value);
        } else {
          setError(crewResult.reason.message);
        }
      } finally {
        setLoadingTransporter(false);
      }
    }

    loadTransporterWorkspace();
  }, [
    apiFetch,
    currentUser,
    selectedTransporterEventId,
    setError,
    setLoadingTransporter,
    setReplicatorCrewOptions,
    setSelectedTransporterEvent,
    setSelectedTransporterEventId,
    setTransporterLocations,
    setTransporterLogs,
    setTransporterUnits,
    transporterSearch,
  ]);

  useEffect(() => {
    setTransporterPage(1);
  }, [setTransporterPage, transporterSearch]);

  useEffect(() => {
    if (!selectedTransporterEventId) {
      setSelectedTransporterEvent(null);
      return;
    }

    const matchingEvent = transporterLogs.find((event) => event.event_id === selectedTransporterEventId) || null;
    setSelectedTransporterEvent(matchingEvent);
  }, [selectedTransporterEventId, setSelectedTransporterEvent, transporterLogs]);

  return { refreshTransporterWorkspace };
}
