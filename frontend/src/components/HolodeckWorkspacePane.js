import { useState } from 'react';
import HolodeckConsole from './HolodeckConsole';
import HolodeckWorkspace from './HolodeckWorkspace';
import { useHolodeckWorkspace } from '../hooks/useHolodeckWorkspace';
import {
  CREW_PAGE_SIZE,
  initialHolodeckLogForm,
  initialHolodeckProgramForm,
} from '../lib/constants';
import {
  applyEpisodeSelection,
  findSeasonGuide,
  resetEpisodeFields,
  updateNamedValue,
} from '../lib/episodeForms';

function HolodeckWorkspacePane({
  activeWorkspace,
  apiFetch,
  currentUser,
  dossierRef,
  replicatorCrewOptions,
  setError,
  setSuccessMessage,
}) {
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
    setSelectedHolodeckLog,
    setSelectedHolodeckLogId,
    setHolodeckLogs,
  });

  function handleHolodeckLogChange(event) {
    updateNamedValue(setHolodeckLogForm, event);
  }

  function handleHolodeckSeasonChange(event) {
    resetEpisodeFields(setHolodeckLogForm, event.target.value, ['stardate']);
  }

  const selectedHolodeckSeasonGuide = findSeasonGuide(holodeckLogForm.episode_season);

  function handleHolodeckEpisodeChange(event) {
    applyEpisodeSelection(setHolodeckLogForm, selectedHolodeckSeasonGuide, event.target.value, {
      stardateField: 'stardate',
    });
  }

  function handleHolodeckProgramChange(event) {
    updateNamedValue(setHolodeckProgramForm, event);
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

  const selectedHolodeckCrew = replicatorCrewOptions.find(
    (member) => String(member.crew_id) === String(holodeckLogForm.crew_id)
  );
  const selectedHolodeckUnit = holodeckUnits.find(
    (unit) => unit.holodeck_id === holodeckLogForm.holodeck_id
  );
  const selectedHolodeckProgram = holodeckPrograms.find(
    (program) => String(program.program_id) === String(holodeckLogForm.program_id)
  );
  const totalHolodeckPages = Math.max(1, Math.ceil(holodeckLogs.length / CREW_PAGE_SIZE));
  const safeHolodeckPage = Math.min(holodeckPage, totalHolodeckPages);
  const pagedHolodeckLogs = holodeckLogs.slice(
    (safeHolodeckPage - 1) * CREW_PAGE_SIZE,
    safeHolodeckPage * CREW_PAGE_SIZE
  );

  return (
    <>
      <HolodeckWorkspace
        holodeckLogs={holodeckLogs}
        holodeckSearch={holodeckSearch}
        loadingHolodeck={loadingHolodeck}
        openHolodeckConsole={openHolodeckConsole}
        pagedHolodeckLogs={pagedHolodeckLogs}
        safeHolodeckPage={safeHolodeckPage}
        selectedHolodeckLogId={selectedHolodeckLogId}
        setHolodeckPage={setHolodeckPage}
        setHolodeckSearch={setHolodeckSearch}
        showHolodeckConsole={showHolodeckConsole}
        totalHolodeckPages={totalHolodeckPages}
      />
      {(activeWorkspace === 'holodeck' || showHolodeckConsole) ? (
        <HolodeckConsole
          activeWorkspace={activeWorkspace}
          closeHolodeckConsole={closeHolodeckConsole}
          dossierRef={dossierRef}
          handleHolodeckEpisodeChange={handleHolodeckEpisodeChange}
          handleHolodeckLogChange={handleHolodeckLogChange}
          handleHolodeckLogSubmit={handleHolodeckLogSubmit}
          handleHolodeckProgramChange={handleHolodeckProgramChange}
          handleHolodeckProgramSubmit={handleHolodeckProgramSubmit}
          handleHolodeckSeasonChange={handleHolodeckSeasonChange}
          holodeckLogForm={holodeckLogForm}
          holodeckProgramForm={holodeckProgramForm}
          holodeckPrograms={holodeckPrograms}
          holodeckTab={holodeckTab}
          holodeckUnits={holodeckUnits}
          replicatorCrewOptions={replicatorCrewOptions}
          selectedHolodeckCrew={selectedHolodeckCrew}
          selectedHolodeckLog={selectedHolodeckLog}
          selectedHolodeckProgram={selectedHolodeckProgram}
          selectedHolodeckSeasonGuide={selectedHolodeckSeasonGuide}
          selectedHolodeckUnit={selectedHolodeckUnit}
          setHolodeckTab={setHolodeckTab}
          showHolodeckConsole={showHolodeckConsole}
          submittingHolodeck={submittingHolodeck}
          submittingHolodeckProgram={submittingHolodeckProgram}
        />
      ) : null}
    </>
  );
}

export default HolodeckWorkspacePane;
