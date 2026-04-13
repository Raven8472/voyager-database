export function usePersonnelMedicalSubmitHandlers({
  apiFetch,
  crewCreateForm,
  formState,
  handleSetError,
  handleSetSuccess,
  initialCrewCreateForm,
  initialFormState,
  selectedCrew,
  setCrew,
  setCrewCreateForm,
  setFormState,
  setHealth,
  setRecentActions,
  setReplicatorCrewOptions,
  setSelectedCrew,
  setSelectedCrewId,
  setShowCrewCreate,
  setSubmitting,
  setSubmittingCrewCreate,
}) {
  async function refreshAfterAction(crewId) {
    const [detail, actionData, healthData, crewData] = await Promise.all([
      apiFetch(`/crew/${crewId}`),
      apiFetch('/personnel-actions/recent'),
      apiFetch('/health'),
      apiFetch('/crew'),
    ]);

    setSelectedCrew(detail);
    setRecentActions(actionData);
    setHealth(healthData);
    setCrew(crewData);
    setReplicatorCrewOptions(crewData);
    return detail;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedCrew) {
      return;
    }

    setSubmitting(true);
    handleSetError('');
    handleSetSuccess('');

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
      handleSetSuccess('Personnel action logged to the current dossier.');
    } catch (submitError) {
      handleSetError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCrewCreateSubmit(event) {
    event.preventDefault();
    setSubmittingCrewCreate(true);
    handleSetError('');
    handleSetSuccess('');

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
      handleSetSuccess('New crew record created.');
    } catch (submitError) {
      handleSetError(submitError.message);
    } finally {
      setSubmittingCrewCreate(false);
    }
  }

  return {
    handleCrewCreateSubmit,
    handleSubmit,
  };
}
