import { formatRecordName } from '../lib/formatters';

function ReplicatorWorkspace({
  loadingReplicator,
  openReplicatorConsole,
  pagedReplicatorLogs,
  replicatorLogs,
  replicatorPatterns,
  replicatorSearch,
  replicatorUnits,
  safeReplicatorPage,
  selectedReplicatorLogId,
  setReplicatorPage,
  setReplicatorSearch,
  totalReplicatorPages,
}) {
  return (
    <>
      <section className="control-row medical-control-row">
        <label className="control control-wide">
          <span>Search Replicator Activity</span>
          <input
            type="text"
            value={replicatorSearch}
            onChange={(event) => setReplicatorSearch(event.target.value)}
            placeholder="Coffee, Janeway, Galley, Unit 04..."
          />
        </label>
        <div className="panel inline-panel">
          <span className="eyebrow">Usage Summary</span>
          <strong>{loadingReplicator ? 'Loading...' : `${replicatorLogs.length} log events`}</strong>
        </div>
        <div className="panel inline-panel">
          <span className="eyebrow">Library Scope</span>
          <strong>{replicatorUnits.length} units | {replicatorPatterns.length} patterns</strong>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel panel-list panel-list-only">
          <div className="panel-header">
            <span className="eyebrow">Replicator Log</span>
            <div className="panel-header-actions">
              <strong>{loadingReplicator ? 'Loading...' : `Page ${safeReplicatorPage} of ${totalReplicatorPages} | ${replicatorLogs.length} events`}</strong>
              <button className="page-button" type="button" onClick={() => openReplicatorConsole('newlog')}>
                New Replicator Log
              </button>
            </div>
          </div>

          <div className="crew-list">
            {pagedReplicatorLogs.map((log) => (
              <button
                key={log.log_id}
                type="button"
                className={`crew-card ${selectedReplicatorLogId === log.log_id ? 'selected' : ''}`}
                onClick={() => openReplicatorConsole('detail', log.log_id)}
              >
                <span className="crew-name">{log.pattern_name || `Pattern ${log.pattern_id}`}</span>
                <span>{formatRecordName(log)}</span>
                <span>{log.replicator_unit_id} | {log.compartment_name || 'Compartment unknown'}</span>
                <span>{log.timestamp || 'Timestamp pending'}</span>
              </button>
            ))}
            {!loadingReplicator && !replicatorLogs.length ? (
              <div className="empty-state">No replicator events match the current search. Open the console to log the first request.</div>
            ) : null}
          </div>

          {totalReplicatorPages > 1 ? (
            <div className="pagination-bar">
              <button type="button" className="page-button" onClick={() => setReplicatorPage((page) => Math.max(1, page - 1))} disabled={safeReplicatorPage === 1}>Previous Page</button>
              <div className="page-indicator">
                <span className="eyebrow">Replicator Pagination</span>
                <strong>{safeReplicatorPage} / {totalReplicatorPages}</strong>
              </div>
              <button type="button" className="page-button" onClick={() => setReplicatorPage((page) => Math.min(totalReplicatorPages, page + 1))} disabled={safeReplicatorPage === totalReplicatorPages}>Next Page</button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

export default ReplicatorWorkspace;
