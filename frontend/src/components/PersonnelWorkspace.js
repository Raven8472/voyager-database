import { formatRecordName } from '../lib/formatters';

function PersonnelWorkspace({
  crew,
  departments,
  designation,
  departmentFilter,
  loadingCrew,
  pagedCrew,
  safeCrewPage,
  search,
  selectedCrew,
  selectedCrewId,
  setCrewPage,
  setDepartmentFilter,
  setDesignation,
  setSearch,
  setSelectedCrewId,
  setShowCrewCreate,
  totalCrewPages,
}) {
  return (
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
  );
}

export default PersonnelWorkspace;
