function CrewCreateWindow({
  activeWorkspace,
  crewCreateForm,
  departments,
  handleCrewCreateChange,
  handleCrewCreateSubmit,
  setShowCrewCreate,
  showCrewCreate,
  submittingCrewCreate,
}) {
  if (!showCrewCreate || activeWorkspace !== 'personnel') {
    return null;
  }

  return (
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
  );
}

export default CrewCreateWindow;
