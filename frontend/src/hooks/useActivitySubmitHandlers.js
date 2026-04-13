export function useActivitySubmitHandlers({
  apiFetch,
  setError,
  setSuccessMessage,
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
}) {
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

  return {
    handleHolodeckLogSubmit,
    handleHolodeckProgramSubmit,
    handleReplicatorLogSubmit,
    handleReplicatorPatternSubmit,
    handleTransporterLogSubmit,
  };
}
