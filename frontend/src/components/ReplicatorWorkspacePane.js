import { useState } from 'react';
import ReplicatorConsole from './ReplicatorConsole';
import ReplicatorWorkspace from './ReplicatorWorkspace';
import { useReplicatorWorkspace } from '../hooks/useReplicatorWorkspace';
import {
  CREW_PAGE_SIZE,
  initialReplicatorLogForm,
  initialReplicatorPatternForm,
} from '../lib/constants';
import {
  applyEpisodeSelection,
  findSeasonGuide,
  resetEpisodeFields,
  updateNamedValue,
} from '../lib/episodeForms';

function ReplicatorWorkspacePane({
  activeWorkspace,
  apiFetch,
  currentUser,
  dossierRef,
  replicatorCrewOptions,
  setError,
  setSuccessMessage,
}) {
  const [replicatorLogs, setReplicatorLogs] = useState([]);
  const [replicatorPatterns, setReplicatorPatterns] = useState([]);
  const [replicatorUnits, setReplicatorUnits] = useState([]);
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

  const { refreshReplicatorWorkspace } = useReplicatorWorkspace({
    apiFetch,
    currentUser,
    replicatorLogs,
    replicatorSearch,
    selectedReplicatorLogId,
    setError,
    setLoadingReplicator,
    setReplicatorLogs,
    setReplicatorPage,
    setReplicatorPatternPage,
    setReplicatorPatterns,
    setReplicatorUnits,
    setSelectedReplicatorLog,
    setSelectedReplicatorLogId,
  });

  function handleReplicatorLogChange(event) {
    updateNamedValue(setReplicatorLogForm, event);
  }

  function handleReplicatorSeasonChange(event) {
    resetEpisodeFields(setReplicatorLogForm, event.target.value, ['timestamp']);
  }

  const selectedReplicatorSeasonGuide = findSeasonGuide(replicatorLogForm.episode_season);

  function handleReplicatorEpisodeChange(event) {
    applyEpisodeSelection(setReplicatorLogForm, selectedReplicatorSeasonGuide, event.target.value, {
      stardateField: 'timestamp',
    });
  }

  function handleReplicatorPatternChange(event) {
    updateNamedValue(setReplicatorPatternForm, event);
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

  const selectedReplicatorCrew = replicatorCrewOptions.find(
    (member) => String(member.crew_id) === String(replicatorLogForm.crew_id)
  );
  const selectedReplicatorUnit = replicatorUnits.find(
    (unit) => unit.unit_id === replicatorLogForm.replicator_unit_id
  );
  const selectedReplicatorPattern = replicatorPatterns.find(
    (pattern) => String(pattern.pattern_id) === String(replicatorLogForm.pattern_id)
  );
  const totalReplicatorPages = Math.max(1, Math.ceil(replicatorLogs.length / CREW_PAGE_SIZE));
  const safeReplicatorPage = Math.min(replicatorPage, totalReplicatorPages);
  const pagedReplicatorLogs = replicatorLogs.slice(
    (safeReplicatorPage - 1) * CREW_PAGE_SIZE,
    safeReplicatorPage * CREW_PAGE_SIZE
  );
  const totalReplicatorPatternPages = Math.max(1, Math.ceil(replicatorPatterns.length / CREW_PAGE_SIZE));
  const safeReplicatorPatternPage = Math.min(replicatorPatternPage, totalReplicatorPatternPages);
  const pagedReplicatorPatterns = replicatorPatterns.slice(
    (safeReplicatorPatternPage - 1) * CREW_PAGE_SIZE,
    safeReplicatorPatternPage * CREW_PAGE_SIZE
  );

  return (
    <>
      <ReplicatorWorkspace
        loadingReplicator={loadingReplicator}
        openReplicatorConsole={openReplicatorConsole}
        pagedReplicatorLogs={pagedReplicatorLogs}
        replicatorLogs={replicatorLogs}
        replicatorPatterns={replicatorPatterns}
        replicatorSearch={replicatorSearch}
        replicatorUnits={replicatorUnits}
        safeReplicatorPage={safeReplicatorPage}
        selectedReplicatorLogId={selectedReplicatorLogId}
        setReplicatorPage={setReplicatorPage}
        setReplicatorSearch={setReplicatorSearch}
        totalReplicatorPages={totalReplicatorPages}
      />
      {(activeWorkspace === 'replicator' || showReplicatorConsole) ? (
        <ReplicatorConsole
          activeWorkspace={activeWorkspace}
          closeReplicatorConsole={closeReplicatorConsole}
          dossierRef={dossierRef}
          handleReplicatorEpisodeChange={handleReplicatorEpisodeChange}
          handleReplicatorLogChange={handleReplicatorLogChange}
          handleReplicatorLogSubmit={handleReplicatorLogSubmit}
          handleReplicatorPatternChange={handleReplicatorPatternChange}
          handleReplicatorPatternSubmit={handleReplicatorPatternSubmit}
          handleReplicatorSeasonChange={handleReplicatorSeasonChange}
          pagedReplicatorPatterns={pagedReplicatorPatterns}
          replicatorCrewOptions={replicatorCrewOptions}
          replicatorLogForm={replicatorLogForm}
          replicatorPatternForm={replicatorPatternForm}
          replicatorPatterns={replicatorPatterns}
          replicatorTab={replicatorTab}
          replicatorUnits={replicatorUnits}
          selectedReplicatorCrew={selectedReplicatorCrew}
          selectedReplicatorLog={selectedReplicatorLog}
          selectedReplicatorPattern={selectedReplicatorPattern}
          selectedReplicatorSeasonGuide={selectedReplicatorSeasonGuide}
          selectedReplicatorUnit={selectedReplicatorUnit}
          setReplicatorPatternPage={setReplicatorPatternPage}
          setReplicatorTab={setReplicatorTab}
          setReplicatorLogForm={setReplicatorLogForm}
          showReplicatorConsole={showReplicatorConsole}
          submittingReplicator={submittingReplicator}
          submittingReplicatorPattern={submittingReplicatorPattern}
          safeReplicatorPatternPage={safeReplicatorPatternPage}
          totalReplicatorPatternPages={totalReplicatorPatternPages}
        />
      ) : null}
    </>
  );
}

export default ReplicatorWorkspacePane;
