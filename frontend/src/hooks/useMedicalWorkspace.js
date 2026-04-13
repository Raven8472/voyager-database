import { useCallback, useEffect } from 'react';

export function useMedicalWorkspace({
  apiFetch,
  currentUser,
  initialMedicalRecordForm,
  medicalSearch,
  selectedMedicalCrewId,
  setError,
  setLoadingMedicalCharts,
  setLoadingMedicalDetail,
  setMedicalCharts,
  setMedicalPage,
  setMedicalProfileForm,
  setMedicalRecordForm,
  setMedicalTab,
  setSelectedMedicalChart,
  setSelectedMedicalCrewId,
}) {
  const refreshMedicalChart = useCallback(async (crewId, options = {}) => {
    const { reloadList = false } = options;
    const detail = await apiFetch(`/medical/charts/${crewId}`);

    setSelectedMedicalChart(detail);

    if (reloadList) {
      const params = new URLSearchParams();
      if (medicalSearch.trim()) {
        params.set('search', medicalSearch.trim());
      }

      const chartData = await apiFetch(`/medical/charts${params.toString() ? `?${params.toString()}` : ''}`);
      setMedicalCharts(chartData);
      return detail;
    }

    setMedicalCharts((currentCharts) =>
      currentCharts.map((chart) =>
        chart.crew_id === detail.crew_id
          ? {
              ...chart,
              first_name: detail.first_name,
              last_name: detail.last_name,
              display_name: detail.display_name,
              birth_stardate: detail.birth_stardate,
              species: detail.species,
              profile_exists: Boolean(detail.medical_profile),
              record_count: detail.medical_records.length,
            }
          : chart
      )
    );

    return detail;
  }, [apiFetch, medicalSearch, setMedicalCharts, setSelectedMedicalChart]);

  useEffect(() => {
    async function loadMedicalCharts() {
      if (!currentUser) {
        setLoadingMedicalCharts(false);
        return;
      }

      setLoadingMedicalCharts(true);
      setError('');

      const params = new URLSearchParams();
      if (medicalSearch.trim()) {
        params.set('search', medicalSearch.trim());
      }

      try {
        const chartData = await apiFetch(`/medical/charts${params.toString() ? `?${params.toString()}` : ''}`);
        setMedicalCharts(chartData);

        if (!chartData.length) {
          setSelectedMedicalCrewId(null);
          setSelectedMedicalChart(null);
          return;
        }

        const stillVisible = chartData.some((chart) => chart.crew_id === selectedMedicalCrewId);
        if (selectedMedicalCrewId && !stillVisible) {
          setSelectedMedicalCrewId(null);
          setSelectedMedicalChart(null);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingMedicalCharts(false);
      }
    }

    loadMedicalCharts();
  }, [
    apiFetch,
    currentUser,
    medicalSearch,
    selectedMedicalCrewId,
    setError,
    setLoadingMedicalCharts,
    setMedicalCharts,
    setSelectedMedicalChart,
    setSelectedMedicalCrewId,
  ]);

  useEffect(() => {
    setMedicalPage(1);
  }, [medicalSearch, setMedicalPage]);

  useEffect(() => {
    async function loadMedicalChartDetail() {
      if (!currentUser) {
        setSelectedMedicalChart(null);
        return;
      }

      if (!selectedMedicalCrewId) {
        setSelectedMedicalChart(null);
        return;
      }

      setLoadingMedicalDetail(true);
      setError('');

      try {
        const detail = await apiFetch(`/medical/charts/${selectedMedicalCrewId}`);
        setSelectedMedicalChart(detail);
        setMedicalTab('profile');
        setMedicalProfileForm({
          blood_type: detail.medical_profile?.blood_type || '',
          allergies: detail.medical_profile?.allergies || '',
          chronic_conditions: detail.medical_profile?.chronic_conditions || '',
          emergency_contact: detail.medical_profile?.emergency_contact || '',
        });
        setMedicalRecordForm(initialMedicalRecordForm);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingMedicalDetail(false);
      }
    }

    loadMedicalChartDetail();
  }, [
    apiFetch,
    currentUser,
    initialMedicalRecordForm,
    selectedMedicalCrewId,
    setError,
    setLoadingMedicalDetail,
    setMedicalProfileForm,
    setMedicalRecordForm,
    setMedicalTab,
    setSelectedMedicalChart,
  ]);

  return { refreshMedicalChart };
}
