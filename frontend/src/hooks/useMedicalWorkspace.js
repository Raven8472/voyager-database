import { useCallback, useEffect } from 'react';

export function useMedicalWorkspace({
  apiFetch,
  currentUser,
  initialMedicalRecordForm,
  medicalCharts,
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
  const refreshMedicalChart = useCallback(async (crewId) => {
    const params = new URLSearchParams();
    if (medicalSearch.trim()) {
      params.set('search', medicalSearch.trim());
    }

    const [detail, chartData] = await Promise.all([
      apiFetch(`/medical/charts/${crewId}`),
      apiFetch(`/medical/charts${params.toString() ? `?${params.toString()}` : ''}`),
    ]);

    setSelectedMedicalChart(detail);
    setMedicalCharts(chartData);
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
