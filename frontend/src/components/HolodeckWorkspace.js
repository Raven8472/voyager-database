import { formatRecordName } from '../lib/formatters';

function HolodeckWorkspace({
  holodeckLogs,
  holodeckSearch,
  loadingHolodeck,
  openHolodeckConsole,
  pagedHolodeckLogs,
  safeHolodeckPage,
  selectedHolodeckLogId,
  setHolodeckPage,
  setHolodeckSearch,
  showHolodeckConsole,
  totalHolodeckPages,
}) {
  const rotatingProgramCount = new Set(holodeckLogs.map((log) => log.program_id)).size;

  return (
    <>
      <section className="control-row medical-control-row">
        <label className="control control-wide">
          <span>Search Holodeck Activity</span>
          <input
            type="text"
            value={holodeckSearch}
            onChange={(event) => setHolodeckSearch(event.target.value)}
            placeholder="Paris, Captain Proton, Holodeck 2..."
          />
        </label>
        <div className="panel inline-panel">
          <span className="eyebrow">Usage Summary</span>
          <strong>{loadingHolodeck ? 'Loading...' : `${holodeckLogs.length} usage events`}</strong>
        </div>
        <div className="panel inline-panel">
          <span className="eyebrow">Program Watch</span>
          <strong>{loadingHolodeck ? 'Loading...' : `${rotatingProgramCount} programs in rotation`}</strong>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel panel-list panel-list-only">
          <div className="panel-header">
            <span className="eyebrow">Holodeck Log</span>
            <div className="panel-header-actions">
              <strong>{loadingHolodeck ? 'Loading...' : `Page ${safeHolodeckPage} of ${totalHolodeckPages} | ${holodeckLogs.length} events`}</strong>
              <button className="page-button" type="button" onClick={() => openHolodeckConsole('newlog')}>
                New Holodeck Log
              </button>
            </div>
          </div>

          <div className="crew-list">
            {pagedHolodeckLogs.map((log) => (
              <button
                key={log.log_id}
                type="button"
                className={`crew-card ${selectedHolodeckLogId === log.log_id ? 'selected' : ''}`}
                onClick={() => openHolodeckConsole('detail', log.log_id)}
              >
                <span className="crew-name">{log.program_name || log.program_id}</span>
                <span>{formatRecordName(log)}</span>
                <span>{log.holodeck_designation || log.holodeck_id}</span>
                <span>{log.stardate} | Creator: {log.created_by || 'Unknown'}</span>
              </button>
            ))}
            {!loadingHolodeck && !holodeckLogs.length ? (
              <div className="empty-state">No holodeck activity matches the current search. Open the holodeck console to file the first session or add a fresh program.</div>
            ) : null}
          </div>

          {totalHolodeckPages > 1 ? (
            <div className="pagination-bar">
              <button type="button" className="page-button" onClick={() => setHolodeckPage((page) => Math.max(1, page - 1))} disabled={safeHolodeckPage === 1}>Previous Page</button>
              <div className="page-indicator">
                <span className="eyebrow">Holodeck Pagination</span>
                <strong>{safeHolodeckPage} / {totalHolodeckPages}</strong>
              </div>
              <button type="button" className="page-button" onClick={() => setHolodeckPage((page) => Math.min(totalHolodeckPages, page + 1))} disabled={safeHolodeckPage === totalHolodeckPages}>Next Page</button>
            </div>
          ) : null}
        </div>
      </section>

      {!showHolodeckConsole ? (
        <section className="panel recent-panel">
          <div className="panel-header">
            <span className="eyebrow">Holodeck Status</span>
            <strong>Open The Console To Track Program Use</strong>
          </div>
          <div className="empty-state">
            Holodeck runs live here as crew activity. Open the console to add a new session, expand the program library, and confirm who keeps vanishing into the holonovel queue.
          </div>
        </section>
      ) : null}
    </>
  );
}

export default HolodeckWorkspace;
