import { useState } from 'react';
import MedicalChartWindow from './MedicalChartWindow';
import MedicalWorkspace from './MedicalWorkspace';
import { useMedicalWorkspace } from '../hooks/useMedicalWorkspace';
import {
  CREW_PAGE_SIZE,
  initialMedicalProfileForm,
  initialMedicalRecordForm,
} from '../lib/constants';
import {
  applyEpisodeSelection,
  findSeasonGuide,
  resetEpisodeFields,
  updateNamedInputValue,
  updateNamedValue,
} from '../lib/episodeForms';

function MedicalWorkspacePane({
  activeWorkspace,
  apiFetch,
  currentUser,
  dossierRef,
  setError,
  setSuccessMessage,
}) {
  const [medicalCharts, setMedicalCharts] = useState([]);
  const [medicalSearch, setMedicalSearch] = useState('');
  const [medicalPage, setMedicalPage] = useState(1);
  const [selectedMedicalCrewId, setSelectedMedicalCrewId] = useState(null);
  const [selectedMedicalChart, setSelectedMedicalChart] = useState(null);
  const [medicalTab, setMedicalTab] = useState('profile');
  const [medicalProfileForm, setMedicalProfileForm] = useState(initialMedicalProfileForm);
  const [medicalRecordForm, setMedicalRecordForm] = useState(initialMedicalRecordForm);
  const [loadingMedicalCharts, setLoadingMedicalCharts] = useState(true);
  const [loadingMedicalDetail, setLoadingMedicalDetail] = useState(false);
  const [submittingMedical, setSubmittingMedical] = useState(false);

  const { refreshMedicalChart } = useMedicalWorkspace({
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
  });

  const selectedMedicalSeasonGuide = findSeasonGuide(medicalRecordForm.episode_season);
  const totalMedicalPages = Math.max(1, Math.ceil(medicalCharts.length / CREW_PAGE_SIZE));
  const safeMedicalPage = Math.min(medicalPage, totalMedicalPages);
  const pagedMedicalCharts = medicalCharts.slice(
    (safeMedicalPage - 1) * CREW_PAGE_SIZE,
    safeMedicalPage * CREW_PAGE_SIZE
  );

  function handleMedicalProfileChange(event) {
    updateNamedValue(setMedicalProfileForm, event);
  }

  function handleMedicalRecordChange(event) {
    updateNamedInputValue(setMedicalRecordForm, event);
  }

  function handleMedicalRecordSeasonChange(event) {
    resetEpisodeFields(setMedicalRecordForm, event.target.value, ['visit_stardate']);
  }

  function handleMedicalRecordEpisodeChange(event) {
    applyEpisodeSelection(setMedicalRecordForm, selectedMedicalSeasonGuide, event.target.value, {
      stardateField: 'visit_stardate',
    });
  }

  async function handleMedicalProfileSubmit(event) {
    event.preventDefault();

    if (!selectedMedicalChart) {
      return;
    }

    setSubmittingMedical(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch('/medical/charts/profile', {
        method: 'POST',
        body: JSON.stringify({
          crew_id: selectedMedicalChart.crew_id,
          ...medicalProfileForm,
        }),
      });

      await refreshMedicalChart(selectedMedicalChart.crew_id);
      setSuccessMessage('Medical profile updated.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingMedical(false);
    }
  }

  async function handleMedicalRecordSubmit(event) {
    event.preventDefault();

    if (!selectedMedicalChart) {
      return;
    }

    setSubmittingMedical(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch('/medical/charts/records', {
        method: 'POST',
        body: JSON.stringify({
          crew_id: selectedMedicalChart.crew_id,
          ...medicalRecordForm,
        }),
      });

      await refreshMedicalChart(selectedMedicalChart.crew_id);
      setMedicalRecordForm(initialMedicalRecordForm);
      setMedicalTab('records');
      setSuccessMessage('Medical log entry added to the chart.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingMedical(false);
    }
  }

  return (
    <>
      <MedicalWorkspace
        loadingMedicalCharts={loadingMedicalCharts}
        medicalCharts={medicalCharts}
        medicalSearch={medicalSearch}
        pagedMedicalCharts={pagedMedicalCharts}
        safeMedicalPage={safeMedicalPage}
        selectedMedicalChart={selectedMedicalChart}
        selectedMedicalCrewId={selectedMedicalCrewId}
        setMedicalPage={setMedicalPage}
        setMedicalSearch={setMedicalSearch}
        setSelectedMedicalCrewId={setSelectedMedicalCrewId}
        totalMedicalPages={totalMedicalPages}
      />
      {(activeWorkspace === 'medical' || selectedMedicalChart) ? (
        <MedicalChartWindow
          activeWorkspace={activeWorkspace}
          closeChart={() => setSelectedMedicalCrewId(null)}
          dossierRef={dossierRef}
          handleMedicalProfileChange={handleMedicalProfileChange}
          handleMedicalProfileSubmit={handleMedicalProfileSubmit}
          handleMedicalRecordChange={handleMedicalRecordChange}
          handleMedicalRecordEpisodeChange={handleMedicalRecordEpisodeChange}
          handleMedicalRecordSeasonChange={handleMedicalRecordSeasonChange}
          handleMedicalRecordSubmit={handleMedicalRecordSubmit}
          loadingMedicalDetail={loadingMedicalDetail}
          medicalProfileForm={medicalProfileForm}
          medicalRecordForm={medicalRecordForm}
          medicalTab={medicalTab}
          selectedMedicalChart={selectedMedicalChart}
          selectedMedicalSeasonGuide={selectedMedicalSeasonGuide}
          setMedicalTab={setMedicalTab}
          submittingMedical={submittingMedical}
        />
      ) : null}
    </>
  );
}

export default MedicalWorkspacePane;
