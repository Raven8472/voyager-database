import { useEffect, useRef, useState } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
const AUTH_STORAGE_KEY = 'voyager-auth-token';
const CREW_PAGE_SIZE = 12;
const VOYAGER_EPISODE_GUIDE = [
  {
    season: 'Season 1',
    episodes: [
      ['Caretaker', '48315.6'],
      ['Parallax', '48439.7'],
      ['Time and Again', '48498.5'],
      ['Phage', '48532.4'],
      ['The Cloud', '48546.2'],
      ['Eye of the Needle', '48579.4'],
      ['Ex Post Facto', '48600.0'],
      ['Emanations', '48623.5'],
      ['Prime Factors', '48642.5'],
      ['State of Flux', '48658.2'],
      ['Heroes and Demons', '48693.2'],
      ['Cathexis', '48734.2'],
      ['Faces', '48784.2'],
      ['Jetrel', '48836.3'],
      ['Learning Curve', '48846.5'],
    ],
  },
  {
    season: 'Season 2',
    episodes: [
      ["The 37's", '48975.1'],
      ['Initiations', '49005.3'],
      ['Projections', '48892.1'],
      ['Elogium', '48921.3'],
      ['Non Sequitur', '49011.4'],
      ['Twisted', '49032.5'],
      ['Parturition', '49068.5'],
      ['Persistence of Vision', '49164.8'],
      ['Tattoo', '49211.5'],
      ['Cold Fire', '49270.9'],
      ['Maneuvers', '49301.2'],
      ['Resistance', '49373.4'],
      ['Prototype', '49447.0'],
      ['Alliances', '49485.2'],
      ['Threshold', '49555.2'],
      ['Meld', '49610.3'],
      ['Dreadnought', '49447.0'],
      ['Death Wish', '49301.2'],
      ['Lifesigns', '49504.3'],
      ['Investigations', '49548.7'],
      ['Deadlock', '49548.7'],
      ['Innocence', '49578.2'],
      ['The Thaw', '49655.2'],
      ['Tuvix', '49655.2'],
      ['Resolutions', '49692.2'],
      ['Basics, Part I', '49690.1'],
    ],
  },
  {
    season: 'Season 3',
    episodes: [
      ['Basics, Part II', '50023.4'],
      ['Flashback', '50126.4'],
      ['The Chute', '50156.2'],
      ['The Swarm', '50252.3'],
      ['False Profits', '50074.3'],
      ['Remember', '50203.1'],
      ['Sacred Ground', '50245.2'],
      ["Future's End", '50312.5'],
      ["Future's End Part II", '50379.1'],
      ['Warlord', '50384.2'],
      ['The Q and the Grey', '50384.2'],
      ['Macrocosm', '50425.1'],
      ['Fair Trade', '50455.2'],
      ['Alter Ego', '50460.3'],
      ['Coda', '50518.6'],
      ['Blood Fever', '50485.2'],
      ['Unity', '50537.2'],
      ['Darkling', '50564.2'],
      ['Rise', '50571.2'],
      ['Favorite Son', '50732.4'],
      ['Before and After', '50973.0'],
      ['Real Life', '50836.2'],
      ['Distant Origin', '50867.4'],
      ['Displaced', '50929.3'],
      ['Worst Case Scenario', '50953.4'],
      ['Scorpion, Part I', '50984.3'],
    ],
  },
  {
    season: 'Season 4',
    episodes: [
      ['Scorpion, Part II', '51003.7'],
      ['The Gift', '51008.0'],
      ['Day of Honor', '51082.4'],
      ['Nemesis', '51082.4'],
      ['Revulsion', '51186.2'],
      ['The Raven', '51190.5'],
      ['Scientific Method', '51244.3'],
      ['Year of Hell, Part I', '51268.4'],
      ['Year of Hell, Part II', '51425.4'],
      ['Random Thoughts', '51367.2'],
      ['Concerning Flight', '51408.6'],
      ['Mortal Coil', '51449.2'],
      ['Waking Moments', '51471.2'],
      ['Message in a Bottle', '51462.4'],
      ['Hunters', '51501.4'],
      ['Prey', '51515.3'],
      ['Retrospect', '51532.4'],
      ['The Killing Game I', '51652.3'],
      ['The Killing Game II', '51715.2'],
      ['Vis a Vis', '51762.4'],
      ['The Omega Directive', '51781.2'],
      ['Unforgettable', '51813.4'],
      ['Living Witness', '51839.4'],
      ['Demon', '51854.2'],
      ['One', '51929.3'],
      ['Hope and Fear', '51978.2'],
    ],
  },
  {
    season: 'Season 5',
    episodes: [
      ['Night', '52081.2'],
      ['Drone', '52143.6'],
      ['Extreme Risk', '52179.4'],
      ['In the Flesh', '52179.4'],
      ['Once Upon a Time', '52232.1'],
      ['Timeless', '52143.6'],
      ['Infinite Regress', '52188.7'],
      ['Nothing Human', '52232.1'],
      ['Thirty Days', '52255.4'],
      ['Counterpoint', '52289.1'],
      ['Latent Image', '52356.2'],
      ['Bride of Chaotica!', '52382.4'],
      ['Gravity', '52438.9'],
      ['Bliss', '52442.5'],
      ['Dark Frontier', '52619.2'],
      ['The Disease', '52647.1'],
      ['Course: Oblivion', '52586.3'],
      ['The Fight', '52673.4'],
      ['Think Tank', '52647.1'],
      ['Juggernaut', '52704.2'],
      ['Someone to Watch Over Me', '52679.2'],
      ['11:59', '52756.2'],
      ['Relativity', '52861.2'],
      ['Warhead', '52861.2'],
      ['Equinox, Part I', '52861.3'],
    ],
  },
  {
    season: 'Season 6',
    episodes: [
      ['Equinox, Part II', '52861.3'],
      ['Survival Instinct', '53049.2'],
      ['Barge of the Dead', '53167.9'],
      ['Tinker Tenor Doctor Spy', '53167.9'],
      ['Alice', '53179.4'],
      ['Riddles', '53263.2'],
      ["Dragon's Teeth", '53167.9'],
      ['One Small Step', '53292.7'],
      ['The Voyager Conspiracy', '53329.7'],
      ['Pathfinder', '53329.7'],
      ['Fair Haven', '53381.2'],
      ['Blink of an Eye', '53332.3'],
      ['Virtuoso', '53468.2'],
      ['Memorial', '53447.2'],
      ['Tsunkatse', '53447.2'],
      ['Collective', '53573.2'],
      ['Spirit Folk', '53573.2'],
      ['Ashes to Ashes', '53579.4'],
      ["Child's Play", '53579.4'],
      ['Good Shepherd', '53579.4'],
      ['Live Fast and Prosper', '53679.4'],
      ['Muse', '53679.4'],
      ['Fury', '53679.4'],
      ['Life Line', '53753.2'],
      ['The Haunting of Deck Twelve', '53753.2'],
      ['Unimatrix Zero I', '54014.4'],
    ],
  },
  {
    season: 'Season 7',
    episodes: [
      ['Unimatrix Zero II', '54014.4'],
      ['Imperfection', '54129.4'],
      ['Drive', '54129.4'],
      ['Repression', '54208.3'],
      ['Critical Care', '54193.4'],
      ['Inside Man', '54238.3'],
      ['Body and Soul', '54238.3'],
      ['Nightingale', '54274.3'],
      ['Flesh and Blood I', '54274.3'],
      ['Flesh and Blood II', '54274.3'],
      ['Shattered', '54452.6'],
      ['Lineage', '54452.6'],
      ['Repentance', '54474.6'],
      ['Prophecy', '54474.6'],
      ['The Void', '54553.4'],
      ['Workforce I', '54584.3'],
      ['Workforce II', '54584.3'],
      ['Human Error', '54622.4'],
      ['Q2', '54704.2'],
      ['Author, Author', '54732.3'],
      ['Friendship One', '54775.4'],
      ['Natural Law', '54827.7'],
      ['Homestead', '54868.6'],
      ['Renaissance Man', '54890.2'],
      ['Endgame', '54973.4'],
    ],
  },
];

const initialFormState = {
  action_type: 'Promotion',
  new_rank: '',
  new_species: '',
  new_planet_of_origin: '',
  new_department_id: '',
  episode_season: '',
  episode_title: '',
  effective_stardate: '',
  episode_reference: '',
  entered_by: 'Records Officer',
  action_notes: '',
};

const initialMedicalProfileForm = {
  blood_type: '',
  allergies: '',
  chronic_conditions: '',
  emergency_contact: '',
};

const initialMedicalRecordForm = {
  episode_season: '',
  episode_title: '',
  visit_stardate: '',
  reason_for_visit: '',
  treatment_provided: '',
  follow_up_required: false,
};

const initialReplicatorLogForm = {
  episode_season: '',
  episode_title: '',
  crew_id: '',
  replicator_unit_id: '',
  pattern_id: '',
  timestamp: '',
};

const initialReplicatorPatternForm = {
  pattern_name: '',
  category: '',
  origin_species: '',
  energy_cost: '',
  description: '',
  last_updated_stardate: '',
};

const initialTransporterLogForm = {
  episode_season: '',
  episode_title: '',
  transporter_unit_id: '',
  operator_crew_id: '',
  stardate: '',
  transport_direction: 'Outbound',
  ship_location_id: '',
  off_ship_location: '',
  passenger_crew_ids: Array.from({ length: 10 }, () => ''),
};

const initialCrewCreateForm = {
  first_name: '',
  last_name: '',
  crew_rank: '',
  birth_stardate: '',
  planet_of_origin: '',
  species: '',
  crew_designation: 'StarFleet',
  service_number: '',
  department_id: '',
};

const initialAuthForm = {
  email: '',
  password: '',
  confirmPassword: '',
};

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

function formatRecordName(record) {
  if (!record) {
    return 'No file selected';
  }

  const firstName = record.first_name?.trim();
  const lastName = record.last_name?.trim();

  if (!firstName || firstName === 'N/A') {
    return lastName || 'Unnamed Record';
  }

  if (!lastName) {
    return firstName;
  }

  return `${lastName}, ${firstName}`;
}

function formatTransporterControlLocationName(name) {
  if (!name) {
    return '';
  }

  if (name === 'Engineering Core') {
    return 'Engineering';
  }

  return name;
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
        : 'Ship Systems and Installed Units';
  const workspaceMode = activeWorkspace === 'personnel'
    ? 'Episode Logging'
    : activeWorkspace === 'medical'
      ? 'Sickbay Charting'
      : activeWorkspace === 'transporter'
        ? 'Pad Operations'
      : activeWorkspace === 'replicator'
        ? 'Consumption Tracking'
        : 'Infrastructure Browsing';

  if (authLoading) {
    return (
      <div className="auth-shell">
        <div className="auth-terminal">
          <span className="eyebrow">LCARS ACCESS NODE</span>
          <h1>Voyager Vital Databases</h1>
          <p>Establishing secure link to protected ship records.</p>
          <div className="auth-status-pill">Authorizing Terminal...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="auth-shell">
        <div className="auth-terminal">
          <div className="auth-terminal-header">
            <div>
              <span className="eyebrow">LCARS ACCESS NODE</span>
              <h1>Voyager Vital Databases</h1>
            </div>
            <div className="auth-status-pill">{authMode === 'login' ? 'Secure Sign-In' : 'New Access Request'}</div>
          </div>

          <p className="auth-copy">
            Authorization is required before records, medical charts, and ship systems can be accessed. Enter your access ID and authorization code to continue.
          </p>

          {error ? <div className="banner error">{error}</div> : null}
          {successMessage ? <div className="banner success">{successMessage}</div> : null}

          <div className="detail-tabs auth-tabs">
            <button type="button" className={`detail-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Access Existing Account</button>
            <button type="button" className={`detail-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Create Access Node</button>
          </div>

          <form className="action-form auth-form" onSubmit={handleAuthSubmit}>
            <label className="control">
              <span>Access ID</span>
              <input type="email" name="email" value={authForm.email} onChange={handleAuthChange} placeholder="captain@voyagerdb.com" required />
            </label>

            <label className="control">
              <span>Authorization Code</span>
              <input type="password" name="password" value={authForm.password} onChange={handleAuthChange} placeholder="Enter secure code" required />
            </label>

            {authMode === 'register' ? (
              <label className="control">
                <span>Confirm Authorization Code</span>
                <input type="password" name="confirmPassword" value={authForm.confirmPassword} onChange={handleAuthChange} placeholder="Repeat secure code" required />
              </label>
            ) : null}

            <button className="submit-button auth-submit" type="submit" disabled={authSubmitting}>
              {authSubmitting
                ? 'Validating Credentials...'
                : authMode === 'login'
                  ? 'Access Voyager Records'
                  : 'Create Access Node'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="lcars-rail">
        <div className="rail-block rail-brand">
          <span className="eyebrow">USS VOYAGER</span>
          <h1>Records Console</h1>
          <p>File and records officer workstation for live personnel updates.</p>
        </div>

        <div className="rail-stack">
          <button className={`rail-button ${activeWorkspace === 'personnel' ? 'active' : ''}`} type="button" onClick={() => setActiveWorkspace('personnel')}>Personnel</button>
          <button className={`rail-button ${activeWorkspace === 'medical' ? 'active' : ''}`} type="button" onClick={() => setActiveWorkspace('medical')}>Medical</button>
          <button className={`rail-button ${activeWorkspace === 'transporter' ? 'active' : ''}`} type="button" onClick={() => setActiveWorkspace('transporter')}>Transporter</button>
          <button className={`rail-button ${activeWorkspace === 'replicator' ? 'active' : ''}`} type="button" onClick={() => setActiveWorkspace('replicator')}>Replicator</button>
          <button className={`rail-button ${activeWorkspace === 'systems' ? 'active' : ''}`} type="button" onClick={() => setActiveWorkspace('systems')}>Ship Systems</button>
        </div>

        <div className="rail-block rail-status">
          <span className="eyebrow">System Status</span>
          <p>User: {currentUser.email}</p>
          <p>API: {health ? health.status.toUpperCase() : 'CHECKING'}</p>
          <p>Action Log: {health?.personnel_actions_ready ? 'READY' : 'SCHEMA NEEDED'}</p>
          <p>Auth: {health?.auth_ready ? 'READY' : 'SCHEMA NEEDED'}</p>
          <p>Recent Actions: {recentActions.length}</p>
          <button className="page-button rail-logout" type="button" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>

      <main className="lcars-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">LCARS WORKSTATION</span>
            <h2>{workspaceTitle}</h2>
          </div>
          <div className="topbar-meta">
            <span>Active Role: Records Officer</span>
            <span>Mode: {workspaceMode}</span>
            <span>API: {API_BASE_URL}</span>
          </div>
        </header>

        {error ? <div className="banner error">{error}</div> : null}
        {successMessage ? <div className="banner success">{successMessage}</div> : null}

        {activeWorkspace === 'personnel' ? (
          <>
            <section className="control-row">
              <label className="control">
                <span>Search Crew</span>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Janeway, Torres, Paris..."
                />
              </label>

              <label className="control">
                <span>Designation</span>
                <select value={designation} onChange={(event) => setDesignation(event.target.value)}>
                  <option value="">All</option>
                  <option value="StarFleet">StarFleet</option>
                  <option value="Maquis">Maquis</option>
                  <option value="Civilian">Civilian</option>
                </select>
              </label>

              <label className="control">
                <span>Department</span>
                <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                  <option value="">All</option>
                  {departments.map((department) => (
                    <option key={department.department_id} value={department.department_id}>
                      {department.department_name}
                    </option>
                  ))}
                </select>
              </label>
              <button className="page-button add-crew-button" type="button" onClick={() => setShowCrewCreate(true)}>
                Add Crew Member
              </button>
            </section>

            <section className="workspace-grid">
              <div className="panel panel-list panel-list-only">
                <div className="panel-header">
                  <span className="eyebrow">Crew Directory</span>
                  <strong>
                    {loadingCrew ? 'Loading...' : `Page ${safeCrewPage} of ${totalCrewPages} | ${crew.length} records`}
                  </strong>
                </div>

                <div className="crew-list">
                  {pagedCrew.map((person) => (
                    <button
                      key={person.crew_id}
                      type="button"
                      className={`crew-card ${selectedCrewId === person.crew_id ? 'selected' : ''}`}
                      onClick={() => setSelectedCrewId(person.crew_id)}
                    >
                      <span className="crew-name">{formatRecordName(person)}</span>
                      <span>{person.rank || 'Unassigned Rank'}</span>
                      <span>{person.department || 'No Department'}</span>
                      <span>{person.designation}</span>
                    </button>
                  ))}
                  {!loadingCrew && !crew.length ? (
                    <div className="empty-state">No crew match the current filters.</div>
                  ) : null}
                </div>

                {totalCrewPages > 1 ? (
                  <div className="pagination-bar">
                    <button type="button" className="page-button" onClick={() => setCrewPage((page) => Math.max(1, page - 1))} disabled={safeCrewPage === 1}>Previous Page</button>
                    <div className="page-indicator">
                      <span className="eyebrow">Directory Pagination</span>
                      <strong>{safeCrewPage} / {totalCrewPages}</strong>
                    </div>
                    <button type="button" className="page-button" onClick={() => setCrewPage((page) => Math.min(totalCrewPages, page + 1))} disabled={safeCrewPage === totalCrewPages}>Next Page</button>
                  </div>
                ) : null}
              </div>
            </section>

            {!selectedCrew ? (
              <section className="panel recent-panel">
                <div className="panel-header">
                  <span className="eyebrow">Directory Status</span>
                  <strong>Select A Dossier To Open Records</strong>
                </div>
                <div className="empty-state">
                  The manifest remains the primary view until a specific file is opened. Use search or filters to narrow the crew, then select a record to open the dossier window.
                </div>
              </section>
            ) : null}
          </>
        ) : activeWorkspace === 'medical' ? (
          <>
            <section className="control-row medical-control-row">
              <label className="control control-wide">
                <span>Search Sickbay Charts</span>
                <input
                  type="text"
                  value={medicalSearch}
                  onChange={(event) => setMedicalSearch(event.target.value)}
                  placeholder="Janeway, Kim, Torres..."
                />
              </label>
              <div className="panel inline-panel">
                <span className="eyebrow">Chart Summary</span>
                <strong>{loadingMedicalCharts ? 'Loading...' : `${medicalCharts.length} crew charts`}</strong>
              </div>
              <div className="panel inline-panel">
                <span className="eyebrow">Profile Coverage</span>
                <strong>{medicalCharts.filter((chart) => chart.profile_exists).length} profiles on file</strong>
              </div>
            </section>

            <section className="workspace-grid">
              <div className="panel panel-list panel-list-only">
                <div className="panel-header">
                  <span className="eyebrow">Sickbay Directory</span>
                  <strong>{loadingMedicalCharts ? 'Loading...' : `Page ${safeMedicalPage} of ${totalMedicalPages} | ${medicalCharts.length} charts`}</strong>
                </div>

                <div className="crew-list">
                  {pagedMedicalCharts.map((chart) => (
                    <button
                      key={chart.crew_id}
                      type="button"
                      className={`crew-card ${selectedMedicalCrewId === chart.crew_id ? 'selected' : ''}`}
                      onClick={() => setSelectedMedicalCrewId(chart.crew_id)}
                    >
                      <span className="crew-name">{chart.display_name}</span>
                      <span>{chart.species || 'Species not recorded'}</span>
                      <span>Birth SD {chart.birth_stardate || 'Not Recorded'}</span>
                      <span>{chart.profile_exists ? 'Profile Ready' : 'Profile Needed'} | {chart.record_count} logs</span>
                    </button>
                  ))}
                  {!loadingMedicalCharts && !medicalCharts.length ? (
                    <div className="empty-state">No medical charts match the current search.</div>
                  ) : null}
                </div>

                {totalMedicalPages > 1 ? (
                  <div className="pagination-bar">
                    <button type="button" className="page-button" onClick={() => setMedicalPage((page) => Math.max(1, page - 1))} disabled={safeMedicalPage === 1}>Previous Page</button>
                    <div className="page-indicator">
                      <span className="eyebrow">Chart Pagination</span>
                      <strong>{safeMedicalPage} / {totalMedicalPages}</strong>
                    </div>
                    <button type="button" className="page-button" onClick={() => setMedicalPage((page) => Math.min(totalMedicalPages, page + 1))} disabled={safeMedicalPage === totalMedicalPages}>Next Page</button>
                  </div>
                ) : null}
              </div>
            </section>

            {!selectedMedicalChart ? (
              <section className="panel recent-panel">
                <div className="panel-header">
                  <span className="eyebrow">Sickbay Status</span>
                  <strong>Select A Chart To Open Medical Records</strong>
                </div>
                <div className="empty-state">
                  Medical charts are separate from personnel dossiers. Open a chart to review baseline patient data, build a medical profile, and add treatment records.
                </div>
              </section>
            ) : null}
          </>
        ) : activeWorkspace === 'transporter' ? (
          <>
            <section className="control-row medical-control-row">
              <label className="control control-wide">
                <span>Search Transporter Log</span>
                <input
                  type="text"
                  value={transporterSearch}
                  onChange={(event) => setTransporterSearch(event.target.value)}
                  placeholder="Janeway, Bridge, Transporter Room 1..."
                />
              </label>
              <div className="panel inline-panel">
                <span className="eyebrow">Transport Summary</span>
                <strong>{loadingTransporter ? 'Loading...' : `${transporterLogs.length} transport events`}</strong>
              </div>
              <div className="panel inline-panel">
                <span className="eyebrow">Pad Network</span>
                <strong>{transporterUnits.length} units | {transporterLocations.length} logged locations</strong>
                <span>{transporterUnits.map((unit) => unit.unit_id).join(' | ') || 'No units loaded'}</span>
              </div>
            </section>

            <section className="workspace-grid">
              <div className="panel panel-list panel-list-only">
                <div className="panel-header">
                  <span className="eyebrow">Transporter Record</span>
                  <div className="panel-header-actions">
                    <strong>{loadingTransporter ? 'Loading...' : `Page ${safeTransporterPage} of ${totalTransporterPages} | ${transporterLogs.length} events`}</strong>
                    <button className="page-button" type="button" onClick={() => openTransporterConsole('newlog')}>
                      New Transport Log
                    </button>
                  </div>
                </div>

                <div className="crew-list">
                  {pagedTransporterLogs.map((transportEvent) => (
                    <button
                      key={transportEvent.event_id}
                      type="button"
                      className={`crew-card ${selectedTransporterEventId === transportEvent.event_id && showTransporterConsole ? 'selected' : ''}`}
                      onClick={() => openTransporterConsole('detail', transportEvent.event_id)}
                    >
                      <span className="crew-name">{transportEvent.transport_direction} | {transportEvent.passenger_count} travelers</span>
                      <span>{transportEvent.transporter_unit_id} | {transportEvent.transporter_room || 'Unknown room'}</span>
                      <span>{formatTransporterControlLocationName(transportEvent.ship_location_name) || 'Ship location pending'}</span>
                      <span>Operator: {transportEvent.operator_display_name}</span>
                    </button>
                  ))}
                  {!loadingTransporter && !transporterLogs.length ? (
                    <div className="empty-state">No transporter events are on file yet. Open the console to log a bridge transfer or transporter-room operation.</div>
                  ) : null}
                </div>

                {totalTransporterPages > 1 ? (
                  <div className="pagination-bar">
                    <button type="button" className="page-button" onClick={() => setTransporterPage((page) => Math.max(1, page - 1))} disabled={safeTransporterPage === 1}>Previous Page</button>
                    <div className="page-indicator">
                      <span className="eyebrow">Transport Pagination</span>
                      <strong>{safeTransporterPage} / {totalTransporterPages}</strong>
                    </div>
                    <button type="button" className="page-button" onClick={() => setTransporterPage((page) => Math.min(totalTransporterPages, page + 1))} disabled={safeTransporterPage === totalTransporterPages}>Next Page</button>
                  </div>
                ) : null}
              </div>
            </section>

            {!showTransporterConsole ? (
              <section className="panel recent-panel">
                <div className="panel-header">
                  <span className="eyebrow">Transport Status</span>
                  <strong>Open The Console To Record Transport Events</strong>
                </div>
                <div className="empty-state">
                  Transporter records track shipboard transporter operations only. Use Bridge or transporter rooms as the logged Voyager-side location. Shuttle transports stay out of the mothership record.
                </div>
              </section>
            ) : null}
          </>
        ) : activeWorkspace === 'replicator' ? (
          <>
            <section className="control-row medical-control-row">
              <label className="control control-wide">
                <span>Search Replicator Activity</span>
                <input
                  type="text"
                  value={replicatorSearch}
                  onChange={(event) => setReplicatorSearch(event.target.value)}
                  placeholder="Coffee, Janeway, Galley, Unit 04..."
                />
              </label>
              <div className="panel inline-panel">
                <span className="eyebrow">Usage Summary</span>
                <strong>{loadingReplicator ? 'Loading...' : `${replicatorLogs.length} log events`}</strong>
              </div>
              <div className="panel inline-panel">
                <span className="eyebrow">Library Scope</span>
                <strong>{replicatorUnits.length} units | {replicatorPatterns.length} patterns</strong>
              </div>
            </section>

            <section className="workspace-grid">
              <div className="panel panel-list panel-list-only">
                <div className="panel-header">
                  <span className="eyebrow">Replicator Log</span>
                  <div className="panel-header-actions">
                    <strong>{loadingReplicator ? 'Loading...' : `Page ${safeReplicatorPage} of ${totalReplicatorPages} | ${replicatorLogs.length} events`}</strong>
                    <button className="page-button" type="button" onClick={() => openReplicatorConsole('newlog')}>
                      New Replicator Log
                    </button>
                  </div>
                </div>

                <div className="crew-list">
                  {pagedReplicatorLogs.map((log) => (
                    <button
                      key={log.log_id}
                      type="button"
                      className={`crew-card ${selectedReplicatorLogId === log.log_id && showReplicatorConsole ? 'selected' : ''}`}
                      onClick={() => openReplicatorConsole('detail', log.log_id)}
                    >
                      <span className="crew-name">{log.pattern_name || `Pattern ${log.pattern_id}`}</span>
                      <span>{formatRecordName(log)}</span>
                      <span>{log.replicator_unit_id} | {log.compartment_name || 'Compartment unknown'}</span>
                      <span>{log.timestamp || 'Timestamp pending'}</span>
                    </button>
                  ))}
                  {!loadingReplicator && !replicatorLogs.length ? (
                    <div className="empty-state">No replicator events match the current search. Open the console to log the first request.</div>
                  ) : null}
                </div>

                {totalReplicatorPages > 1 ? (
                  <div className="pagination-bar">
                    <button type="button" className="page-button" onClick={() => setReplicatorPage((page) => Math.max(1, page - 1))} disabled={safeReplicatorPage === 1}>Previous Page</button>
                    <div className="page-indicator">
                      <span className="eyebrow">Replicator Pagination</span>
                      <strong>{safeReplicatorPage} / {totalReplicatorPages}</strong>
                    </div>
                    <button type="button" className="page-button" onClick={() => setReplicatorPage((page) => Math.min(totalReplicatorPages, page + 1))} disabled={safeReplicatorPage === totalReplicatorPages}>Next Page</button>
                  </div>
                ) : null}
              </div>
            </section>

            {!showReplicatorConsole ? (
              <section className="panel recent-panel">
                <div className="panel-header">
                  <span className="eyebrow">Replicator Status</span>
                  <strong>Open The Console To Review Or File Usage</strong>
                </div>
                <div className="empty-state">
                  Replicator tracks requests and consumption, not installed hardware. Use this workspace to review past usage, browse available patterns, and file a new replication event against a crew record.
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <>
            <section className="control-row medical-control-row">
              <label className="control control-wide">
                <span>Search Compartments</span>
                <input
                  type="text"
                  value={systemsSearch}
                  onChange={(event) => setSystemsSearch(event.target.value)}
                  placeholder="Deck 1, Sickbay, Transporter Room..."
                />
              </label>
              <div className="panel inline-panel">
                <span className="eyebrow">Compartment Summary</span>
                <strong>{loadingSystems ? 'Loading...' : `${systemsCompartments.length} compartments`}</strong>
              </div>
              <div className="panel inline-panel">
                <span className="eyebrow">Installed Units</span>
                <strong>{systemsCompartments.reduce((sum, compartment) => sum + Number(compartment.replicator_count || 0) + Number(compartment.transporter_count || 0) + Number(compartment.holodeck_count || 0), 0)} tracked units</strong>
              </div>
            </section>

            <section className="workspace-grid">
              <div className="panel panel-list panel-list-only">
                <div className="panel-header">
                  <span className="eyebrow">Compartment Directory</span>
                  <strong>{loadingSystems ? 'Loading...' : `Page ${safeSystemsPage} of ${totalSystemsPages} | ${systemsCompartments.length} compartments`}</strong>
                </div>

                <div className="crew-list">
                  {pagedCompartments.map((compartment) => (
                    <button
                      key={compartment.compartment_id}
                      type="button"
                      className={`crew-card ${selectedCompartmentId === compartment.compartment_id ? 'selected' : ''}`}
                      onClick={() => setSelectedCompartmentId(compartment.compartment_id)}
                    >
                      <span className="crew-name">{compartment.compartment_name}</span>
                      <span>{compartment.compartment_id}</span>
                      <span>{compartment.compartment_designation || 'No designation'}</span>
                      <span>{compartment.replicator_count} replicators | {compartment.transporter_count} transporters | {compartment.holodeck_count} holodecks</span>
                    </button>
                  ))}
                  {!loadingSystems && !systemsCompartments.length ? (
                    <div className="empty-state">No compartments match the current search.</div>
                  ) : null}
                </div>

                {totalSystemsPages > 1 ? (
                  <div className="pagination-bar">
                    <button type="button" className="page-button" onClick={() => setSystemsPage((page) => Math.max(1, page - 1))} disabled={safeSystemsPage === 1}>Previous Page</button>
                    <div className="page-indicator">
                      <span className="eyebrow">Systems Pagination</span>
                      <strong>{safeSystemsPage} / {totalSystemsPages}</strong>
                    </div>
                    <button type="button" className="page-button" onClick={() => setSystemsPage((page) => Math.min(totalSystemsPages, page + 1))} disabled={safeSystemsPage === totalSystemsPages}>Next Page</button>
                  </div>
                ) : null}
              </div>
            </section>

            {!selectedCompartment ? (
              <section className="panel recent-panel">
                <div className="panel-header">
                  <span className="eyebrow">Systems Status</span>
                  <strong>Select A Compartment To Inspect Installed Units</strong>
                </div>
                <div className="empty-state">
                  Ship Systems acts as Voyager's infrastructure browser. Open a compartment to inspect installed replicators and transporter units without jumping into usage logs.
                </div>
              </section>
            ) : null}
          </>
        )}
      </main>

      {selectedCrew ? (
        <div className="dossier-overlay" onClick={() => setSelectedCrewId(null)}>
          <div
            ref={dossierRef}
            className="dossier-window"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="window-toolbar">
              <div>
                <span className="eyebrow">Personnel Dossier</span>
                <strong>{loadingDetail ? 'Syncing file...' : formatRecordName(selectedCrew)}</strong>
              </div>
              <button className="window-close" type="button" onClick={() => setSelectedCrewId(null)}>
                Close Dossier
              </button>
            </div>

            <div className="window-grid">
              <div className="panel panel-dossier">
                <div className="dossier-grid">
                  <div className="metric">
                    <span>Rank</span>
                    <strong>{selectedCrew.rank || 'Unassigned'}</strong>
                  </div>
                  <div className="metric">
                    <span>Department</span>
                    <strong>{selectedCrew.department || 'Unassigned'}</strong>
                  </div>
                  <div className="metric">
                    <span>Designation</span>
                    <strong>{selectedCrew.designation}</strong>
                  </div>
                  <div className="metric">
                    <span>Species</span>
                    <strong>{selectedCrew.species || 'Unknown'}</strong>
                  </div>
                  <div className="metric">
                    <span>Service Number</span>
                    <strong>{selectedCrew.service_number || 'Not Recorded'}</strong>
                  </div>
                  <div className="metric">
                    <span>Birth Stardate</span>
                    <strong>{selectedCrew.birth_stardate || 'Not Recorded'}</strong>
                  </div>
                </div>

                <div className="profile-note">
                  <span className="eyebrow">Origin</span>
                  <p>{selectedCrew.planet_of_origin || 'No world of origin has been entered for this file.'}</p>
                </div>
              </div>

              <div className="panel panel-detail">
                <div className="detail-tabs">
                  <button
                    type="button"
                    className={`detail-tab ${dossierTab === 'history' ? 'active' : ''}`}
                    onClick={() => setDossierTab('history')}
                  >
                    History
                  </button>
                  <button
                    type="button"
                    className={`detail-tab ${dossierTab === 'action' ? 'active' : ''}`}
                    onClick={() => setDossierTab('action')}
                  >
                    Action Console
                  </button>
                </div>

                {dossierTab === 'history' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">Personnel History</span>
                      <strong>{selectedCrew.personnel_actions.length} logged actions</strong>
                    </div>

                    <div className="timeline">
                      {selectedCrew.personnel_actions.length ? (
                        selectedCrew.personnel_actions.map((action) => (
                          <article key={action.action_id} className="timeline-entry">
                            <div className="timeline-badge">{action.action_type}</div>
                            <div>
                              <strong>
                                {action.old_rank || 'Current'} to {action.new_rank || 'Current'}
                              </strong>
                              <p>
                                Stardate {action.effective_stardate || 'pending'} | Episode {action.episode_reference || 'not tagged'}
                              </p>
                              {(action.old_species || action.new_species) ? (
                                <p>
                                  Species: {action.old_species || 'Unknown'} to {action.new_species || 'Unknown'}
                                </p>
                              ) : null}
                              {(action.old_planet_of_origin || action.new_planet_of_origin) ? (
                                <p>
                                  Origin: {action.old_planet_of_origin || 'Unknown'} to {action.new_planet_of_origin || 'Unknown'}
                                </p>
                              ) : null}
                              <p>{action.action_notes || 'No supplemental notes were entered.'}</p>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="empty-state">
                          No personnel actions have been logged for this dossier yet.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">Action Console</span>
                      <strong>Log Official Change</strong>
                    </div>

                    <form className="action-form" onSubmit={handleSubmit}>
                      <label className="control">
                        <span>Action Type</span>
                        <select name="action_type" value={formState.action_type} onChange={handleFormChange}>
                          <option value="Promotion">Promotion</option>
                          <option value="Demotion">Demotion</option>
                          <option value="Transfer">Transfer</option>
                          <option value="Status Change">Status Change</option>
                          <option value="Commendation">Commendation</option>
                          <option value="Note">Note</option>
                        </select>
                      </label>

                      <div className="action-grid">
                        <label className="control">
                          <span>Season</span>
                          <select name="episode_season" value={formState.episode_season} onChange={handleSeasonChange}>
                            <option value="">Manual Entry</option>
                            {VOYAGER_EPISODE_GUIDE.map((entry) => (
                              <option key={entry.season} value={entry.season}>
                                {entry.season}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Episode</span>
                          <select
                            name="episode_title"
                            value={formState.episode_title}
                            onChange={handleEpisodeChange}
                            disabled={!selectedSeasonGuide}
                          >
                            <option value="">Select Episode</option>
                            {(selectedSeasonGuide?.episodes || []).map(([title]) => (
                              <option key={title} value={title}>
                                {title}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>New Rank</span>
                          <input
                            name="new_rank"
                            value={formState.new_rank}
                            onChange={handleFormChange}
                            placeholder="Lieutenant Commander"
                          />
                        </label>

                        <label className="control">
                          <span>Species</span>
                          <input
                            name="new_species"
                            value={formState.new_species}
                            onChange={handleFormChange}
                            placeholder="Bajoran"
                          />
                        </label>

                        <label className="control">
                          <span>World Of Origin</span>
                          <input
                            name="new_planet_of_origin"
                            value={formState.new_planet_of_origin}
                            onChange={handleFormChange}
                            placeholder="Bajor"
                          />
                        </label>

                        <label className="control">
                          <span>New Department</span>
                          <select
                            name="new_department_id"
                            value={formState.new_department_id}
                            onChange={handleFormChange}
                          >
                            <option value="">Unchanged</option>
                            {departments.map((department) => (
                              <option key={department.department_id} value={department.department_id}>
                                {department.department_name}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Effective Stardate</span>
                          <input
                            name="effective_stardate"
                            value={formState.effective_stardate}
                            onChange={handleFormChange}
                            placeholder="48532.4"
                          />
                        </label>

                        <label className="control">
                          <span>Episode Reference</span>
                          <input
                            name="episode_reference"
                            value={formState.episode_reference}
                            onChange={handleFormChange}
                            placeholder="S05E03"
                          />
                        </label>
                      </div>

                      <label className="control">
                        <span>Entered By</span>
                        <input
                          name="entered_by"
                          value={formState.entered_by}
                          onChange={handleFormChange}
                          placeholder="Records Officer"
                        />
                      </label>

                      <label className="control">
                        <span>Action Notes</span>
                        <textarea
                          name="action_notes"
                          value={formState.action_notes}
                          onChange={handleFormChange}
                          placeholder="Promotion entered following command review."
                          rows="4"
                        />
                      </label>

                      <div className="action-preview">
                        <span className="eyebrow">Preview</span>
                        <p>
                          {formatRecordName(selectedCrew)} | {formState.action_type} |{' '}
                          {formState.new_rank || selectedCrew?.rank || 'Rank unchanged'} |{' '}
                          {formState.new_species || selectedCrew?.species || 'Species unchanged'} |{' '}
                          {selectedDepartmentName || selectedCrew?.department || 'Department unchanged'}
                        </p>
                      </div>

                      <button className="submit-button" type="submit" disabled={!selectedCrew || submitting}>
                        {submitting ? 'Logging Action...' : 'Log Personnel Action'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <div className="panel recent-panel recent-panel-window">
              <div className="panel-header">
                <span className="eyebrow">Bridge Summary</span>
                <strong>Recent Personnel Actions</strong>
              </div>

              <div className="recent-grid">
                {recentActions.length ? (
                  recentActions.map((action) => (
                    <article key={action.action_id} className="recent-card">
                      <span className="recent-type">{action.action_type}</span>
                      <strong>{formatRecordName(action)}</strong>
                      <p>{action.new_rank || action.old_rank || 'No rank change recorded'}</p>
                      <p>Episode {action.episode_reference || 'not tagged'}</p>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    No recent personnel actions yet. The action feed will appear here once the SQL table is installed.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showCrewCreate && activeWorkspace === 'personnel' ? (
        <div className="dossier-overlay" onClick={() => setShowCrewCreate(false)}>
          <div className="dossier-window create-window" onClick={(event) => event.stopPropagation()}>
            <div className="window-toolbar">
              <div>
                <span className="eyebrow">Personnel Intake</span>
                <strong>Create New Crew Record</strong>
              </div>
              <button className="window-close" type="button" onClick={() => setShowCrewCreate(false)}>
                Close Intake
              </button>
            </div>

            <div className="panel panel-detail panel-detail-full">
              <form className="action-form" onSubmit={handleCrewCreateSubmit}>
                <div className="action-grid">
                  <label className="control">
                    <span>Given Name</span>
                    <input name="first_name" value={crewCreateForm.first_name} onChange={handleCrewCreateChange} placeholder="Kathryn" required />
                  </label>
                  <label className="control">
                    <span>Surname</span>
                    <input name="last_name" value={crewCreateForm.last_name} onChange={handleCrewCreateChange} placeholder="Janeway" required />
                  </label>
                  <label className="control">
                    <span>Rank</span>
                    <input name="crew_rank" value={crewCreateForm.crew_rank} onChange={handleCrewCreateChange} placeholder="Ensign" />
                  </label>
                  <label className="control">
                    <span>Date Of Birth</span>
                    <input name="birth_stardate" value={crewCreateForm.birth_stardate} onChange={handleCrewCreateChange} placeholder="14500.12" />
                  </label>
                  <label className="control">
                    <span>Species</span>
                    <input name="species" value={crewCreateForm.species} onChange={handleCrewCreateChange} placeholder="Human" />
                  </label>
                  <label className="control">
                    <span>World Of Origin</span>
                    <input name="planet_of_origin" value={crewCreateForm.planet_of_origin} onChange={handleCrewCreateChange} placeholder="Earth" />
                  </label>
                  <label className="control">
                    <span>Designation</span>
                    <select name="crew_designation" value={crewCreateForm.crew_designation} onChange={handleCrewCreateChange}>
                      <option value="StarFleet">StarFleet</option>
                      <option value="Maquis">Maquis</option>
                      <option value="Civilian">Civilian</option>
                    </select>
                  </label>
                  <label className="control">
                    <span>Department</span>
                    <select name="department_id" value={crewCreateForm.department_id} onChange={handleCrewCreateChange}>
                      <option value="">Unassigned</option>
                      {departments.map((department) => (
                        <option key={department.department_id} value={department.department_id}>
                          {department.department_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="control">
                  <span>Service Number</span>
                  <input name="service_number" value={crewCreateForm.service_number} onChange={handleCrewCreateChange} placeholder="VF-123-4567" />
                </label>

                <button className="submit-button" type="submit" disabled={submittingCrewCreate}>
                  {submittingCrewCreate ? 'Creating Record...' : 'Create Crew Record'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

      {selectedMedicalChart && activeWorkspace === 'medical' ? (
        <div className="dossier-overlay" onClick={() => setSelectedMedicalCrewId(null)}>
          <div
            ref={dossierRef}
            className="dossier-window"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="window-toolbar">
              <div>
                <span className="eyebrow">Medical Chart</span>
                <strong>{loadingMedicalDetail ? 'Syncing chart...' : selectedMedicalChart.display_name}</strong>
              </div>
              <button className="window-close" type="button" onClick={() => setSelectedMedicalCrewId(null)}>
                Close Chart
              </button>
            </div>

            <div className="window-grid">
              <div className="panel panel-dossier">
                <div className="dossier-grid">
                  <div className="metric">
                    <span>Patient</span>
                    <strong>{selectedMedicalChart.display_name}</strong>
                  </div>
                  <div className="metric">
                    <span>Species</span>
                    <strong>{selectedMedicalChart.species || 'Unknown'}</strong>
                  </div>
                  <div className="metric">
                    <span>Date Of Birth</span>
                    <strong>{selectedMedicalChart.birth_stardate || 'Not Recorded'}</strong>
                  </div>
                  <div className="metric">
                    <span>Profile Status</span>
                    <strong>{selectedMedicalChart.medical_profile ? 'On File' : 'Not Started'}</strong>
                  </div>
                  <div className="metric">
                    <span>Treatment Logs</span>
                    <strong>{selectedMedicalChart.medical_records.length}</strong>
                  </div>
                  <div className="metric">
                    <span>Chart Type</span>
                    <strong>Sickbay Record</strong>
                  </div>
                </div>

                <div className="profile-note">
                  <span className="eyebrow">Medical Guidance</span>
                  <p>Use the baseline profile for persistent health data and the treatment log for incident-based care, follow-up, and interventions.</p>
                </div>
              </div>

              <div className="panel panel-detail">
                <div className="detail-tabs">
                  <button type="button" className={`detail-tab ${medicalTab === 'profile' ? 'active' : ''}`} onClick={() => setMedicalTab('profile')}>Profile</button>
                  <button type="button" className={`detail-tab ${medicalTab === 'records' ? 'active' : ''}`} onClick={() => setMedicalTab('records')}>Treatment Logs</button>
                  <button type="button" className={`detail-tab ${medicalTab === 'newlog' ? 'active' : ''}`} onClick={() => setMedicalTab('newlog')}>New Log</button>
                </div>

                {medicalTab === 'profile' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">Baseline Medical Profile</span>
                      <strong>{selectedMedicalChart.medical_profile ? 'Update Existing Profile' : 'Create Initial Profile'}</strong>
                    </div>

                    <form className="action-form" onSubmit={handleMedicalProfileSubmit}>
                      <div className="action-grid">
                        <label className="control">
                          <span>Blood Type</span>
                          <input name="blood_type" value={medicalProfileForm.blood_type} onChange={handleMedicalProfileChange} placeholder="O+" />
                        </label>
                        <label className="control">
                          <span>Emergency Contact</span>
                          <input name="emergency_contact" value={medicalProfileForm.emergency_contact} onChange={handleMedicalProfileChange} placeholder="Captain Janeway" />
                        </label>
                      </div>

                      <label className="control">
                        <span>Allergies</span>
                        <input name="allergies" value={medicalProfileForm.allergies} onChange={handleMedicalProfileChange} placeholder="Leola root, anesthesia compound 9..." />
                      </label>

                      <label className="control">
                        <span>Chronic Conditions</span>
                        <input name="chronic_conditions" value={medicalProfileForm.chronic_conditions} onChange={handleMedicalProfileChange} placeholder="Recurring migraines, transporter sensitivity..." />
                      </label>

                      <button className="submit-button" type="submit" disabled={submittingMedical}>
                        {submittingMedical ? 'Saving Profile...' : 'Save Medical Profile'}
                      </button>
                    </form>
                  </div>
                ) : null}

                {medicalTab === 'records' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">Treatment History</span>
                      <strong>{selectedMedicalChart.medical_records.length} treatment logs</strong>
                    </div>

                    <div className="timeline">
                      {selectedMedicalChart.medical_records.length ? (
                        selectedMedicalChart.medical_records.map((record) => (
                          <article key={record.record_id} className="timeline-entry">
                            <div className="timeline-badge">MED</div>
                            <div>
                              <strong>{record.reason_for_visit || 'Treatment record'}</strong>
                              <p>Visit Stardate {record.visit_stardate || 'pending'}</p>
                              <p>Treatment: {record.treatment_provided || 'Not specified'}</p>
                              <p>Follow-up Required: {record.follow_up_required ? 'Yes' : 'No'}</p>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="empty-state">No treatment logs have been entered for this chart yet.</div>
                      )}
                    </div>
                  </div>
                ) : null}

                {medicalTab === 'newlog' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">New Medical Log</span>
                      <strong>Record Treatment Or Follow-Up</strong>
                    </div>

                    <form className="action-form" onSubmit={handleMedicalRecordSubmit}>
                      <div className="action-grid">
                        <label className="control">
                          <span>Season</span>
                          <select name="episode_season" value={medicalRecordForm.episode_season} onChange={handleMedicalRecordSeasonChange}>
                            <option value="">Manual Stardate Entry</option>
                            {VOYAGER_EPISODE_GUIDE.map((entry) => (
                              <option key={`medical-${entry.season}`} value={entry.season}>
                                {entry.season}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="control">
                          <span>Episode</span>
                          <select
                            name="episode_title"
                            value={medicalRecordForm.episode_title}
                            onChange={handleMedicalRecordEpisodeChange}
                            disabled={!medicalRecordForm.episode_season}
                          >
                            <option value="">{medicalRecordForm.episode_season ? 'Select Episode' : 'Choose Season First'}</option>
                            {(selectedMedicalSeasonGuide?.episodes || []).map(([title]) => (
                              <option key={`medical-episode-${title}`} value={title}>
                                {title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="control">
                          <span>Visit Stardate</span>
                          <input name="visit_stardate" value={medicalRecordForm.visit_stardate} onChange={handleMedicalRecordChange} placeholder="48532.4" />
                        </label>
                        <label className="control checkbox-control">
                          <span>Follow-Up Required</span>
                          <input type="checkbox" name="follow_up_required" checked={medicalRecordForm.follow_up_required} onChange={handleMedicalRecordChange} />
                        </label>
                      </div>

                      <label className="control">
                        <span>Reason For Visit</span>
                        <input name="reason_for_visit" value={medicalRecordForm.reason_for_visit} onChange={handleMedicalRecordChange} placeholder="Radiation exposure, plasma burn, neural fatigue..." />
                      </label>

                      <label className="control">
                        <span>Treatment Provided</span>
                        <textarea name="treatment_provided" value={medicalRecordForm.treatment_provided} onChange={handleMedicalRecordChange} placeholder="Cortical stimulator applied, patient held for observation..." rows="4" />
                      </label>

                      <button className="submit-button" type="submit" disabled={submittingMedical}>
                        {submittingMedical ? 'Logging Treatment...' : 'Add Medical Log'}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showReplicatorConsole && activeWorkspace === 'replicator' ? (
        <div className="dossier-overlay" onClick={closeReplicatorConsole}>
          <div
            ref={dossierRef}
            className="dossier-window"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="window-toolbar">
              <div>
                <span className="eyebrow">Replicator Console</span>
                <strong>
                  {selectedReplicatorLog
                    ? `${selectedReplicatorLog.pattern_name || `Pattern ${selectedReplicatorLog.pattern_id}`} | ${selectedReplicatorLog.replicator_unit_id}`
                    : 'New Consumption Record'}
                </strong>
              </div>
              <button className="window-close" type="button" onClick={closeReplicatorConsole}>
                Close Console
              </button>
            </div>

            <div className="window-grid">
              <div className="panel panel-dossier">
                <div className="dossier-grid">
                  <div className="metric">
                    <span>Active Log</span>
                    <strong>{selectedReplicatorLog ? selectedReplicatorLog.log_id : 'New Entry'}</strong>
                  </div>
                  <div className="metric">
                    <span>Pattern</span>
                    <strong>{selectedReplicatorLog?.pattern_name || selectedReplicatorPattern?.pattern_name || 'Not selected'}</strong>
                  </div>
                  <div className="metric">
                    <span>Requested By</span>
                    <strong>{selectedReplicatorLog ? formatRecordName(selectedReplicatorLog) : selectedReplicatorCrew ? formatRecordName(selectedReplicatorCrew) : 'No crew selected'}</strong>
                  </div>
                  <div className="metric">
                    <span>Unit</span>
                    <strong>{selectedReplicatorLog?.replicator_unit_id || selectedReplicatorUnit?.unit_id || 'Not selected'}</strong>
                  </div>
                  <div className="metric">
                    <span>Compartment</span>
                    <strong>{selectedReplicatorLog?.compartment_name || selectedReplicatorUnit?.compartment_name || 'Not recorded'}</strong>
                  </div>
                  <div className="metric">
                    <span>Stardate</span>
                    <strong>{selectedReplicatorLog?.timestamp || replicatorLogForm.timestamp || 'Pending'}</strong>
                  </div>
                </div>

                <div className="profile-note">
                  <span className="eyebrow">Console Guidance</span>
                  <p>Ship Systems tracks where replicators are installed. This console tracks who requested what, from which unit, and when the event occurred.</p>
                </div>
              </div>

              <div className="panel panel-detail">
                <div className="detail-tabs">
                  <button type="button" className={`detail-tab ${replicatorTab === 'detail' ? 'active' : ''}`} onClick={() => setReplicatorTab('detail')}>Log Detail</button>
                  <button type="button" className={`detail-tab ${replicatorTab === 'newlog' ? 'active' : ''}`} onClick={() => setReplicatorTab('newlog')}>New Log</button>
                  <button type="button" className={`detail-tab ${replicatorTab === 'patterns' ? 'active' : ''}`} onClick={() => setReplicatorTab('patterns')}>Pattern Library</button>
                  <button type="button" className={`detail-tab ${replicatorTab === 'newpattern' ? 'active' : ''}`} onClick={() => setReplicatorTab('newpattern')}>New Pattern</button>
                </div>

                {replicatorTab === 'detail' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">Selected Replicator Event</span>
                      <strong>{selectedReplicatorLog ? 'Usage Event Loaded' : 'No Log Selected'}</strong>
                    </div>

                    {selectedReplicatorLog ? (
                      <div className="timeline">
                        <article className="timeline-entry">
                          <div className="timeline-badge">REP</div>
                          <div>
                            <strong>{selectedReplicatorLog.pattern_name || `Pattern ${selectedReplicatorLog.pattern_id}`}</strong>
                            <p>Requested By: {formatRecordName(selectedReplicatorLog)}</p>
                            <p>Stardate: {selectedReplicatorLog.timestamp || 'Not recorded'}</p>
                            <p>Unit: {selectedReplicatorLog.replicator_unit_id} | Type: {selectedReplicatorLog.replicator_type || 'Unknown'}</p>
                            <p>Compartment: {selectedReplicatorLog.compartment_name || 'Unknown'} | Access Level: {selectedReplicatorLog.access_level || 'Not specified'}</p>
                            <p>Category: {selectedReplicatorLog.category || 'Unclassified'}</p>
                          </div>
                        </article>
                      </div>
                    ) : (
                      <div className="empty-state">Select an entry from the replicator log, or open the New Log tab to file a fresh usage event.</div>
                    )}
                  </div>
                ) : null}

                {replicatorTab === 'newlog' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">New Replicator Event</span>
                      <strong>Record A Crew Request</strong>
                    </div>

                    <form className="action-form" onSubmit={handleReplicatorLogSubmit}>
                      <div className="action-grid">
                        <label className="control">
                          <span>Crew Member</span>
                          <select name="crew_id" value={replicatorLogForm.crew_id} onChange={handleReplicatorLogChange} required>
                            <option value="">Select Crew</option>
                            {replicatorCrewOptions.map((member) => (
                              <option key={member.crew_id} value={member.crew_id}>
                                {formatRecordName(member)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Replicator Unit</span>
                          <select name="replicator_unit_id" value={replicatorLogForm.replicator_unit_id} onChange={handleReplicatorLogChange} required>
                            <option value="">Select Unit</option>
                            {replicatorUnits.map((unit) => (
                              <option key={unit.unit_id} value={unit.unit_id}>
                                {unit.unit_id} | {unit.compartment_name || 'Unknown compartment'}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Pattern</span>
                          <select name="pattern_id" value={replicatorLogForm.pattern_id} onChange={handleReplicatorLogChange} required>
                            <option value="">Select Pattern</option>
                            {replicatorPatterns.map((pattern) => (
                              <option key={pattern.pattern_id} value={pattern.pattern_id}>
                                {pattern.pattern_name} | {pattern.category || 'General'}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Season</span>
                          <select name="episode_season" value={replicatorLogForm.episode_season} onChange={handleReplicatorSeasonChange}>
                            <option value="">Manual Stardate Entry</option>
                            {VOYAGER_EPISODE_GUIDE.map((entry) => (
                              <option key={`replicator-${entry.season}`} value={entry.season}>
                                {entry.season}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Episode</span>
                          <select
                            name="episode_title"
                            value={replicatorLogForm.episode_title}
                            onChange={handleReplicatorEpisodeChange}
                            disabled={!replicatorLogForm.episode_season}
                          >
                            <option value="">{replicatorLogForm.episode_season ? 'Select Episode' : 'Choose Season First'}</option>
                            {(selectedReplicatorSeasonGuide?.episodes || []).map(([title]) => (
                              <option key={`replicator-episode-${title}`} value={title}>
                                {title}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Stardate</span>
                          <input name="timestamp" value={replicatorLogForm.timestamp} onChange={handleReplicatorLogChange} placeholder="48532.4" required />
                        </label>
                      </div>

                      <div className="action-preview">
                        <span className="eyebrow">Preview</span>
                        <p>
                          {selectedReplicatorCrew ? formatRecordName(selectedReplicatorCrew) : 'Crew pending'} |{' '}
                          {selectedReplicatorPattern?.pattern_name || 'Pattern pending'} |{' '}
                          {selectedReplicatorUnit?.unit_id || 'Unit pending'} |{' '}
                          {selectedReplicatorUnit?.compartment_name || 'Compartment pending'}
                        </p>
                      </div>

                      <button className="submit-button" type="submit" disabled={submittingReplicator}>
                        {submittingReplicator ? 'Logging Replication...' : 'Log Replicator Event'}
                      </button>
                    </form>
                  </div>
                ) : null}

                {replicatorTab === 'patterns' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">Pattern Library</span>
                      <strong>{replicatorPatterns.length} patterns in scope</strong>
                    </div>

                    <div className="timeline">
                      {pagedReplicatorPatterns.length ? (
                        pagedReplicatorPatterns.map((pattern) => (
                          <article key={pattern.pattern_id} className="timeline-entry">
                            <div className="timeline-badge">PAT</div>
                            <div>
                              <strong>{pattern.pattern_name}</strong>
                              <p>Category: {pattern.category || 'Unclassified'} | Origin: {pattern.origin_species || 'Unknown'}</p>
                              <p>Last Updated Stardate: {pattern.last_updated_stardate || 'Not recorded'}</p>
                              <p>{pattern.description || 'No pattern description is currently on file.'}</p>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="empty-state">No pattern matches the current search. Narrow the search less or clear it to browse the wider library.</div>
                      )}
                    </div>

                    {totalReplicatorPatternPages > 1 ? (
                      <div className="pagination-bar">
                        <button type="button" className="page-button" onClick={() => setReplicatorPatternPage((page) => Math.max(1, page - 1))} disabled={safeReplicatorPatternPage === 1}>Previous Page</button>
                        <div className="page-indicator">
                          <span className="eyebrow">Pattern Pagination</span>
                          <strong>{safeReplicatorPatternPage} / {totalReplicatorPatternPages}</strong>
                        </div>
                        <button type="button" className="page-button" onClick={() => setReplicatorPatternPage((page) => Math.min(totalReplicatorPatternPages, page + 1))} disabled={safeReplicatorPatternPage === totalReplicatorPatternPages}>Next Page</button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {replicatorTab === 'newpattern' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">Pattern Authoring</span>
                      <strong>Add New Replicator Pattern</strong>
                    </div>

                    <form className="action-form" onSubmit={handleReplicatorPatternSubmit}>
                      <div className="action-grid">
                        <label className="control">
                          <span>Pattern Name</span>
                          <input name="pattern_name" value={replicatorPatternForm.pattern_name} onChange={handleReplicatorPatternChange} placeholder="Tomato soup, hot" required />
                        </label>

                        <label className="control">
                          <span>Category</span>
                          <input name="category" value={replicatorPatternForm.category} onChange={handleReplicatorPatternChange} placeholder="Beverage, Meal, Medical" />
                        </label>

                        <label className="control">
                          <span>Origin Species</span>
                          <input name="origin_species" value={replicatorPatternForm.origin_species} onChange={handleReplicatorPatternChange} placeholder="Human" />
                        </label>

                        <label className="control">
                          <span>Energy Cost</span>
                          <input name="energy_cost" value={replicatorPatternForm.energy_cost} onChange={handleReplicatorPatternChange} placeholder="2.50" />
                        </label>

                        <label className="control">
                          <span>Last Updated Stardate</span>
                          <input name="last_updated_stardate" value={replicatorPatternForm.last_updated_stardate} onChange={handleReplicatorPatternChange} placeholder="48532.4" />
                        </label>
                      </div>

                      <label className="control">
                        <span>Description</span>
                        <textarea name="description" value={replicatorPatternForm.description} onChange={handleReplicatorPatternChange} placeholder="Standard officer-mess serving with nutritional profile and heat preference." rows="4" />
                      </label>

                      <div className="action-preview">
                        <span className="eyebrow">Library Preview</span>
                        <p>
                          {replicatorPatternForm.pattern_name || 'Pattern pending'} |{' '}
                          {replicatorPatternForm.category || 'Category pending'} |{' '}
                          {replicatorPatternForm.origin_species || 'Origin pending'} |{' '}
                          {replicatorPatternForm.last_updated_stardate || 'Stardate pending'}
                        </p>
                      </div>

                      <button className="submit-button" type="submit" disabled={submittingReplicatorPattern}>
                        {submittingReplicatorPattern ? 'Saving Pattern...' : 'Add Replicator Pattern'}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showTransporterConsole && activeWorkspace === 'transporter' ? (
        <div className="dossier-overlay" onClick={closeTransporterConsole}>
          <div
            ref={dossierRef}
            className="dossier-window"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="window-toolbar">
              <div>
                <span className="eyebrow">Transporter Console</span>
                <strong>
                  {selectedTransporterEvent
                    ? `${selectedTransporterEvent.transport_direction} | ${selectedTransporterEvent.passenger_count} travelers`
                    : 'New Transport Event'}
                </strong>
              </div>
              <button className="window-close" type="button" onClick={closeTransporterConsole}>
                Close Console
              </button>
            </div>

            <div className="window-grid">
              <div className="panel panel-dossier">
                <div className="dossier-grid">
                  <div className="metric">
                    <span>Transport Unit</span>
                    <strong>{selectedTransporterEvent?.transporter_unit_id || selectedTransporterUnit?.unit_id || 'Not selected'}</strong>
                  </div>
                  <div className="metric">
                    <span>Transport Room</span>
                    <strong>{selectedTransporterEvent?.transporter_room || selectedTransporterUnit?.compartment_name || 'Not selected'}</strong>
                  </div>
                  <div className="metric">
                    <span>Direction</span>
                    <strong>{selectedTransporterEvent?.transport_direction || transporterLogForm.transport_direction}</strong>
                  </div>
                  <div className="metric">
                    <span>Transporter Control Location</span>
                    <strong>{formatTransporterControlLocationName(selectedTransporterEvent?.ship_location_name || selectedTransporterLocation?.compartment_name) || 'Not selected'}</strong>
                  </div>
                  <div className="metric">
                    <span>Operator</span>
                    <strong>{selectedTransporterEvent?.operator_display_name || (selectedTransporterOperator ? formatRecordName(selectedTransporterOperator) : 'Not selected')}</strong>
                  </div>
                  <div className="metric">
                    <span>Passengers</span>
                    <strong>{selectedTransporterEvent?.passenger_count || selectedTransporterPassengers.length}</strong>
                  </div>
                </div>

                <div className="profile-note">
                  <span className="eyebrow">Console Guidance</span>
                  <p>Log only Voyager transporter activity. Record the assigned pad separately from the control position, and keep shuttle transporter use out of these records.</p>
                </div>
              </div>

              <div className="panel panel-detail">
                <div className="detail-tabs">
                  <button type="button" className={`detail-tab ${transporterTab === 'detail' ? 'active' : ''}`} onClick={() => setTransporterTab('detail')}>Event Detail</button>
                  <button type="button" className={`detail-tab ${transporterTab === 'newlog' ? 'active' : ''}`} onClick={() => setTransporterTab('newlog')}>New Log</button>
                </div>

                {transporterTab === 'detail' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">Transport Event</span>
                      <strong>{selectedTransporterEvent ? 'Event Loaded' : 'No Event Selected'}</strong>
                    </div>

                    {selectedTransporterEvent ? (
                      <div className="timeline">
                        <article className="timeline-entry">
                          <div className="timeline-badge">TRN</div>
                          <div>
                            <strong>{selectedTransporterEvent.transport_direction} | Stardate {selectedTransporterEvent.stardate}</strong>
                            <p>Unit: {selectedTransporterEvent.transporter_unit_id} | Room: {selectedTransporterEvent.transporter_room || 'Unknown'}</p>
                            <p>Operator: {selectedTransporterEvent.operator_display_name}</p>
                            <p>Control Location: {formatTransporterControlLocationName(selectedTransporterEvent.ship_location_name) || 'Not logged'}</p>
                            <p>Target Location: {selectedTransporterEvent.off_ship_location || 'Not logged'}</p>
                          </div>
                        </article>

                        <div className="panel-subheader systems-subheader">
                          <span className="eyebrow">Passenger Roster</span>
                          <strong>{selectedTransporterEvent.passengers.length} travelers</strong>
                        </div>
                        {selectedTransporterEvent.passengers.length ? (
                          selectedTransporterEvent.passengers.map((passenger) => (
                            <article key={`${selectedTransporterEvent.event_id}-${passenger.crew_id}-${passenger.passenger_order}`} className="timeline-entry">
                              <div className="timeline-badge">PAD</div>
                              <div>
                                <strong>{passenger.display_name}</strong>
                                <p>Pad Position {passenger.passenger_order}</p>
                              </div>
                            </article>
                          ))
                        ) : (
                          <div className="empty-state">No passengers were resolved for this event.</div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state">Select an event from the transporter log, or open the New Log tab to record a fresh transport.</div>
                    )}
                  </div>
                ) : null}

                {transporterTab === 'newlog' ? (
                  <div className="detail-pane">
                    <div className="panel-subheader">
                      <span className="eyebrow">New Transport Log</span>
                      <strong>Record Pad Operation</strong>
                    </div>

                    <form className="action-form" onSubmit={handleTransporterLogSubmit}>
                      <div className="action-grid">
                        <div className="control">
                          <span>Transporter Unit</span>
                          {transporterUnits.length ? (
                            <div className="choice-grid">
                              {transporterUnits.map((unit) => (
                                <button
                                  key={unit.unit_id}
                                  type="button"
                                  className={`choice-card ${transporterLogForm.transporter_unit_id === unit.unit_id ? 'selected' : ''}`}
                                  onClick={() => setTransporterLogForm((current) => ({ ...current, transporter_unit_id: unit.unit_id }))}
                                >
                                  <strong>{unit.unit_id}</strong>
                                  <span>{unit.compartment_name}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-state">No transporter units are loaded into the console yet. Refresh the station link and reopen the log if this remains empty.</div>
                          )}
                        </div>

                        <label className="control">
                          <span>Transporter Operator</span>
                          <select name="operator_crew_id" value={transporterLogForm.operator_crew_id} onChange={handleTransporterChange}>
                            <option value="">Unspecified</option>
                            {replicatorCrewOptions.map((member) => (
                              <option key={member.crew_id} value={member.crew_id}>
                                {formatRecordName(member)}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Stardate</span>
                          <input name="stardate" value={transporterLogForm.stardate} onChange={handleTransporterChange} placeholder="48315.6" required />
                        </label>

                        <label className="control">
                          <span>Direction</span>
                          <select name="transport_direction" value={transporterLogForm.transport_direction} onChange={handleTransporterChange}>
                            <option value="Outbound">Outbound</option>
                            <option value="Inbound">Inbound</option>
                          </select>
                        </label>

                        <label className="control">
                          <span>Season</span>
                          <select name="episode_season" value={transporterLogForm.episode_season} onChange={handleTransporterSeasonChange}>
                            <option value="">Manual Stardate Entry</option>
                            {VOYAGER_EPISODE_GUIDE.map((entry) => (
                              <option key={`transporter-${entry.season}`} value={entry.season}>
                                {entry.season}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="control">
                          <span>Episode</span>
                          <select
                            name="episode_title"
                            value={transporterLogForm.episode_title}
                            onChange={handleTransporterEpisodeChange}
                            disabled={!transporterLogForm.episode_season}
                          >
                            <option value="">{transporterLogForm.episode_season ? 'Select Episode' : 'Choose Season First'}</option>
                            {(selectedTransporterSeasonGuide?.episodes || []).map(([title]) => (
                              <option key={`transporter-episode-${title}`} value={title}>
                                {title}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="control">
                          <span>Transporter Control Location</span>
                          {transporterLocations.length ? (
                            <div className="choice-grid">
                              {transporterLocations.map((location) => (
                                <button
                                  key={location.compartment_id}
                                  type="button"
                                  className={`choice-card ${transporterLogForm.ship_location_id === location.compartment_id ? 'selected' : ''}`}
                                  onClick={() => setTransporterLogForm((current) => ({ ...current, ship_location_id: location.compartment_id }))}
                                >
                                  <strong>{formatTransporterControlLocationName(location.compartment_name)}</strong>
                                  <span>{location.compartment_id}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="empty-state">No Bridge, Engineering, or transporter room control locations are loaded into the console yet.</div>
                          )}
                        </div>

                        <label className="control">
                          <span>Target Location</span>
                          <input name="off_ship_location" value={transporterLogForm.off_ship_location} onChange={handleTransporterChange} placeholder="Planet surface, station habitat ring..." />
                        </label>
                      </div>

                      <div className="panel-subheader systems-subheader">
                        <span className="eyebrow">Passenger Roster</span>
                        <strong>Up To 10 Crew Members</strong>
                      </div>

                      <div className="action-grid transporter-passenger-grid">
                        {transporterLogForm.passenger_crew_ids.map((crewId, index) => (
                          <label key={`transporter-passenger-${index + 1}`} className="control">
                            <span>Passenger {index + 1}</span>
                            <select value={crewId} onChange={(event) => handleTransporterPassengerChange(index, event.target.value)}>
                              <option value="">Empty Pad</option>
                              {replicatorCrewOptions.map((member) => (
                                <option key={member.crew_id} value={member.crew_id}>
                                  {formatRecordName(member)}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>

                      <div className="action-preview">
                        <span className="eyebrow">Preview</span>
                        <p>
                          {selectedTransporterUnit?.unit_id || 'Unit pending'} |{' '}
                          {selectedTransporterLocation?.compartment_name || 'Location pending'} |{' '}
                          {transporterLogForm.transport_direction} |{' '}
                          {selectedTransporterPassengers.length} travelers
                        </p>
                      </div>

                      <button className="submit-button" type="submit" disabled={submittingTransporter}>
                        {submittingTransporter ? 'Logging Transport...' : 'Log Transport Event'}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedCompartment && activeWorkspace === 'systems' ? (
        <div className="dossier-overlay" onClick={() => setSelectedCompartmentId(null)}>
          <div
            ref={dossierRef}
            className="dossier-window"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="window-toolbar">
              <div>
                <span className="eyebrow">Ship Systems</span>
                <strong>{loadingSystemDetail ? 'Syncing compartment...' : `${selectedCompartment.compartment_name} | ${selectedCompartment.compartment_id}`}</strong>
              </div>
              <button className="window-close" type="button" onClick={() => setSelectedCompartmentId(null)}>
                Close Compartment
              </button>
            </div>

            <div className="window-grid">
              <div className="panel panel-dossier">
                <div className="dossier-grid">
                  <div className="metric">
                    <span>Compartment</span>
                    <strong>{selectedCompartment.compartment_name}</strong>
                  </div>
                  <div className="metric">
                    <span>Compartment ID</span>
                    <strong>{selectedCompartment.compartment_id}</strong>
                  </div>
                  <div className="metric">
                    <span>Designation</span>
                    <strong>{selectedCompartment.compartment_designation || 'Not Assigned'}</strong>
                  </div>
                  <div className="metric">
                    <span>Replicators</span>
                    <strong>{selectedCompartment.replicators.length}</strong>
                  </div>
                  <div className="metric">
                    <span>Transporters</span>
                    <strong>{selectedCompartment.transporters.length}</strong>
                  </div>
                  <div className="metric">
                    <span>System Scope</span>
                    <strong>Infrastructure</strong>
                  </div>
                  <div className="metric">
                    <span>Holodecks</span>
                    <strong>{selectedCompartment.holodecks.length}</strong>
                  </div>
                </div>

                <div className="profile-note">
                  <span className="eyebrow">Compartment Notes</span>
                  <p>This view tracks what is installed in the space itself. Usage history belongs to the Replicator and Transporter workspaces.</p>
                </div>
              </div>

              <div className="panel panel-detail">
                <div className="detail-pane">
                  <div className="panel-subheader">
                    <span className="eyebrow">Installed Replicators</span>
                    <strong>{selectedCompartment.replicators.length} units</strong>
                  </div>
                  <div className="timeline">
                    {selectedCompartment.replicators.length ? (
                      selectedCompartment.replicators.map((unit) => (
                        <article key={unit.unit_id} className="timeline-entry">
                          <div className="timeline-badge">REP</div>
                          <div>
                            <strong>{unit.unit_id}</strong>
                            <p>Type: {unit.unit_type || 'Unknown'}</p>
                            <p>Access Level: {unit.access_level || 'Not specified'}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">No replicator units are currently cataloged in this compartment.</div>
                    )}
                  </div>

                  <div className="panel-subheader systems-subheader">
                    <span className="eyebrow">Installed Transporters</span>
                    <strong>{selectedCompartment.transporters.length} units</strong>
                  </div>
                  <div className="timeline">
                    {selectedCompartment.transporters.length ? (
                      selectedCompartment.transporters.map((unit) => (
                        <article key={unit.unit_id} className="timeline-entry">
                          <div className="timeline-badge">TRN</div>
                          <div>
                            <strong>{unit.unit_id}</strong>
                            <p>Transporter pad assigned to this compartment.</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">No transporter units are currently cataloged in this compartment.</div>
                    )}
                  </div>

                  <div className="panel-subheader systems-subheader">
                    <span className="eyebrow">Holodeck Bays</span>
                    <strong>{selectedCompartment.holodecks.length} bays</strong>
                  </div>
                  <div className="timeline">
                    {selectedCompartment.holodecks.length ? (
                      selectedCompartment.holodecks.map((bay) => (
                        <article key={bay.holodeck_id} className="timeline-entry">
                          <div className="timeline-badge">HLD</div>
                          <div>
                            <strong>{bay.holodeck_id}</strong>
                            <p>Designation: {bay.holodeck_designation || 'Standard Holodeck'}</p>
                            <p>Access Level: {bay.access_level || 'Not specified'} | Programs: {bay.program_count}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">No holodeck bays are currently cataloged in this compartment.</div>
                    )}
                  </div>

                  <div className="panel-subheader systems-subheader">
                    <span className="eyebrow">Holodeck Programs</span>
                    <strong>{selectedCompartment.holodeck_programs.length} programs</strong>
                  </div>
                  <div className="timeline">
                    {selectedCompartment.holodeck_programs.length ? (
                      selectedCompartment.holodeck_programs.map((program) => (
                        <article key={program.program_id} className="timeline-entry">
                          <div className="timeline-badge">PRG</div>
                          <div>
                            <strong>{program.program_name}</strong>
                            <p>{program.holodeck_id} | Genre: {program.genre || 'Unspecified'}</p>
                            <p>Created By: {program.created_by || 'Unknown'} | Access Level: {program.access_level || 'Not specified'}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">No holodeck programs are currently cataloged in this compartment.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
