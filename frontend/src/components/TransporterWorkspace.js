import { formatTransporterControlLocationName } from '../lib/formatters';

function TransporterWorkspace({
  loadingTransporter,
  openTransporterConsole,
  pagedTransporterLogs,
  safeTransporterPage,
  selectedTransporterEventId,
  setTransporterPage,
  setTransporterSearch,
  showTransporterConsole,
  totalTransporterPages,
  transporterLocations,
  transporterLogs,
  transporterSearch,
  transporterUnits,
}) {
  return (
    <>
      <section className="control-row medical-control-row">
        <label className="control control-wide">
          <span>Search Transport Activity</span>
          <input
            type="text"
            value={transporterSearch}
            onChange={(event) => setTransporterSearch(event.target.value)}
            placeholder="Bridge, Tuvok, Deck 1, Surface..."
          />
        </label>
        <div className="panel inline-panel">
          <span className="eyebrow">Transport Summary</span>
          <strong>{loadingTransporter ? 'Loading...' : `${transporterLogs.length} transport events`}</strong>
        </div>
        <div className="panel inline-panel">
          <span className="eyebrow">Pad Network</span>
          <strong>{transporterUnits.length} units | {transporterLocations.length} logged locations</strong>
          <span>{transporterUnits.map((unit) => unit.unit_id).join(' | ') || 'No units loaded'}</span>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel panel-list panel-list-only">
          <div className="panel-header">
            <span className="eyebrow">Transporter Record</span>
            <div className="panel-header-actions">
              <strong>{loadingTransporter ? 'Loading...' : `Page ${safeTransporterPage} of ${totalTransporterPages} | ${transporterLogs.length} events`}</strong>
              <button className="page-button" type="button" onClick={() => openTransporterConsole('newlog')}>
                New Transport Log
              </button>
            </div>
          </div>

          <div className="crew-list">
            {pagedTransporterLogs.map((transportEvent) => (
              <button
                key={transportEvent.event_id}
                type="button"
                className={`crew-card ${selectedTransporterEventId === transportEvent.event_id ? 'selected' : ''}`}
                onClick={() => openTransporterConsole('detail', transportEvent.event_id)}
              >
                <span className="crew-name">{transportEvent.transport_direction} | {transportEvent.passenger_count} travelers</span>
                <span>{transportEvent.transporter_unit_id} | {transportEvent.transporter_room || 'Unknown room'}</span>
                <span>{formatTransporterControlLocationName(transportEvent.ship_location_name) || 'Ship location pending'}</span>
                <span>Operator: {transportEvent.operator_display_name}</span>
              </button>
            ))}
            {!loadingTransporter && !transporterLogs.length ? (
              <div className="empty-state">No transporter events are on file yet. Open the console to log a bridge transfer or transporter-room operation.</div>
            ) : null}
          </div>

          {totalTransporterPages > 1 ? (
            <div className="pagination-bar">
              <button type="button" className="page-button" onClick={() => setTransporterPage((page) => Math.max(1, page - 1))} disabled={safeTransporterPage === 1}>Previous Page</button>
              <div className="page-indicator">
                <span className="eyebrow">Transport Pagination</span>
                <strong>{safeTransporterPage} / {totalTransporterPages}</strong>
              </div>
              <button type="button" className="page-button" onClick={() => setTransporterPage((page) => Math.min(totalTransporterPages, page + 1))} disabled={safeTransporterPage === totalTransporterPages}>Next Page</button>
            </div>
          ) : null}
        </div>
      </section>

      {!showTransporterConsole ? (
        <section className="panel recent-panel">
          <div className="panel-header">
            <span className="eyebrow">Transport Status</span>
            <strong>Open The Console To Record Transport Events</strong>
          </div>
          <div className="empty-state">
            Transporter records track shipboard transporter operations only. Use Bridge or transporter rooms as the logged Voyager-side location. Shuttle transports stay out of the mothership record.
          </div>
        </section>
      ) : null}
    </>
  );
}

export default TransporterWorkspace;
