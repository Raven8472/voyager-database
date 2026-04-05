import { useEffect, useRef, useState } from 'react';
import './App.css';
import AppOverlays from './components/AppOverlays';
import AuthScreen from './components/AuthScreen';
import LcarsShell from './components/LcarsShell';
import WorkspaceContent from './components/WorkspaceContent';
import {
  API_BASE_URL,
  AUTH_STORAGE_KEY,
  CREW_PAGE_SIZE,
  VOYAGER_EPISODE_GUIDE,
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
async function apiFetch(path, options = {}) {
  const token = window.localStorage.getItem(AUTH_STORAGE_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.error || 'Request failed');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

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
  const selectedSeasonGuide = VOYAGER_EPISODE_GUIDE.find((entry) => entry.season === formState.episode_season);
  const selectedMedicalSeasonGuide = VOYAGER_EPISODE_GUIDE.find((entry) => entry.season === medicalRecordForm.episode_season);
  const selectedTransporterSeasonGuide = VOYAGER_EPISODE_GUIDE.find((entry) => entry.season === transporterLogForm.episode_season);
  const selectedReplicatorSeasonGuide = VOYAGER_EPISODE_GUIDE.find((entry) => entry.season === replicatorLogForm.episode_season);
  const selectedHolodeckSeasonGuide = VOYAGER_EPISODE_GUIDE.find((entry) => entry.season === holodeckLogForm.episode_season);

  useEffect(() => {
    async function loadCurrentUser() {
      if (!authToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const authData = await apiFetch('/auth/me');
        setCurrentUser(authData.user);
      } catch (loadError) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthToken('');
        setCurrentUser(null);
        setError(loadError.message);
      } finally {
        setAuthLoading(false);
      }
    }

    loadCurrentUser();
  }, [authToken]);

  useEffect(() => {
    async function loadMeta() {
      if (!currentUser) {
        return;
      }

      try {
        const [healthData, departmentData, actionData] = await Promise.all([
          apiFetch('/health'),
          apiFetch('/departments'),
          apiFetch('/personnel-actions/recent'),
        ]);
        setHealth(healthData);
        setDepartments(departmentData);
        setRecentActions(actionData);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadMeta();
  }, [currentUser]);

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
  }, [currentUser, search, designation, departmentFilter, selectedCrewId]);

  useEffect(() => {
    setCrewPage(1);
  }, [search, designation, departmentFilter]);

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
  }, [selectedCrewId]);

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
  }, [currentUser, medicalSearch, selectedMedicalCrewId]);

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
  }, [currentUser, transporterSearch, selectedTransporterEventId]);

  useEffect(() => {
    async function loadHolodeckWorkspace() {
      if (!currentUser) {
        setLoadingHolodeck(false);
        return;
      }

      setLoadingHolodeck(true);
      setError('');

      const params = new URLSearchParams();
      if (holodeckSearch.trim()) {
        params.set('search', holodeckSearch.trim());
      }

      try {
        const [logData, programData, unitData, crewData] = await Promise.all([
          apiFetch(`/holodeck/logs${params.toString() ? `?${params.toString()}` : ''}`),
          apiFetch(`/holodeck/programs${params.toString() ? `?${params.toString()}` : ''}`),
          apiFetch('/holodeck/units'),
          apiFetch('/crew'),
        ]);
        setHolodeckLogs(logData);
        setHolodeckPrograms(programData);
        setHolodeckUnits(unitData);
        setReplicatorCrewOptions(crewData);
        if (selectedHolodeckLogId && !logData.some((log) => log.log_id === selectedHolodeckLogId)) {
          setSelectedHolodeckLogId(null);
          setSelectedHolodeckLog(null);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingHolodeck(false);
      }
    }

    loadHolodeckWorkspace();
  }, [currentUser, holodeckSearch, selectedHolodeckLogId]);

  useEffect(() => {
    setHolodeckPage(1);
  }, [holodeckSearch]);

  useEffect(() => {
    if (!selectedHolodeckLogId) {
      setSelectedHolodeckLog(null);
      return;
    }

    const matchingLog = holodeckLogs.find((log) => log.log_id === selectedHolodeckLogId) || null;
    setSelectedHolodeckLog(matchingLog);
  }, [holodeckLogs, selectedHolodeckLogId]);

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
  }, [currentUser, systemsSearch, selectedCompartmentId]);

  useEffect(() => {
    setSystemsPage(1);
  }, [systemsSearch]);

  useEffect(() => {
    async function loadReplicatorWorkspace() {
      if (!currentUser) {
        setLoadingReplicator(false);
        return;
      }

      setLoadingReplicator(true);
      setError('');

      const params = new URLSearchParams();
      if (replicatorSearch.trim()) {
        params.set('search', replicatorSearch.trim());
      }

      try {
        const [logData, patternData, unitData] = await Promise.all([
          apiFetch(`/replicator/logs${params.toString() ? `?${params.toString()}` : ''}`),
          apiFetch(`/replicator/patterns${params.toString() ? `?${params.toString()}` : ''}`),
          apiFetch(`/replicator/units${params.toString() ? `?${params.toString()}` : ''}`),
        ]);
        setReplicatorLogs(logData);
        setReplicatorPatterns(patternData);
        setReplicatorUnits(unitData);
        if (selectedReplicatorLogId && !logData.some((log) => log.log_id === selectedReplicatorLogId)) {
          setSelectedReplicatorLogId(null);
          setSelectedReplicatorLog(null);
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoadingReplicator(false);
      }
    }

    loadReplicatorWorkspace();
  }, [currentUser, replicatorSearch, selectedReplicatorLogId]);

  useEffect(() => {
    async function loadReplicatorCrewOptions() {
      if (!currentUser) {
        return;
      }

      try {
        const crewData = await apiFetch('/crew');
        setReplicatorCrewOptions(crewData);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadReplicatorCrewOptions();
  }, [currentUser]);

  useEffect(() => {
    setReplicatorPage(1);
  }, [replicatorSearch]);

  useEffect(() => {
    setReplicatorPatternPage(1);
  }, [replicatorSearch]);

  useEffect(() => {
    if (!selectedReplicatorLogId) {
      setSelectedReplicatorLog(null);
      return;
    }

    const matchingLog = replicatorLogs.find((log) => log.log_id === selectedReplicatorLogId) || null;
    setSelectedReplicatorLog(matchingLog);
  }, [replicatorLogs, selectedReplicatorLogId]);

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
  }, [currentUser, selectedCompartmentId]);

  useEffect(() => {
    setMedicalPage(1);
  }, [medicalSearch]);

  useEffect(() => {
    setTransporterPage(1);
  }, [transporterSearch]);

  useEffect(() => {
    if (!selectedTransporterEventId) {
      setSelectedTransporterEvent(null);
      return;
    }

    const matchingEvent = transporterLogs.find((event) => event.event_id === selectedTransporterEventId) || null;
    setSelectedTransporterEvent(matchingEvent);
  }, [transporterLogs, selectedTransporterEventId]);

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
  }, [currentUser, selectedMedicalCrewId]);

  useEffect(() => {
    if (selectedCrew && dossierRef.current) {
      dossierRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCrew]);

  async function refreshAfterAction(crewId) {
    const [detail, actionData, healthData] = await Promise.all([
      apiFetch(`/crew/${crewId}`),
      apiFetch('/personnel-actions/recent'),
      apiFetch('/health'),
    ]);

    setSelectedCrew(detail);
    setRecentActions(actionData);
    setHealth(healthData);

    const crewData = await apiFetch('/crew');
    setCrew(crewData);
    return detail;
  }

  async function refreshMedicalChart(crewId) {
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
  }

  async function refreshReplicatorWorkspace() {
    const params = new URLSearchParams();
    if (replicatorSearch.trim()) {
      params.set('search', replicatorSearch.trim());
    }

    const [logData, patternData, unitData, crewData] = await Promise.all([
      apiFetch(`/replicator/logs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/replicator/patterns${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/replicator/units${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch('/crew'),
    ]);

    setReplicatorLogs(logData);
    setReplicatorPatterns(patternData);
    setReplicatorUnits(unitData);
    setReplicatorCrewOptions(crewData);
    return logData;
  }

  async function refreshTransporterWorkspace() {
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
    return logData;
  }

  async function refreshHolodeckWorkspace() {
    const params = new URLSearchParams();
    if (holodeckSearch.trim()) {
      params.set('search', holodeckSearch.trim());
    }

    const [logData, programData, unitData, crewData] = await Promise.all([
      apiFetch(`/holodeck/logs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch(`/holodeck/programs${params.toString() ? `?${params.toString()}` : ''}`),
      apiFetch('/holodeck/units'),
      apiFetch('/crew'),
    ]);

    setHolodeckLogs(logData);
    setHolodeckPrograms(programData);
    setHolodeckUnits(unitData);
    setReplicatorCrewOptions(crewData);
    return { logData, programData, unitData };
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSeasonChange(event) {
    const season = event.target.value;
    setFormState((current) => ({
      ...current,
      episode_season: season,
      episode_title: '',
      effective_stardate: '',
      episode_reference: '',
    }));
  }

  function handleEpisodeChange(event) {
    const episodeTitle = event.target.value;
    const selectedEpisode = selectedSeasonGuide?.episodes.find(([title]) => title === episodeTitle);
    setFormState((current) => ({
      ...current,
      episode_title: episodeTitle,
      effective_stardate: selectedEpisode?.[1] || current.effective_stardate,
      episode_reference: selectedEpisode ? `${current.episode_season} - ${episodeTitle}` : current.episode_reference,
    }));
  }

  function handleMedicalProfileChange(event) {
    const { name, value } = event.target;
    setMedicalProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleMedicalRecordChange(event) {
    const { name, value, type, checked } = event.target;
    setMedicalRecordForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleMedicalRecordSeasonChange(event) {
    const season = event.target.value;
    setMedicalRecordForm((current) => ({
      ...current,
      episode_season: season,
      episode_title: '',
      visit_stardate: '',
    }));
  }

  function handleMedicalRecordEpisodeChange(event) {
    const episodeTitle = event.target.value;
    const selectedEpisode = selectedMedicalSeasonGuide?.episodes.find(([title]) => title === episodeTitle);
    setMedicalRecordForm((current) => ({
      ...current,
      episode_title: episodeTitle,
      visit_stardate: selectedEpisode?.[1] || current.visit_stardate,
    }));
  }

  function handleCrewCreateChange(event) {
    const { name, value } = event.target;
    setCrewCreateForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleAuthChange(event) {
    const { name, value } = event.target;
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleReplicatorLogChange(event) {
    const { name, value } = event.target;
    setReplicatorLogForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleReplicatorSeasonChange(event) {
    const season = event.target.value;
    setReplicatorLogForm((current) => ({
      ...current,
      episode_season: season,
      episode_title: '',
      timestamp: '',
    }));
  }

  function handleReplicatorEpisodeChange(event) {
    const episodeTitle = event.target.value;
    const selectedEpisode = selectedReplicatorSeasonGuide?.episodes.find(([title]) => title === episodeTitle);
    setReplicatorLogForm((current) => ({
      ...current,
      episode_title: episodeTitle,
      timestamp: selectedEpisode?.[1] || current.timestamp,
    }));
  }

  function handleHolodeckLogChange(event) {
    const { name, value } = event.target;
    setHolodeckLogForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleHolodeckSeasonChange(event) {
    const season = event.target.value;
    setHolodeckLogForm((current) => ({
      ...current,
      episode_season: season,
      episode_title: '',
      stardate: '',
    }));
  }

  function handleHolodeckEpisodeChange(event) {
    const episodeTitle = event.target.value;
    const selectedEpisode = selectedHolodeckSeasonGuide?.episodes.find(([title]) => title === episodeTitle);
    setHolodeckLogForm((current) => ({
      ...current,
      episode_title: episodeTitle,
      stardate: selectedEpisode?.[1] || current.stardate,
    }));
  }

  function handleTransporterChange(event) {
    const { name, value } = event.target;
    setTransporterLogForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleTransporterSeasonChange(event) {
    const season = event.target.value;
    setTransporterLogForm((current) => ({
      ...current,
      episode_season: season,
      episode_title: '',
      stardate: '',
    }));
  }

  function handleTransporterEpisodeChange(event) {
    const episodeTitle = event.target.value;
    const selectedEpisode = selectedTransporterSeasonGuide?.episodes.find(([title]) => title === episodeTitle);
    setTransporterLogForm((current) => ({
      ...current,
      episode_title: episodeTitle,
      stardate: selectedEpisode?.[1] || current.stardate,
    }));
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
    const { name, value } = event.target;
    setReplicatorPatternForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleHolodeckProgramChange(event) {
    const { name, value } = event.target;
    setHolodeckProgramForm((current) => ({
      ...current,
      [name]: value,
    }));
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
    if (!transporterUnits.length || !transporterLocations.length) {
      try {
        await refreshTransporterWorkspace();
      } catch (loadError) {
        setError(loadError.message);
      }
    }
    if (tab === 'newlog') {
      setTransporterLogForm((current) => ({
        ...initialTransporterLogForm,
        transporter_unit_id: current.transporter_unit_id || transporterUnits[0]?.unit_id || '',
        ship_location_id: current.ship_location_id || transporterLocations[0]?.compartment_id || '',
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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedCrew) {
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await apiFetch('/personnel-actions', {
        method: 'POST',
        body: JSON.stringify({
          crew_id: selectedCrew.crew_id,
          action_type: formState.action_type,
          old_rank: selectedCrew.rank,
          new_rank: formState.new_rank || selectedCrew.rank,
          old_species: selectedCrew.species,
          new_species: formState.new_species || selectedCrew.species,
          old_planet_of_origin: selectedCrew.planet_of_origin,
          new_planet_of_origin: formState.new_planet_of_origin || selectedCrew.planet_of_origin,
          old_department_id: selectedCrew.department_id,
          new_department_id: Number(formState.new_department_id || selectedCrew.department_id),
          effective_stardate: formState.effective_stardate,
          episode_reference: formState.episode_reference,
          entered_by: formState.entered_by,
          action_notes: formState.action_notes,
        }),
      });

      const refreshedDetail = await refreshAfterAction(selectedCrew.crew_id);
      setFormState((current) => ({
        ...initialFormState,
        entered_by: current.entered_by || initialFormState.entered_by,
        new_rank: refreshedDetail.rank || '',
        new_species: refreshedDetail.species || '',
        new_planet_of_origin: refreshedDetail.planet_of_origin || '',
        new_department_id: String(refreshedDetail.department_id || ''),
      }));
      setSuccessMessage('Personnel action logged to the current dossier.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
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

  async function handleCrewCreateSubmit(event) {
    event.preventDefault();
    setSubmittingCrewCreate(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiFetch('/crew', {
        method: 'POST',
        body: JSON.stringify({
          first_name: crewCreateForm.first_name,
          last_name: crewCreateForm.last_name,
          crew_rank: crewCreateForm.crew_rank || null,
          birth_stardate: crewCreateForm.birth_stardate ? Number(crewCreateForm.birth_stardate) : null,
          planet_of_origin: crewCreateForm.planet_of_origin || null,
          species: crewCreateForm.species || null,
          crew_designation: crewCreateForm.crew_designation,
          service_number: crewCreateForm.service_number || null,
          department_id: crewCreateForm.department_id ? Number(crewCreateForm.department_id) : null,
        }),
      });

      const refreshedCrew = await apiFetch('/crew');
      setCrew(refreshedCrew);
      setReplicatorCrewOptions(refreshedCrew);
      setSelectedCrewId(result.crew_id);
      setCrewCreateForm(initialCrewCreateForm);
      setShowCrewCreate(false);
      setSuccessMessage('New crew record created.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingCrewCreate(false);
    }
  }

  async function handleReplicatorLogSubmit(event) {
    event.preventDefault();

    setSubmittingReplicator(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiFetch('/replicator/logs', {
        method: 'POST',
        body: JSON.stringify({
          crew_id: Number(replicatorLogForm.crew_id),
          replicator_unit_id: replicatorLogForm.replicator_unit_id,
          pattern_id: Number(replicatorLogForm.pattern_id),
          timestamp: replicatorLogForm.timestamp,
        }),
      });

      await refreshReplicatorWorkspace();
      setSelectedReplicatorLogId(result.log_id);
      setReplicatorTab('detail');
      setReplicatorLogForm(initialReplicatorLogForm);
      setShowReplicatorConsole(true);
      setSuccessMessage('Replicator usage event logged.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingReplicator(false);
    }
  }

  async function handleReplicatorPatternSubmit(event) {
    event.preventDefault();

    setSubmittingReplicatorPattern(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiFetch('/replicator/patterns', {
        method: 'POST',
        body: JSON.stringify({
          pattern_name: replicatorPatternForm.pattern_name,
          category: replicatorPatternForm.category || null,
          origin_species: replicatorPatternForm.origin_species || null,
          energy_cost: replicatorPatternForm.energy_cost ? Number(replicatorPatternForm.energy_cost) : null,
          description: replicatorPatternForm.description || null,
          last_updated_stardate: replicatorPatternForm.last_updated_stardate || null,
        }),
      });

      await refreshReplicatorWorkspace();
      setReplicatorPatternForm(initialReplicatorPatternForm);
      setReplicatorLogForm((current) => ({
        ...current,
        pattern_id: String(result.pattern_id),
      }));
      setReplicatorTab('newlog');
      setSuccessMessage('Replicator pattern added to the library.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingReplicatorPattern(false);
    }
  }

  async function handleTransporterLogSubmit(event) {
    event.preventDefault();
    setSubmittingTransporter(true);
    setError('');
    setSuccessMessage('');

    try {
      const selectedPassengerIds = transporterLogForm.passenger_crew_ids
        .filter((crewId) => crewId)
        .map((crewId) => Number(crewId));

      if (!selectedPassengerIds.length) {
        throw new Error('Select at least one passenger before logging a transport event.');
      }

      const payload = {
        transporter_unit_id: transporterLogForm.transporter_unit_id,
        operator_crew_id: transporterLogForm.operator_crew_id ? Number(transporterLogForm.operator_crew_id) : null,
        stardate: transporterLogForm.stardate,
        transport_direction: transporterLogForm.transport_direction,
        ship_location_id: transporterLogForm.ship_location_id,
        off_ship_location: transporterLogForm.off_ship_location || null,
        passenger_crew_ids: selectedPassengerIds,
      };

      const result = await apiFetch('/transporter/logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await refreshTransporterWorkspace();
      setSelectedTransporterEventId(result.event_id);
      setTransporterTab('detail');
      setTransporterLogForm(initialTransporterLogForm);
      setShowTransporterConsole(true);
      setSuccessMessage('Transporter event logged.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingTransporter(false);
    }
  }

  async function handleHolodeckLogSubmit(event) {
    event.preventDefault();
    setSubmittingHolodeck(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiFetch('/holodeck/logs', {
        method: 'POST',
        body: JSON.stringify({
          crew_id: Number(holodeckLogForm.crew_id),
          holodeck_id: holodeckLogForm.holodeck_id,
          program_id: holodeckLogForm.program_id,
          stardate: holodeckLogForm.stardate,
        }),
      });

      await refreshHolodeckWorkspace();
      setSelectedHolodeckLogId(`user-${result.log_id}`);
      setHolodeckTab('detail');
      setHolodeckLogForm(initialHolodeckLogForm);
      setShowHolodeckConsole(true);
      setSuccessMessage('Holodeck session logged.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingHolodeck(false);
    }
  }

  async function handleHolodeckProgramSubmit(event) {
    event.preventDefault();
    setSubmittingHolodeckProgram(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiFetch('/holodeck/programs', {
        method: 'POST',
        body: JSON.stringify({
          program_name: holodeckProgramForm.program_name,
          holodeck_id: holodeckProgramForm.holodeck_id,
          created_by: holodeckProgramForm.created_by || null,
          access_level: holodeckProgramForm.access_level || null,
          genre: holodeckProgramForm.genre || null,
          description: holodeckProgramForm.description || null,
        }),
      });

      await refreshHolodeckWorkspace();
      setHolodeckProgramForm(initialHolodeckProgramForm);
      setHolodeckLogForm((current) => ({
        ...current,
        program_id: result.program_id,
      }));
      setHolodeckTab('newlog');
      setSuccessMessage('Holodeck program added to the library.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmittingHolodeckProgram(false);
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
  const workspaceTitle = activeWorkspace === 'personnel'
    ? 'Personnel Records and Change Log'
    : activeWorkspace === 'medical'
      ? 'Medical Charts and Treatment Logs'
      : activeWorkspace === 'transporter'
        ? 'Transporter Records and Pad Operations'
      : activeWorkspace === 'replicator'
        ? 'Replicator Usage Logs and Pattern Library'
        : activeWorkspace === 'holodeck'
          ? 'Holodeck Usage Records and Program Activity'
        : 'Ship Systems and Installed Units';
  const workspaceMode = activeWorkspace === 'personnel'
    ? 'Episode Logging'
    : activeWorkspace === 'medical'
      ? 'Sickbay Charting'
      : activeWorkspace === 'transporter'
        ? 'Pad Operations'
      : activeWorkspace === 'replicator'
        ? 'Consumption Tracking'
        : activeWorkspace === 'holodeck'
          ? 'Program Tracking'
        : 'Infrastructure Browsing';

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
