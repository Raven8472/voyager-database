function MedicalWorkspace({
  loadingMedicalCharts,
  medicalCharts,
  medicalSearch,
  pagedMedicalCharts,
  safeMedicalPage,
  selectedMedicalChart,
  selectedMedicalCrewId,
  setMedicalPage,
  setMedicalSearch,
  setSelectedMedicalCrewId,
  totalMedicalPages,
}) {
  const profileCount = medicalCharts.filter((chart) => chart.profile_exists).length;

  return (
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
          <strong>{profileCount} profiles on file</strong>
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
  );
}

export default MedicalWorkspace;
