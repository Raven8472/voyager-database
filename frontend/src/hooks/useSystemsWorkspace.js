import { useEffect } from 'react';

export function useSystemsWorkspace({
  apiFetch,
  currentUser,
  selectedCompartmentId,
  setError,
  setLoadingSystemDetail,
  setLoadingSystems,
  setSelectedCompartment,
  setSelectedCompartmentId,
  setSystemsCompartments,
  setSystemsPage,
  systemsSearch,
}) {
  useEffect(() => {
    async function loadSystemsCompartments() {
      if (!currentUser) {
        setLoadingSystems(false);
        return;
      }

      setLoadingSystems(true);
      setError('');

      const params = new URLSearchParams();
      if (systemsSearch.trim()) {
        params.set('search', systemsSearch.trim());
      }

      try {
        const compartmentData = await apiFetch(`/systems/compartments${params.toString() ? `?${params.toString()}` : ''}`);
        setSystemsCompartments(compartmentData);

        if (!compartmentData.length) {
          setSelectedCompartmentId(null);
          setSelectedCompartment(null);
          return;
        }

        const stillVisible = compartmentData.some((compartment) => compartment.compartment_id === selectedCompartmentId);
        if (selectedCompartmentId && !stillVisible) {
          setSelectedCompartmentId(null);
          setSelectedCompartment(null);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingSystems(false);
      }
    }

    loadSystemsCompartments();
  }, [
    apiFetch,
    currentUser,
    selectedCompartmentId,
    setError,
    setLoadingSystems,
    setSelectedCompartment,
    setSelectedCompartmentId,
    setSystemsCompartments,
    systemsSearch,
  ]);

  useEffect(() => {
    setSystemsPage(1);
  }, [setSystemsPage, systemsSearch]);

  useEffect(() => {
    async function loadCompartmentDetail() {
      if (!currentUser) {
        setSelectedCompartment(null);
        return;
      }

      if (!selectedCompartmentId) {
        setSelectedCompartment(null);
        return;
      }

      setLoadingSystemDetail(true);
      setError('');

      try {
        const detail = await apiFetch(`/systems/compartments/${selectedCompartmentId}`);
        setSelectedCompartment(detail);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingSystemDetail(false);
      }
    }

    loadCompartmentDetail();
  }, [
    apiFetch,
    currentUser,
    selectedCompartmentId,
    setError,
    setLoadingSystemDetail,
    setSelectedCompartment,
  ]);
}
