import { useState } from 'react';
import TransporterConsole from './TransporterConsole';
import TransporterWorkspace from './TransporterWorkspace';
import { useTransporterWorkspace } from '../hooks/useTransporterWorkspace';
import { CREW_PAGE_SIZE, initialTransporterLogForm } from '../lib/constants';
import {
  applyEpisodeSelection,
  findSeasonGuide,
  resetEpisodeFields,
  updateNamedValue,
} from '../lib/episodeForms';

function TransporterWorkspacePane({
  activeWorkspace,
  apiFetch,
  currentUser,
  dossierRef,
  replicatorCrewOptions,
  setError,
  setSuccessMessage,
}) {
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

  const { refreshTransporterWorkspace } = useTransporterWorkspace({
    apiFetch,
    currentUser,
    selectedTransporterEventId,
    setError,
    setLoadingTransporter,
    setSelectedTransporterEvent,
    setSelectedTransporterEventId,
    setTransporterLocations,
    setTransporterLogs,
    setTransporterPage,
    setTransporterUnits,
    transporterLogs,
    transporterSearch,
  });

  function handleTransporterChange(event) {
    updateNamedValue(setTransporterLogForm, event);
  }

  function handleTransporterSeasonChange(event) {
    resetEpisodeFields(setTransporterLogForm, event.target.value, ['stardate']);
  }

  const selectedTransporterSeasonGuide = findSeasonGuide(transporterLogForm.episode_season);

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
  const totalTransporterPages = Math.max(1, Math.ceil(transporterLogs.length / CREW_PAGE_SIZE));
  const safeTransporterPage = Math.min(transporterPage, totalTransporterPages);
  const pagedTransporterLogs = transporterLogs.slice(
    (safeTransporterPage - 1) * CREW_PAGE_SIZE,
    safeTransporterPage * CREW_PAGE_SIZE
  );

  return (
    <>
      <TransporterWorkspace
        loadingTransporter={loadingTransporter}
        openTransporterConsole={openTransporterConsole}
        pagedTransporterLogs={pagedTransporterLogs}
        safeTransporterPage={safeTransporterPage}
        selectedTransporterEventId={selectedTransporterEventId}
        setTransporterPage={setTransporterPage}
        setTransporterSearch={setTransporterSearch}
        showTransporterConsole={showTransporterConsole}
        totalTransporterPages={totalTransporterPages}
        transporterLocations={transporterLocations}
        transporterLogs={transporterLogs}
        transporterSearch={transporterSearch}
        transporterUnits={transporterUnits}
      />
      {(activeWorkspace === 'transporter' || showTransporterConsole) ? (
        <TransporterConsole
          activeWorkspace={activeWorkspace}
          closeTransporterConsole={closeTransporterConsole}
          dossierRef={dossierRef}
          handleTransporterChange={handleTransporterChange}
          handleTransporterEpisodeChange={handleTransporterEpisodeChange}
          handleTransporterLogSubmit={handleTransporterLogSubmit}
          handleTransporterPassengerChange={handleTransporterPassengerChange}
          handleTransporterSeasonChange={handleTransporterSeasonChange}
          replicatorCrewOptions={replicatorCrewOptions}
          selectedTransporterEvent={selectedTransporterEvent}
          selectedTransporterLocation={selectedTransporterLocation}
          selectedTransporterOperator={selectedTransporterOperator}
          selectedTransporterPassengers={selectedTransporterPassengers}
          selectedTransporterSeasonGuide={selectedTransporterSeasonGuide}
          selectedTransporterUnit={selectedTransporterUnit}
          setTransporterLogForm={setTransporterLogForm}
          setTransporterTab={setTransporterTab}
          showTransporterConsole={showTransporterConsole}
          submittingTransporter={submittingTransporter}
          transporterLocations={transporterLocations}
          transporterLogForm={transporterLogForm}
          transporterTab={transporterTab}
          transporterUnits={transporterUnits}
        />
      ) : null}
    </>
  );
}

export default TransporterWorkspacePane;
