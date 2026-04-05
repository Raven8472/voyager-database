function SystemsWorkspace({
  loadingSystems,
  pagedCompartments,
  safeSystemsPage,
  selectedCompartment,
  selectedCompartmentId,
  setSelectedCompartmentId,
  setSystemsPage,
  setSystemsSearch,
  systemsCompartments,
  systemsSearch,
  totalSystemsPages,
}) {
  const trackedUnits = systemsCompartments.reduce(
    (sum, compartment) =>
      sum +
      Number(compartment.replicator_count || 0) +
      Number(compartment.transporter_count || 0) +
      Number(compartment.holodeck_count || 0),
    0
  );

  return (
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
          <strong>{trackedUnits} tracked units</strong>
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
  );
}

export default SystemsWorkspace;
