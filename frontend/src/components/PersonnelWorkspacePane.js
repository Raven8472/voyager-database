import { useEffect, useState } from 'react';
import CrewCreateWindow from './CrewCreateWindow';
import PersonnelDossier from './PersonnelDossier';
import PersonnelWorkspace from './PersonnelWorkspace';
import { useCrewWorkspace } from '../hooks/useCrewWorkspace';
import { usePersonnelMedicalSubmitHandlers } from '../hooks/usePersonnelMedicalSubmitHandlers';
import {
  CREW_PAGE_SIZE,
  initialCrewCreateForm,
  initialFormState,
} from '../lib/constants';
import {
  applyEpisodeSelection,
  findSeasonGuide,
  resetEpisodeFields,
  updateNamedValue,
} from '../lib/episodeForms';

function PersonnelWorkspacePane({
  activeWorkspace,
  apiFetch,
  currentUser,
  departments,
  dossierRef,
  recentActions,
  setCrewOptions,
  setError,
  setHealth,
  setRecentActions,
  setSuccessMessage,
}) {
  const [crew, setCrew] = useState([]);
  const [selectedCrewId, setSelectedCrewId] = useState(null);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showCrewCreate, setShowCrewCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [designation, setDesignation] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [crewPage, setCrewPage] = useState(1);
  const [dossierTab, setDossierTab] = useState('history');
  const [formState, setFormState] = useState(initialFormState);
  const [crewCreateForm, setCrewCreateForm] = useState(initialCrewCreateForm);
  const [loadingCrew, setLoadingCrew] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittingCrewCreate, setSubmittingCrewCreate] = useState(false);

  useCrewWorkspace({
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
  });

  const { handleCrewCreateSubmit, handleSubmit } = usePersonnelMedicalSubmitHandlers({
    apiFetch,
    crewCreateForm,
    formState,
    handleSetError: setError,
    handleSetSuccess: setSuccessMessage,
    initialCrewCreateForm,
    initialFormState,
    selectedCrew,
    setCrew,
    setCrewCreateForm,
    setFormState,
    setHealth,
    setRecentActions,
    setReplicatorCrewOptions: setCrewOptions,
    setSelectedCrew,
    setSelectedCrewId,
    setShowCrewCreate,
    setSubmitting,
    setSubmittingCrewCreate,
  });

  useEffect(() => {
    if (selectedCrew && dossierRef.current) {
      dossierRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [dossierRef, selectedCrew]);

  function handleFormChange(event) {
    updateNamedValue(setFormState, event);
  }

  function handleSeasonChange(event) {
    const season = event.target.value;
    resetEpisodeFields(setFormState, season, ['effective_stardate', 'episode_reference']);
  }

  const selectedSeasonGuide = findSeasonGuide(formState.episode_season);

  function handleEpisodeChange(event) {
    applyEpisodeSelection(setFormState, selectedSeasonGuide, event.target.value, {
      stardateField: 'effective_stardate',
      referenceField: 'episode_reference',
    });
  }

  function handleCrewCreateChange(event) {
    updateNamedValue(setCrewCreateForm, event);
  }

  const totalCrewPages = Math.max(1, Math.ceil(crew.length / CREW_PAGE_SIZE));
  const safeCrewPage = Math.min(crewPage, totalCrewPages);
  const pagedCrew = crew.slice((safeCrewPage - 1) * CREW_PAGE_SIZE, safeCrewPage * CREW_PAGE_SIZE);
  const selectedDepartmentName = departments.find(
    (department) => String(department.department_id) === String(formState.new_department_id)
  )?.department_name;

  return (
    <>
      <PersonnelWorkspace
        crew={crew}
        departments={departments}
        designation={designation}
        departmentFilter={departmentFilter}
        loadingCrew={loadingCrew}
        pagedCrew={pagedCrew}
        safeCrewPage={safeCrewPage}
        search={search}
        selectedCrew={selectedCrew}
        selectedCrewId={selectedCrewId}
        setCrewPage={setCrewPage}
        setDepartmentFilter={setDepartmentFilter}
        setDesignation={setDesignation}
        setSearch={setSearch}
        setSelectedCrewId={setSelectedCrewId}
        setShowCrewCreate={setShowCrewCreate}
        totalCrewPages={totalCrewPages}
      />
      {(activeWorkspace === 'personnel' || selectedCrew) ? (
        <PersonnelDossier
          departments={departments}
          dossierRef={dossierRef}
          dossierTab={dossierTab}
          formState={formState}
          handleEpisodeChange={handleEpisodeChange}
          handleFormChange={handleFormChange}
          handleSeasonChange={handleSeasonChange}
          handleSubmit={handleSubmit}
          loadingDetail={loadingDetail}
          recentActions={recentActions}
          selectedCrew={selectedCrew}
          selectedDepartmentName={selectedDepartmentName}
          selectedSeasonGuide={selectedSeasonGuide}
          setDossierTab={setDossierTab}
          setSelectedCrewId={setSelectedCrewId}
          submitting={submitting}
        />
      ) : null}
      {(activeWorkspace === 'personnel' || showCrewCreate) ? (
        <CrewCreateWindow
          activeWorkspace={activeWorkspace}
          crewCreateForm={crewCreateForm}
          departments={departments}
          handleCrewCreateChange={handleCrewCreateChange}
          handleCrewCreateSubmit={handleCrewCreateSubmit}
          setShowCrewCreate={setShowCrewCreate}
          showCrewCreate={showCrewCreate}
          submittingCrewCreate={submittingCrewCreate}
        />
      ) : null}
    </>
  );
}

export default PersonnelWorkspacePane;
