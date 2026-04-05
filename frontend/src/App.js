import { useEffect, useRef, useState } from 'react';
import './App.css';
import AppOverlays from './components/AppOverlays';
import AuthScreen from './components/AuthScreen';
import LcarsShell from './components/LcarsShell';
import WorkspaceContent from './components/WorkspaceContent';
import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import { useCrewWorkspace } from './hooks/useCrewWorkspace';
import { useHolodeckWorkspace } from './hooks/useHolodeckWorkspace';
import { useActivitySubmitHandlers } from './hooks/useActivitySubmitHandlers';
import { useMedicalWorkspace } from './hooks/useMedicalWorkspace';
import { usePersonnelMedicalSubmitHandlers } from './hooks/usePersonnelMedicalSubmitHandlers';
import { useReplicatorWorkspace } from './hooks/useReplicatorWorkspace';
import { useSystemsWorkspace } from './hooks/useSystemsWorkspace';
import { useTransporterWorkspace } from './hooks/useTransporterWorkspace';
import {
  API_BASE_URL,
  AUTH_STORAGE_KEY,
  CREW_PAGE_SIZE,
  initialAuthForm,
  initialCrewCreateForm,
  initialFormState,
  initialHolodeckLogForm,
  initialHolodeckProgramForm,
  initialMedicalProfileForm,
  initialMedicalRecordForm,
  initialReplicatorLogForm,
  initialReplicatorPatternForm,
  initialTransporterLogForm,
} from './lib/constants';
import { apiFetch } from './lib/api';
import {
  applyEpisodeSelection,
  findSeasonGuide,
  resetEpisodeFields,
  updateNamedInputValue,
  updateNamedValue,
} from './lib/episodeForms';
import { getWorkspaceMeta } from './lib/workspaceMeta';

function App() {
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem(AUTH_STORAGE_KEY) || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('personnel');
  const [health, setHealth] = useState(null);
  const [crew, setCrew] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
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
  const [transporterLogs, setTransporterLogs] = useState([]);
  const [transporterUnits, setTransporterUnits] = useState([]);
  const [transporterLocations, setTransporterLocations] = useState([]);
  const [transporterSearch, setTransporterSearch] = useState('');
  const [transporterPage, setTransporterPage] = useState(1);
  const [selectedTransporterEventId, setSelectedTransporterEventId] = useState(null);
  const [selectedTransporterEvent, setSelectedTransporterEvent] = useState(null);
  const [showTransporterConsole, setShowTransporterConsole] = useState(false);
  const [transporterTab, setTransporterTab] = useState('newlog');
  const [transporterLogForm, setTransporterLogForm] = useState(initialTransporterLogForm);
  const [loadingTransporter, setLoadingTransporter] = useState(true);
  const [submittingTransporter, setSubmittingTransporter] = useState(false);
  const [replicatorLogs, setReplicatorLogs] = useState([]);
  const [replicatorPatterns, setReplicatorPatterns] = useState([]);
  const [replicatorUnits, setReplicatorUnits] = useState([]);
  const [replicatorCrewOptions, setReplicatorCrewOptions] = useState([]);
  const [replicatorSearch, setReplicatorSearch] = useState('');
  const [replicatorPage, setReplicatorPage] = useState(1);
  const [selectedReplicatorLogId, setSelectedReplicatorLogId] = useState(null);
  const [selectedReplicatorLog, setSelectedReplicatorLog] = useState(null);
  const [showReplicatorConsole, setShowReplicatorConsole] = useState(false);
  const [replicatorTab, setReplicatorTab] = useState('newlog');
  const [replicatorLogForm, setReplicatorLogForm] = useState(initialReplicatorLogForm);
  const [replicatorPatternForm, setReplicatorPatternForm] = useState(initialReplicatorPatternForm);
  const [replicatorPatternPage, setReplicatorPatternPage] = useState(1);
  const [loadingReplicator, setLoadingReplicator] = useState(true);
  const [submittingReplicator, setSubmittingReplicator] = useState(false);
  const [submittingReplicatorPattern, setSubmittingReplicatorPattern] = useState(false);
  const [holodeckLogs, setHolodeckLogs] = useState([]);
  const [holodeckPrograms, setHolodeckPrograms] = useState([]);
  const [holodeckUnits, setHolodeckUnits] = useState([]);
  const [holodeckSearch, setHolodeckSearch] = useState('');
  const [holodeckPage, setHolodeckPage] = useState(1);
  const [selectedHolodeckLogId, setSelectedHolodeckLogId] = useState(null);
  const [selectedHolodeckLog, setSelectedHolodeckLog] = useState(null);
  const [showHolodeckConsole, setShowHolodeckConsole] = useState(false);
  const [holodeckTab, setHolodeckTab] = useState('newlog');
  const [holodeckLogForm, setHolodeckLogForm] = useState(initialHolodeckLogForm);
  const [holodeckProgramForm, setHolodeckProgramForm] = useState(initialHolodeckProgramForm);
  const [loadingHolodeck, setLoadingHolodeck] = useState(true);
  const [submittingHolodeck, setSubmittingHolodeck] = useState(false);
  const [submittingHolodeckProgram, setSubmittingHolodeckProgram] = useState(false);
  const [systemsCompartments, setSystemsCompartments] = useState([]);
  const [systemsSearch, setSystemsSearch] = useState('');
  const [systemsPage, setSystemsPage] = useState(1);
  const [selectedCompartmentId, setSelectedCompartmentId] = useState(null);
  const [selectedCompartment, setSelectedCompartment] = useState(null);
  const [loadingSystems, setLoadingSystems] = useState(true);
  const [loadingSystemDetail, setLoadingSystemDetail] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const dossierRef = useRef(null);
  const selectedSeasonGuide = findSeasonGuide(formState.episode_season);
  const selectedMedicalSeasonGuide = findSeasonGuide(medicalRecordForm.episode_season);
  const selectedTransporterSeasonGuide = findSeasonGuide(transporterLogForm.episode_season);
  const selectedReplicatorSeasonGuide = findSeasonGuide(replicatorLogForm.episode_season);
  const selectedHolodeckSeasonGuide = findSeasonGuide(holodeckLogForm.episode_season);

  useAuthBootstrap({
    apiFetch,
    authToken,
    setAuthLoading,
    setAuthToken,
    setCurrentUser,
    setDepartments,
    setError,
    setHealth,
    setRecentActions,
  });

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

  const { refreshTransporterWorkspace } = useTransporterWorkspace({
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
  });

  const { refreshHolodeckWorkspace } = useHolodeckWorkspace({
    apiFetch,
    currentUser,
    holodeckLogs,
    holodeckSearch,
    selectedHolodeckLogId,
    setError,
    setHolodeckPage,
    setHolodeckPrograms,
    setHolodeckUnits,
    setLoadingHolodeck,
    setReplicatorCrewOptions,
    setSelectedHolodeckLog,
    setSelectedHolodeckLogId,
    setHolodeckLogs,
  });

  const { refreshReplicatorWorkspace } = useReplicatorWorkspace({
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
  });

  const { refreshMedicalChart } = useMedicalWorkspace({
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
  });

  useSystemsWorkspace({
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
  });

  const {
    handleHolodeckLogSubmit,
    handleHolodeckProgramSubmit,
    handleReplicatorLogSubmit,
    handleReplicatorPatternSubmit,
    handleTransporterLogSubmit,
  } = useActivitySubmitHandlers({
    apiFetch,
    handleSetError: setError,
    handleSetSuccess: setSuccessMessage,
    holodeckLogForm,
    holodeckProgramForm,
    initialHolodeckLogForm,
    initialHolodeckProgramForm,
    initialReplicatorLogForm,
    initialReplicatorPatternForm,
    initialTransporterLogForm,
    refreshHolodeckWorkspace,
    refreshReplicatorWorkspace,
    refreshTransporterWorkspace,
    replicatorLogForm,
    replicatorPatternForm,
    setHolodeckLogForm,
    setHolodeckProgramForm,
    setHolodeckTab,
    setReplicatorLogForm,
    setReplicatorPatternForm,
    setReplicatorTab,
    setSelectedHolodeckLogId,
    setSelectedReplicatorLogId,
    setSelectedTransporterEventId,
    setShowHolodeckConsole,
    setShowReplicatorConsole,
    setShowTransporterConsole,
    setSubmittingHolodeck,
    setSubmittingHolodeckProgram,
    setSubmittingReplicator,
    setSubmittingReplicatorPattern,
    setSubmittingTransporter,
    setTransporterLogForm,
    setTransporterTab,
    transporterLogForm,
  });

  const {
    handleCrewCreateSubmit,
    handleMedicalProfileSubmit,
    handleMedicalRecordSubmit,
    handleSubmit,
  } = usePersonnelMedicalSubmitHandlers({
    apiFetch,
    crewCreateForm,
    formState,
    handleSetError: setError,
    handleSetSuccess: setSuccessMessage,
    initialCrewCreateForm,
    initialFormState,
    initialMedicalRecordForm,
    medicalProfileForm,
    medicalRecordForm,
    refreshMedicalChart,
    selectedCrew,
    selectedMedicalChart,
    setCrew,
    setCrewCreateForm,
    setFormState,
    setHealth,
    setMedicalRecordForm,
    setMedicalTab,
    setRecentActions,
    setReplicatorCrewOptions,
    setSelectedCrew,
    setSelectedCrewId,
    setShowCrewCreate,
    setSubmitting,
    setSubmittingCrewCreate,
    setSubmittingMedical,
  });

  useEffect(() => {
    if (selectedCrew && dossierRef.current) {
      dossierRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCrew]);

  function handleFormChange(event) {
    updateNamedValue(setFormState, event);
  }

  function handleSeasonChange(event) {
    const season = event.target.value;
    resetEpisodeFields(setFormState, season, ['effective_stardate', 'episode_reference']);
  }

  function handleEpisodeChange(event) {
    applyEpisodeSelection(setFormState, selectedSeasonGuide, event.target.value, {
      stardateField: 'effective_stardate',
      referenceField: 'episode_reference',
    });
  }

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

  function handleCrewCreateChange(event) {
    updateNamedValue(setCrewCreateForm, event);
  }

  function handleAuthChange(event) {
    updateNamedValue(setAuthForm, event);
  }

  function handleReplicatorLogChange(event) {
    updateNamedValue(setReplicatorLogForm, event);
  }

  function handleReplicatorSeasonChange(event) {
    resetEpisodeFields(setReplicatorLogForm, event.target.value, ['timestamp']);
  }

  function handleReplicatorEpisodeChange(event) {
    applyEpisodeSelection(setReplicatorLogForm, selectedReplicatorSeasonGuide, event.target.value, {
      stardateField: 'timestamp',
    });
  }

  function handleHolodeckLogChange(event) {
    updateNamedValue(setHolodeckLogForm, event);
  }

  function handleHolodeckSeasonChange(event) {
    resetEpisodeFields(setHolodeckLogForm, event.target.value, ['stardate']);
  }

  function handleHolodeckEpisodeChange(event) {
    applyEpisodeSelection(setHolodeckLogForm, selectedHolodeckSeasonGuide, event.target.value, {
      stardateField: 'stardate',
    });
  }

  function handleTransporterChange(event) {
    updateNamedValue(setTransporterLogForm, event);
  }

  function handleTransporterSeasonChange(event) {
    resetEpisodeFields(setTransporterLogForm, event.target.value, ['stardate']);
  }

  function handleTransporterEpisodeChange(event) {
    applyEpisodeSelection(setTransporterLogForm, selectedTransporterSeasonGuide, event.target.value, {
      stardateField: 'stardate',
    });
  }

  function handleTransporterPassengerChange(index, value) {
    setTransporterLogForm((current) => {
      const nextPassengerIds = [...current.passenger_crew_ids];
      nextPassengerIds[index] = value;
      return {
        ...current,
        passenger_crew_ids: nextPassengerIds,
      };
    });
  }

  function handleReplicatorPatternChange(event) {
    updateNamedValue(setReplicatorPatternForm, event);
  }

  function handleHolodeckProgramChange(event) {
    updateNamedValue(setHolodeckProgramForm, event);
  }

  function openReplicatorConsole(tab = 'newlog', logId = null) {
    setShowReplicatorConsole(true);
    setReplicatorTab(tab);
    setSelectedReplicatorLogId(logId);
  }

  function closeReplicatorConsole() {
    setShowReplicatorConsole(false);
    setSelectedReplicatorLogId(null);
    setSelectedReplicatorLog(null);
    setReplicatorTab('newlog');
  }

  function openHolodeckConsole(tab = 'newlog', logId = null) {
    setShowHolodeckConsole(true);
    setHolodeckTab(tab);
    setSelectedHolodeckLogId(logId);
  }

  function closeHolodeckConsole() {
    setShowHolodeckConsole(false);
    setSelectedHolodeckLogId(null);
    setSelectedHolodeckLog(null);
    setHolodeckTab('newlog');
  }

  async function openTransporterConsole(tab = 'newlog', eventId = null) {
    let availableUnits = transporterUnits;
    let availableLocations = transporterLocations;

    if (!transporterUnits.length || !transporterLocations.length) {
      try {
        const refreshData = await refreshTransporterWorkspace();
        availableUnits = refreshData.unitData;
        availableLocations = refreshData.locationData;
      } catch (loadError) {
        setError(loadError.message);
      }
    }
    if (tab === 'newlog') {
      setTransporterLogForm((current) => ({
        ...initialTransporterLogForm,
        transporter_unit_id: current.transporter_unit_id || availableUnits[0]?.unit_id || '',
        ship_location_id: current.ship_location_id || availableLocations[0]?.compartment_id || '',
      }));
    }
    setShowTransporterConsole(true);
    setTransporterTab(tab);
    setSelectedTransporterEventId(eventId);
  }

  function closeTransporterConsole() {
    setShowTransporterConsole(false);
    setSelectedTransporterEventId(null);
    setSelectedTransporterEvent(null);
    setTransporterTab('newlog');
    setTransporterLogForm(initialTransporterLogForm);
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthSubmitting(true);
    setError('');
    setSuccessMessage('');

    if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
      setAuthSubmitting(false);
      setError('Authorization code confirmation does not match.');
      return;
    }

    try {
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const authData = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });

      window.localStorage.setItem(AUTH_STORAGE_KEY, authData.token);
      setAuthToken(authData.token);
      setCurrentUser(authData.user);
      setAuthForm(initialAuthForm);
      setSuccessMessage(authMode === 'register' ? 'Access node created. Credentials accepted.' : 'Access granted. Vital databases unlocked.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setAuthSubmitting(false);
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (logoutError) {
      // Even if the remote session is already invalid, the local terminal should still close cleanly.
    } finally {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuthToken('');
      setCurrentUser(null);
      setAuthMode('login');
      setAuthForm(initialAuthForm);
      setHealth(null);
      setRecentActions([]);
      setSelectedCrewId(null);
      setSelectedCrew(null);
      setSelectedMedicalCrewId(null);
      setSelectedMedicalChart(null);
      setSelectedCompartmentId(null);
      setSelectedCompartment(null);
      setShowReplicatorConsole(false);
      setSelectedReplicatorLogId(null);
      setSelectedReplicatorLog(null);
      setShowHolodeckConsole(false);
      setSelectedHolodeckLogId(null);
      setSelectedHolodeckLog(null);
      setError('');
      setSuccessMessage('');
    }
  }

  const selectedDepartmentName = departments.find(
    (department) => String(department.department_id) === String(formState.new_department_id)
  )?.department_name;
  const selectedReplicatorCrew = replicatorCrewOptions.find(
    (member) => String(member.crew_id) === String(replicatorLogForm.crew_id)
  );
  const selectedReplicatorUnit = replicatorUnits.find(
    (unit) => unit.unit_id === replicatorLogForm.replicator_unit_id
  );
  const selectedReplicatorPattern = replicatorPatterns.find(
    (pattern) => String(pattern.pattern_id) === String(replicatorLogForm.pattern_id)
  );
  const selectedHolodeckCrew = replicatorCrewOptions.find(
    (member) => String(member.crew_id) === String(holodeckLogForm.crew_id)
  );
  const selectedHolodeckUnit = holodeckUnits.find(
    (unit) => unit.holodeck_id === holodeckLogForm.holodeck_id
  );
  const selectedHolodeckProgram = holodeckPrograms.find(
    (program) => String(program.program_id) === String(holodeckLogForm.program_id)
  );
  const selectedTransporterUnit = transporterUnits.find(
    (unit) => unit.unit_id === transporterLogForm.transporter_unit_id
  );
  const selectedTransporterLocation = transporterLocations.find(
    (location) => location.compartment_id === transporterLogForm.ship_location_id
  );
  const selectedTransporterOperator = replicatorCrewOptions.find(
    (member) => String(member.crew_id) === String(transporterLogForm.operator_crew_id)
  );
  const selectedTransporterPassengers = transporterLogForm.passenger_crew_ids
    .filter((crewId) => crewId)
    .map((crewId) => replicatorCrewOptions.find((member) => String(member.crew_id) === String(crewId)))
    .filter(Boolean);
  const totalCrewPages = Math.max(1, Math.ceil(crew.length / CREW_PAGE_SIZE));
  const safeCrewPage = Math.min(crewPage, totalCrewPages);
  const pagedCrew = crew.slice((safeCrewPage - 1) * CREW_PAGE_SIZE, safeCrewPage * CREW_PAGE_SIZE);
  const totalMedicalPages = Math.max(1, Math.ceil(medicalCharts.length / CREW_PAGE_SIZE));
  const safeMedicalPage = Math.min(medicalPage, totalMedicalPages);
  const pagedMedicalCharts = medicalCharts.slice((safeMedicalPage - 1) * CREW_PAGE_SIZE, safeMedicalPage * CREW_PAGE_SIZE);
  const totalTransporterPages = Math.max(1, Math.ceil(transporterLogs.length / CREW_PAGE_SIZE));
  const safeTransporterPage = Math.min(transporterPage, totalTransporterPages);
  const pagedTransporterLogs = transporterLogs.slice((safeTransporterPage - 1) * CREW_PAGE_SIZE, safeTransporterPage * CREW_PAGE_SIZE);
  const totalReplicatorPages = Math.max(1, Math.ceil(replicatorLogs.length / CREW_PAGE_SIZE));
  const safeReplicatorPage = Math.min(replicatorPage, totalReplicatorPages);
  const pagedReplicatorLogs = replicatorLogs.slice((safeReplicatorPage - 1) * CREW_PAGE_SIZE, safeReplicatorPage * CREW_PAGE_SIZE);
  const totalReplicatorPatternPages = Math.max(1, Math.ceil(replicatorPatterns.length / CREW_PAGE_SIZE));
  const safeReplicatorPatternPage = Math.min(replicatorPatternPage, totalReplicatorPatternPages);
  const pagedReplicatorPatterns = replicatorPatterns.slice(
    (safeReplicatorPatternPage - 1) * CREW_PAGE_SIZE,
    safeReplicatorPatternPage * CREW_PAGE_SIZE
  );
  const totalHolodeckPages = Math.max(1, Math.ceil(holodeckLogs.length / CREW_PAGE_SIZE));
  const safeHolodeckPage = Math.min(holodeckPage, totalHolodeckPages);
  const pagedHolodeckLogs = holodeckLogs.slice((safeHolodeckPage - 1) * CREW_PAGE_SIZE, safeHolodeckPage * CREW_PAGE_SIZE);
  const totalSystemsPages = Math.max(1, Math.ceil(systemsCompartments.length / CREW_PAGE_SIZE));
  const safeSystemsPage = Math.min(systemsPage, totalSystemsPages);
  const pagedCompartments = systemsCompartments.slice((safeSystemsPage - 1) * CREW_PAGE_SIZE, safeSystemsPage * CREW_PAGE_SIZE);
  const { title: workspaceTitle, mode: workspaceMode } = getWorkspaceMeta(activeWorkspace);

  if (authLoading) {
    return (
      <AuthScreen
        authForm={authForm}
        authLoading={authLoading}
        authMode={authMode}
        authSubmitting={authSubmitting}
        error={error}
        handleAuthChange={handleAuthChange}
        handleAuthSubmit={handleAuthSubmit}
        setAuthMode={setAuthMode}
        successMessage={successMessage}
      />
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        authForm={authForm}
        authLoading={authLoading}
        authMode={authMode}
        authSubmitting={authSubmitting}
        error={error}
        handleAuthChange={handleAuthChange}
        handleAuthSubmit={handleAuthSubmit}
        setAuthMode={setAuthMode}
        successMessage={successMessage}
      />
    );
  }

  return (
    <LcarsShell
      activeWorkspace={activeWorkspace}
      apiBaseUrl={API_BASE_URL}
      currentUser={currentUser}
      error={error}
      handleLogout={handleLogout}
      health={health}
      recentActionCount={recentActions.length}
      setActiveWorkspace={setActiveWorkspace}
      successMessage={successMessage}
      workspaceMode={workspaceMode}
      workspaceTitle={workspaceTitle}
    >
      <WorkspaceContent
        activeWorkspace={activeWorkspace}
        crew={crew}
        departments={departments}
        designation={designation}
        departmentFilter={departmentFilter}
        holodeckLogs={holodeckLogs}
        holodeckSearch={holodeckSearch}
        loadingCrew={loadingCrew}
        loadingHolodeck={loadingHolodeck}
        loadingMedicalCharts={loadingMedicalCharts}
        loadingReplicator={loadingReplicator}
        loadingSystems={loadingSystems}
        loadingTransporter={loadingTransporter}
        medicalCharts={medicalCharts}
        medicalSearch={medicalSearch}
        openHolodeckConsole={openHolodeckConsole}
        openReplicatorConsole={openReplicatorConsole}
        openTransporterConsole={openTransporterConsole}
        pagedCompartments={pagedCompartments}
        pagedCrew={pagedCrew}
        pagedHolodeckLogs={pagedHolodeckLogs}
        pagedMedicalCharts={pagedMedicalCharts}
        pagedReplicatorLogs={pagedReplicatorLogs}
        pagedTransporterLogs={pagedTransporterLogs}
        replicatorLogs={replicatorLogs}
        replicatorPatterns={replicatorPatterns}
        replicatorSearch={replicatorSearch}
        replicatorUnits={replicatorUnits}
        safeCrewPage={safeCrewPage}
        safeHolodeckPage={safeHolodeckPage}
        safeMedicalPage={safeMedicalPage}
        safeReplicatorPage={safeReplicatorPage}
        safeSystemsPage={safeSystemsPage}
        safeTransporterPage={safeTransporterPage}
        search={search}
        selectedCompartment={selectedCompartment}
        selectedCompartmentId={selectedCompartmentId}
        selectedCrew={selectedCrew}
        selectedCrewId={selectedCrewId}
        selectedHolodeckLogId={selectedHolodeckLogId}
        selectedMedicalChart={selectedMedicalChart}
        selectedMedicalCrewId={selectedMedicalCrewId}
        selectedReplicatorLogId={selectedReplicatorLogId}
        selectedTransporterEventId={selectedTransporterEventId}
        setCrewPage={setCrewPage}
        setDepartmentFilter={setDepartmentFilter}
        setDesignation={setDesignation}
        setHolodeckPage={setHolodeckPage}
        setHolodeckSearch={setHolodeckSearch}
        setMedicalPage={setMedicalPage}
        setMedicalSearch={setMedicalSearch}
        setReplicatorPage={setReplicatorPage}
        setReplicatorSearch={setReplicatorSearch}
        setSearch={setSearch}
        setSelectedCompartmentId={setSelectedCompartmentId}
        setSelectedCrewId={setSelectedCrewId}
        setSelectedMedicalCrewId={setSelectedMedicalCrewId}
        setShowCrewCreate={setShowCrewCreate}
        setSystemsPage={setSystemsPage}
        setSystemsSearch={setSystemsSearch}
        setTransporterPage={setTransporterPage}
        setTransporterSearch={setTransporterSearch}
        showHolodeckConsole={showHolodeckConsole}
        showTransporterConsole={showTransporterConsole}
        systemsCompartments={systemsCompartments}
        systemsSearch={systemsSearch}
        totalCrewPages={totalCrewPages}
        totalHolodeckPages={totalHolodeckPages}
        totalMedicalPages={totalMedicalPages}
        totalReplicatorPages={totalReplicatorPages}
        totalSystemsPages={totalSystemsPages}
        totalTransporterPages={totalTransporterPages}
        transporterLocations={transporterLocations}
        transporterLogs={transporterLogs}
        transporterSearch={transporterSearch}
        transporterUnits={transporterUnits}
      />
      <AppOverlays
        activeWorkspace={activeWorkspace}
        closeHolodeckConsole={closeHolodeckConsole}
        closeReplicatorConsole={closeReplicatorConsole}
        closeTransporterConsole={closeTransporterConsole}
        crewCreateForm={crewCreateForm}
        departments={departments}
        dossierRef={dossierRef}
        dossierTab={dossierTab}
        formState={formState}
        handleCrewCreateChange={handleCrewCreateChange}
        handleCrewCreateSubmit={handleCrewCreateSubmit}
        handleEpisodeChange={handleEpisodeChange}
        handleFormChange={handleFormChange}
        handleHolodeckEpisodeChange={handleHolodeckEpisodeChange}
        handleHolodeckLogChange={handleHolodeckLogChange}
        handleHolodeckLogSubmit={handleHolodeckLogSubmit}
        handleHolodeckProgramChange={handleHolodeckProgramChange}
        handleHolodeckProgramSubmit={handleHolodeckProgramSubmit}
        handleHolodeckSeasonChange={handleHolodeckSeasonChange}
        handleMedicalProfileChange={handleMedicalProfileChange}
        handleMedicalProfileSubmit={handleMedicalProfileSubmit}
        handleMedicalRecordChange={handleMedicalRecordChange}
        handleMedicalRecordEpisodeChange={handleMedicalRecordEpisodeChange}
        handleMedicalRecordSeasonChange={handleMedicalRecordSeasonChange}
        handleMedicalRecordSubmit={handleMedicalRecordSubmit}
        handleReplicatorEpisodeChange={handleReplicatorEpisodeChange}
        handleReplicatorLogChange={handleReplicatorLogChange}
        handleReplicatorLogSubmit={handleReplicatorLogSubmit}
        handleReplicatorPatternChange={handleReplicatorPatternChange}
        handleReplicatorPatternSubmit={handleReplicatorPatternSubmit}
        handleReplicatorSeasonChange={handleReplicatorSeasonChange}
        handleSeasonChange={handleSeasonChange}
        handleSubmit={handleSubmit}
        handleTransporterChange={handleTransporterChange}
        handleTransporterEpisodeChange={handleTransporterEpisodeChange}
        handleTransporterLogSubmit={handleTransporterLogSubmit}
        handleTransporterPassengerChange={handleTransporterPassengerChange}
        handleTransporterSeasonChange={handleTransporterSeasonChange}
        holodeckLogForm={holodeckLogForm}
        holodeckProgramForm={holodeckProgramForm}
        holodeckPrograms={holodeckPrograms}
        holodeckTab={holodeckTab}
        holodeckUnits={holodeckUnits}
        loadingDetail={loadingDetail}
        loadingMedicalDetail={loadingMedicalDetail}
        loadingSystemDetail={loadingSystemDetail}
        medicalProfileForm={medicalProfileForm}
        medicalRecordForm={medicalRecordForm}
        medicalTab={medicalTab}
        pagedReplicatorPatterns={pagedReplicatorPatterns}
        recentActions={recentActions}
        replicatorCrewOptions={replicatorCrewOptions}
        replicatorLogForm={replicatorLogForm}
        replicatorPatternForm={replicatorPatternForm}
        replicatorPatterns={replicatorPatterns}
        replicatorTab={replicatorTab}
        replicatorUnits={replicatorUnits}
        safeReplicatorPatternPage={safeReplicatorPatternPage}
        selectedCompartment={selectedCompartment}
        selectedCrew={selectedCrew}
        selectedDepartmentName={selectedDepartmentName}
        selectedHolodeckCrew={selectedHolodeckCrew}
        selectedHolodeckLog={selectedHolodeckLog}
        selectedHolodeckProgram={selectedHolodeckProgram}
        selectedHolodeckSeasonGuide={selectedHolodeckSeasonGuide}
        selectedHolodeckUnit={selectedHolodeckUnit}
        selectedMedicalChart={selectedMedicalChart}
        selectedMedicalSeasonGuide={selectedMedicalSeasonGuide}
        selectedReplicatorCrew={selectedReplicatorCrew}
        selectedReplicatorLog={selectedReplicatorLog}
        selectedReplicatorPattern={selectedReplicatorPattern}
        selectedReplicatorSeasonGuide={selectedReplicatorSeasonGuide}
        selectedReplicatorUnit={selectedReplicatorUnit}
        selectedSeasonGuide={selectedSeasonGuide}
        selectedTransporterEvent={selectedTransporterEvent}
        selectedTransporterLocation={selectedTransporterLocation}
        selectedTransporterOperator={selectedTransporterOperator}
        selectedTransporterPassengers={selectedTransporterPassengers}
        selectedTransporterSeasonGuide={selectedTransporterSeasonGuide}
        selectedTransporterUnit={selectedTransporterUnit}
        setDossierTab={setDossierTab}
        setHolodeckTab={setHolodeckTab}
        setMedicalTab={setMedicalTab}
        setReplicatorLogForm={setReplicatorLogForm}
        setReplicatorPatternPage={setReplicatorPatternPage}
        setReplicatorTab={setReplicatorTab}
        setSelectedCompartmentId={setSelectedCompartmentId}
        setSelectedCrewId={setSelectedCrewId}
        setSelectedMedicalCrewId={setSelectedMedicalCrewId}
        setShowCrewCreate={setShowCrewCreate}
        setTransporterLogForm={setTransporterLogForm}
        setTransporterTab={setTransporterTab}
        showCrewCreate={showCrewCreate}
        showHolodeckConsole={showHolodeckConsole}
        showReplicatorConsole={showReplicatorConsole}
        showTransporterConsole={showTransporterConsole}
        submitting={submitting}
        submittingCrewCreate={submittingCrewCreate}
        submittingHolodeck={submittingHolodeck}
        submittingHolodeckProgram={submittingHolodeckProgram}
        submittingMedical={submittingMedical}
        submittingReplicator={submittingReplicator}
        submittingReplicatorPattern={submittingReplicatorPattern}
        submittingTransporter={submittingTransporter}
        totalReplicatorPatternPages={totalReplicatorPatternPages}
        transporterLocations={transporterLocations}
        transporterLogForm={transporterLogForm}
        transporterTab={transporterTab}
        transporterUnits={transporterUnits}
      />
    </LcarsShell>
  );
}

export default App;
