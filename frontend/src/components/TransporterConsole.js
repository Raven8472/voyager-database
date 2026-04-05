import { VOYAGER_EPISODE_GUIDE } from '../lib/constants';
import { formatRecordName, formatTransporterControlLocationName } from '../lib/formatters';

function TransporterConsole({
  activeWorkspace,
  closeTransporterConsole,
  dossierRef,
  handleTransporterChange,
  handleTransporterEpisodeChange,
  handleTransporterLogSubmit,
  handleTransporterPassengerChange,
  handleTransporterSeasonChange,
  replicatorCrewOptions,
  selectedTransporterEvent,
  selectedTransporterLocation,
  selectedTransporterOperator,
  selectedTransporterPassengers,
  selectedTransporterSeasonGuide,
  selectedTransporterUnit,
  setTransporterLogForm,
  setTransporterTab,
  showTransporterConsole,
  submittingTransporter,
  transporterLocations,
  transporterLogForm,
  transporterTab,
  transporterUnits,
}) {
  if (!showTransporterConsole || activeWorkspace !== 'transporter') {
    return null;
  }

  return (
    <div className="dossier-overlay" onClick={closeTransporterConsole}>
      <div
        ref={dossierRef}
        className="dossier-window"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="window-toolbar">
          <div>
            <span className="eyebrow">Transporter Console</span>
            <strong>
              {selectedTransporterEvent
                ? `${selectedTransporterEvent.transport_direction} | ${selectedTransporterEvent.passenger_count} travelers`
                : 'New Transport Event'}
            </strong>
          </div>
          <button className="window-close" type="button" onClick={closeTransporterConsole}>
            Close Console
          </button>
        </div>

        <div className="window-grid">
          <div className="panel panel-dossier">
            <div className="dossier-grid">
              <div className="metric">
                <span>Transport Unit</span>
                <strong>{selectedTransporterEvent?.transporter_unit_id || selectedTransporterUnit?.unit_id || 'Not selected'}</strong>
              </div>
              <div className="metric">
                <span>Transport Room</span>
                <strong>{selectedTransporterEvent?.transporter_room || selectedTransporterUnit?.compartment_name || 'Not selected'}</strong>
              </div>
              <div className="metric">
                <span>Direction</span>
                <strong>{selectedTransporterEvent?.transport_direction || transporterLogForm.transport_direction}</strong>
              </div>
              <div className="metric">
                <span>Transporter Control Location</span>
                <strong>{formatTransporterControlLocationName(selectedTransporterEvent?.ship_location_name || selectedTransporterLocation?.compartment_name) || 'Not selected'}</strong>
              </div>
              <div className="metric">
                <span>Operator</span>
                <strong>{selectedTransporterEvent?.operator_display_name || (selectedTransporterOperator ? formatRecordName(selectedTransporterOperator) : 'Not selected')}</strong>
              </div>
              <div className="metric">
                <span>Passengers</span>
                <strong>{selectedTransporterEvent?.passenger_count || selectedTransporterPassengers.length}</strong>
              </div>
            </div>

            <div className="profile-note">
              <span className="eyebrow">Console Guidance</span>
              <p>Log only Voyager transporter activity. Record the assigned pad separately from the control position, and keep shuttle transporter use out of these records.</p>
            </div>
          </div>

          <div className="panel panel-detail">
            <div className="detail-tabs">
              <button type="button" className={`detail-tab ${transporterTab === 'detail' ? 'active' : ''}`} onClick={() => setTransporterTab('detail')}>Event Detail</button>
              <button type="button" className={`detail-tab ${transporterTab === 'newlog' ? 'active' : ''}`} onClick={() => setTransporterTab('newlog')}>New Log</button>
            </div>

            {transporterTab === 'detail' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Transport Event</span>
                  <strong>{selectedTransporterEvent ? 'Event Loaded' : 'No Event Selected'}</strong>
                </div>

                {selectedTransporterEvent ? (
                  <div className="timeline">
                    <article className="timeline-entry">
                      <div className="timeline-badge">TRN</div>
                      <div>
                        <strong>{selectedTransporterEvent.transport_direction} | Stardate {selectedTransporterEvent.stardate}</strong>
                        <p>Unit: {selectedTransporterEvent.transporter_unit_id} | Room: {selectedTransporterEvent.transporter_room || 'Unknown'}</p>
                        <p>Operator: {selectedTransporterEvent.operator_display_name}</p>
                        <p>Control Location: {formatTransporterControlLocationName(selectedTransporterEvent.ship_location_name) || 'Not logged'}</p>
                        <p>Target Location: {selectedTransporterEvent.off_ship_location || 'Not logged'}</p>
                      </div>
                    </article>

                    <div className="panel-subheader systems-subheader">
                      <span className="eyebrow">Passenger Roster</span>
                      <strong>{selectedTransporterEvent.passengers.length} travelers</strong>
                    </div>
                    {selectedTransporterEvent.passengers.length ? (
                      selectedTransporterEvent.passengers.map((passenger) => (
                        <article key={`${selectedTransporterEvent.event_id}-${passenger.crew_id}-${passenger.passenger_order}`} className="timeline-entry">
                          <div className="timeline-badge">PAD</div>
                          <div>
                            <strong>{passenger.display_name}</strong>
                            <p>Pad Position {passenger.passenger_order}</p>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">No passengers were resolved for this event.</div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">Select an event from the transporter log, or open the New Log tab to record a fresh transport.</div>
                )}
              </div>
            ) : null}

            {transporterTab === 'newlog' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">New Transport Log</span>
                  <strong>Record Pad Operation</strong>
                </div>

                <form className="action-form" onSubmit={handleTransporterLogSubmit}>
                  <div className="action-grid">
                    <div className="control">
                      <span>Transporter Unit</span>
                      {transporterUnits.length ? (
                        <div className="choice-grid">
                          {transporterUnits.map((unit) => (
                            <button
                              key={unit.unit_id}
                              type="button"
                              className={`choice-card ${transporterLogForm.transporter_unit_id === unit.unit_id ? 'selected' : ''}`}
                              onClick={() => setTransporterLogForm((current) => ({ ...current, transporter_unit_id: unit.unit_id }))}
                            >
                              <strong>{unit.unit_id}</strong>
                              <span>{unit.compartment_name}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">No transporter units are loaded into the console yet. Refresh the station link and reopen the log if this remains empty.</div>
                      )}
                    </div>

                    <label className="control">
                      <span>Transporter Operator</span>
                      <select name="operator_crew_id" value={transporterLogForm.operator_crew_id} onChange={handleTransporterChange}>
                        <option value="">Unspecified</option>
                        {replicatorCrewOptions.map((member) => (
                          <option key={member.crew_id} value={member.crew_id}>
                            {formatRecordName(member)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Stardate</span>
                      <input name="stardate" value={transporterLogForm.stardate} onChange={handleTransporterChange} placeholder="48315.6" required />
                    </label>

                    <label className="control">
                      <span>Direction</span>
                      <select name="transport_direction" value={transporterLogForm.transport_direction} onChange={handleTransporterChange}>
                        <option value="Outbound">Outbound</option>
                        <option value="Inbound">Inbound</option>
                      </select>
                    </label>

                    <label className="control">
                      <span>Season</span>
                      <select name="episode_season" value={transporterLogForm.episode_season} onChange={handleTransporterSeasonChange}>
                        <option value="">Manual Stardate Entry</option>
                        {VOYAGER_EPISODE_GUIDE.map((entry) => (
                          <option key={`transporter-${entry.season}`} value={entry.season}>
                            {entry.season}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Episode</span>
                      <select
                        name="episode_title"
                        value={transporterLogForm.episode_title}
                        onChange={handleTransporterEpisodeChange}
                        disabled={!transporterLogForm.episode_season}
                      >
                        <option value="">{transporterLogForm.episode_season ? 'Select Episode' : 'Choose Season First'}</option>
                        {(selectedTransporterSeasonGuide?.episodes || []).map(([title]) => (
                          <option key={`transporter-episode-${title}`} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="control">
                      <span>Transporter Control Location</span>
                      {transporterLocations.length ? (
                        <div className="choice-grid">
                          {transporterLocations.map((location) => (
                            <button
                              key={location.compartment_id}
                              type="button"
                              className={`choice-card ${transporterLogForm.ship_location_id === location.compartment_id ? 'selected' : ''}`}
                              onClick={() => setTransporterLogForm((current) => ({ ...current, ship_location_id: location.compartment_id }))}
                            >
                              <strong>{formatTransporterControlLocationName(location.compartment_name)}</strong>
                              <span>{location.compartment_id}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">No Bridge, Engineering, or transporter room control locations are loaded into the console yet.</div>
                      )}
                    </div>

                    <label className="control">
                      <span>Target Location</span>
                      <input name="off_ship_location" value={transporterLogForm.off_ship_location} onChange={handleTransporterChange} placeholder="Planet surface, station habitat ring..." />
                    </label>
                  </div>

                  <div className="panel-subheader systems-subheader">
                    <span className="eyebrow">Passenger Roster</span>
                    <strong>Up To 10 Crew Members</strong>
                  </div>

                  <div className="action-grid transporter-passenger-grid">
                    {transporterLogForm.passenger_crew_ids.map((crewId, index) => (
                      <label key={`transporter-passenger-${index + 1}`} className="control">
                        <span>Passenger {index + 1}</span>
                        <select value={crewId} onChange={(event) => handleTransporterPassengerChange(index, event.target.value)}>
                          <option value="">Empty Pad</option>
                          {replicatorCrewOptions.map((member) => (
                            <option key={member.crew_id} value={member.crew_id}>
                              {formatRecordName(member)}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>

                  <div className="action-preview">
                    <span className="eyebrow">Preview</span>
                    <p>
                      {selectedTransporterUnit?.unit_id || 'Unit pending'} |{' '}
                      {selectedTransporterLocation?.compartment_name || 'Location pending'} |{' '}
                      {transporterLogForm.transport_direction} |{' '}
                      {selectedTransporterPassengers.length} travelers
                    </p>
                  </div>

                  <button className="submit-button" type="submit" disabled={submittingTransporter}>
                    {submittingTransporter ? 'Logging Transport...' : 'Log Transport Event'}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransporterConsole;
