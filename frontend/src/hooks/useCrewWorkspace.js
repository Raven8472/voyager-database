import { useEffect } from 'react';

export function useCrewWorkspace({
  apiFetch,
  currentUser,
  departmentFilter,
  designation,
  initialFormState,
  search,
  selectedCrewId,
  setCrew,
  setCrewPage,
  setDossierTab,
  setError,
  setFormState,
  setLoadingCrew,
  setLoadingDetail,
  setSelectedCrew,
  setSelectedCrewId,
}) {
  useEffect(() => {
    async function loadCrew() {
      if (!currentUser) {
        setLoadingCrew(false);
        return;
      }

      setLoadingCrew(true);
      setError('');

      const params = new URLSearchParams();
      if (search.trim()) {
        params.set('search', search.trim());
      }
      if (designation) {
        params.set('designation', designation);
      }
      if (departmentFilter) {
        params.set('department_id', departmentFilter);
      }

      try {
        const crewData = await apiFetch(`/crew${params.toString() ? `?${params.toString()}` : ''}`);
        setCrew(crewData);

        if (!crewData.length) {
          setSelectedCrewId(null);
          setSelectedCrew(null);
          return;
        }

        const stillVisible = crewData.some((person) => person.crew_id === selectedCrewId);
        if (selectedCrewId && !stillVisible) {
          setSelectedCrewId(null);
          setSelectedCrew(null);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingCrew(false);
      }
    }

    loadCrew();
  }, [
    apiFetch,
    currentUser,
    departmentFilter,
    designation,
    search,
    selectedCrewId,
    setCrew,
    setError,
    setLoadingCrew,
    setSelectedCrew,
    setSelectedCrewId,
  ]);

  useEffect(() => {
    setCrewPage(1);
  }, [departmentFilter, designation, search, setCrewPage]);

  useEffect(() => {
    async function loadCrewDetail() {
      if (!selectedCrewId) {
        setSelectedCrew(null);
        return;
      }

      setLoadingDetail(true);
      setError('');

      try {
        const detail = await apiFetch(`/crew/${selectedCrewId}`);
        setSelectedCrew(detail);
        setDossierTab('history');
        setFormState((current) => ({
          ...initialFormState,
          entered_by: current.entered_by || initialFormState.entered_by,
          new_rank: detail.rank || '',
          new_species: detail.species || '',
          new_planet_of_origin: detail.planet_of_origin || '',
          new_department_id: String(detail.department_id || ''),
        }));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingDetail(false);
      }
    }

    loadCrewDetail();
  }, [
    apiFetch,
    initialFormState,
    selectedCrewId,
    setDossierTab,
    setError,
    setFormState,
    setLoadingDetail,
    setSelectedCrew,
  ]);
}
