import { useCallback, useEffect } from 'react';

export function useTransporterWorkspace({
  apiFetch,
  currentUser,
  selectedTransporterEventId,
  setError,
  setLoadingTransporter,
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

    const [logData, unitData, locationData] = await Promise.all([
      apiFetch(`/transporter/logs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch('/transporter/units'),
      apiFetch('/transporter/locations'),
    ]);

    setTransporterLogs(logData);
    setTransporterUnits(unitData);
    setTransporterLocations(locationData);
    return { logData, unitData, locationData };
  }, [
    apiFetch,
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
        const [logResult, unitResult, locationResult] = await Promise.allSettled([
          apiFetch(`/transporter/logs${params.toString() ? `?${params.toString()}` : ''}`),
          apiFetch('/transporter/units'),
          apiFetch('/transporter/locations'),
        ]);

        if (logResult.status === 'fulfilled') {
          setTransporterLogs(logResult.value);
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
      } finally {
        setLoadingTransporter(false);
      }
    }

    loadTransporterWorkspace();
  }, [
    apiFetch,
    currentUser,
    setError,
    setLoadingTransporter,
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
      return;
    }

    if (!transporterLogs.some((event) => event.event_id === selectedTransporterEventId)) {
      setSelectedTransporterEventId(null);
      setSelectedTransporterEvent(null);
    }
  }, [
    selectedTransporterEventId,
    setSelectedTransporterEvent,
    setSelectedTransporterEventId,
    transporterLogs,
  ]);

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
