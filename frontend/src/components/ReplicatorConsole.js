import { VOYAGER_EPISODE_GUIDE } from '../lib/constants';
import { formatRecordName } from '../lib/formatters';

function ReplicatorConsole({
  activeWorkspace,
  closeReplicatorConsole,
  dossierRef,
  handleReplicatorLogChange,
  handleReplicatorLogSubmit,
  handleReplicatorPatternChange,
  handleReplicatorPatternSubmit,
  handleReplicatorSeasonChange,
  handleReplicatorEpisodeChange,
  replicatorCrewOptions,
  replicatorLogForm,
  replicatorPatterns,
  replicatorPatternForm,
  replicatorTab,
  replicatorUnits,
  selectedReplicatorCrew,
  selectedReplicatorLog,
  selectedReplicatorPattern,
  selectedReplicatorSeasonGuide,
  selectedReplicatorUnit,
  setReplicatorPatternPage,
  setReplicatorTab,
  setReplicatorLogForm,
  showReplicatorConsole,
  submittingReplicator,
  submittingReplicatorPattern,
  pagedReplicatorPatterns,
  safeReplicatorPatternPage,
  totalReplicatorPatternPages,
}) {
  if (!showReplicatorConsole || activeWorkspace !== 'replicator') {
    return null;
  }

  return (
    <div className="dossier-overlay" onClick={closeReplicatorConsole}>
      <div
        ref={dossierRef}
        className="dossier-window"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="window-toolbar">
          <div>
            <span className="eyebrow">Replicator Console</span>
            <strong>
              {selectedReplicatorLog
                ? `${selectedReplicatorLog.pattern_name || `Pattern ${selectedReplicatorLog.pattern_id}`} | ${selectedReplicatorLog.replicator_unit_id}`
                : 'New Consumption Record'}
            </strong>
          </div>
          <button className="window-close" type="button" onClick={closeReplicatorConsole}>
            Close Console
          </button>
        </div>

        <div className="window-grid">
          <div className="panel panel-dossier">
            <div className="dossier-grid">
              <div className="metric">
                <span>Active Log</span>
                <strong>{selectedReplicatorLog ? selectedReplicatorLog.log_id : 'New Entry'}</strong>
              </div>
              <div className="metric">
                <span>Pattern</span>
                <strong>{selectedReplicatorLog?.pattern_name || selectedReplicatorPattern?.pattern_name || 'Not selected'}</strong>
              </div>
              <div className="metric">
                <span>Requested By</span>
                <strong>{selectedReplicatorLog ? formatRecordName(selectedReplicatorLog) : selectedReplicatorCrew ? formatRecordName(selectedReplicatorCrew) : 'No crew selected'}</strong>
              </div>
              <div className="metric">
                <span>Unit</span>
                <strong>{selectedReplicatorLog?.replicator_unit_id || selectedReplicatorUnit?.unit_id || 'Not selected'}</strong>
              </div>
              <div className="metric">
                <span>Compartment</span>
                <strong>{selectedReplicatorLog?.compartment_name || selectedReplicatorUnit?.compartment_name || 'Not recorded'}</strong>
              </div>
              <div className="metric">
                <span>Stardate</span>
                <strong>{selectedReplicatorLog?.timestamp || replicatorLogForm.timestamp || 'Pending'}</strong>
              </div>
            </div>

            <div className="profile-note">
              <span className="eyebrow">Console Guidance</span>
              <p>Ship Systems tracks where replicators are installed. This console tracks who requested what, from which unit, and when the event occurred.</p>
            </div>
          </div>

          <div className="panel panel-detail">
            <div className="detail-tabs">
              <button type="button" className={`detail-tab ${replicatorTab === 'detail' ? 'active' : ''}`} onClick={() => setReplicatorTab('detail')}>Log Detail</button>
              <button type="button" className={`detail-tab ${replicatorTab === 'newlog' ? 'active' : ''}`} onClick={() => setReplicatorTab('newlog')}>New Log</button>
              <button type="button" className={`detail-tab ${replicatorTab === 'patterns' ? 'active' : ''}`} onClick={() => setReplicatorTab('patterns')}>Pattern Library</button>
              <button type="button" className={`detail-tab ${replicatorTab === 'newpattern' ? 'active' : ''}`} onClick={() => setReplicatorTab('newpattern')}>New Pattern</button>
            </div>

            {replicatorTab === 'detail' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Selected Replicator Event</span>
                  <strong>{selectedReplicatorLog ? 'Usage Event Loaded' : 'No Log Selected'}</strong>
                </div>

                {selectedReplicatorLog ? (
                  <div className="timeline">
                    <article className="timeline-entry">
                      <div className="timeline-badge">REP</div>
                      <div>
                        <strong>{selectedReplicatorLog.pattern_name || `Pattern ${selectedReplicatorLog.pattern_id}`}</strong>
                        <p>Requested By: {formatRecordName(selectedReplicatorLog)}</p>
                        <p>Stardate: {selectedReplicatorLog.timestamp || 'Not recorded'}</p>
                        <p>Unit: {selectedReplicatorLog.replicator_unit_id} | Type: {selectedReplicatorLog.replicator_type || 'Unknown'}</p>
                        <p>Compartment: {selectedReplicatorLog.compartment_name || 'Unknown'} | Access Level: {selectedReplicatorLog.access_level || 'Not specified'}</p>
                        <p>Category: {selectedReplicatorLog.category || 'Unclassified'}</p>
                      </div>
                    </article>
                  </div>
                ) : (
                  <div className="empty-state">Select an entry from the replicator log, or open the New Log tab to file a fresh usage event.</div>
                )}
              </div>
            ) : null}

            {replicatorTab === 'newlog' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">New Replicator Event</span>
                  <strong>Record A Crew Request</strong>
                </div>

                <form className="action-form" onSubmit={handleReplicatorLogSubmit}>
                  <div className="action-grid">
                    <label className="control">
                      <span>Crew Member</span>
                      <select name="crew_id" value={replicatorLogForm.crew_id} onChange={handleReplicatorLogChange} required>
                        <option value="">Select Crew</option>
                        {replicatorCrewOptions.map((member) => (
                          <option key={`replicator-crew-${member.crew_id}`} value={member.crew_id}>
                            {formatRecordName(member)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Replicator Unit</span>
                      <select name="replicator_unit_id" value={replicatorLogForm.replicator_unit_id} onChange={handleReplicatorLogChange} required>
                        <option value="">Select Unit</option>
                        {replicatorUnits.map((unit) => (
                          <option key={`replicator-unit-${unit.unit_id}`} value={unit.unit_id}>
                            {unit.unit_id} | {unit.compartment_name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Pattern</span>
                      <select name="pattern_id" value={replicatorLogForm.pattern_id} onChange={handleReplicatorLogChange} required>
                        <option value="">Select Pattern</option>
                        {replicatorPatterns.map((pattern) => (
                          <option key={`replicator-pattern-${pattern.pattern_id}`} value={pattern.pattern_id}>
                            {pattern.pattern_name} | {pattern.category || 'Unclassified'}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Season</span>
                      <select name="episode_season" value={replicatorLogForm.episode_season} onChange={handleReplicatorSeasonChange}>
                        <option value="">Manual Stardate Entry</option>
                        {VOYAGER_EPISODE_GUIDE.map((entry) => (
                          <option key={`replicator-${entry.season}`} value={entry.season}>
                            {entry.season}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Episode</span>
                      <select
                        name="episode_title"
                        value={replicatorLogForm.episode_title}
                        onChange={handleReplicatorEpisodeChange}
                        disabled={!replicatorLogForm.episode_season}
                      >
                        <option value="">{replicatorLogForm.episode_season ? 'Select Episode' : 'Choose Season First'}</option>
                        {(selectedReplicatorSeasonGuide?.episodes || []).map(([title]) => (
                          <option key={`replicator-episode-${title}`} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Stardate</span>
                      <input name="timestamp" value={replicatorLogForm.timestamp} onChange={handleReplicatorLogChange} placeholder="48532.4" required />
                    </label>
                  </div>

                  <div className="action-preview">
                    <span className="eyebrow">Preview</span>
                    <p>
                      {selectedReplicatorCrew ? formatRecordName(selectedReplicatorCrew) : 'Crew pending'} |{' '}
                      {selectedReplicatorPattern?.pattern_name || 'Pattern pending'} |{' '}
                      {selectedReplicatorUnit?.unit_id || 'Unit pending'} |{' '}
                      {selectedReplicatorUnit?.compartment_name || 'Compartment pending'}
                    </p>
                  </div>

                  <button className="submit-button" type="submit" disabled={submittingReplicator}>
                    {submittingReplicator ? 'Logging Replication...' : 'Log Replicator Event'}
                  </button>
                </form>
              </div>
            ) : null}

            {replicatorTab === 'patterns' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Pattern Library</span>
                  <strong>{replicatorPatterns.length} patterns in scope</strong>
                </div>

                <div className="timeline">
                  {pagedReplicatorPatterns.length ? (
                    pagedReplicatorPatterns.map((pattern) => (
                      <article key={`library-${pattern.pattern_id}`} className="timeline-entry">
                        <div className="timeline-badge">PAT</div>
                        <div>
                          <strong>{pattern.pattern_name}</strong>
                          <p>Category: {pattern.category || 'Unclassified'} | Origin: {pattern.origin_species || 'Unknown'}</p>
                          <p>Energy Cost: {pattern.energy_cost ?? 'Not specified'} | Updated: {pattern.last_updated_stardate || 'Unknown'}</p>
                          <p>{pattern.description || 'No pattern description is currently on file.'}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">No replicator patterns match the current search.</div>
                  )}
                </div>

                {totalReplicatorPatternPages > 1 ? (
                  <div className="pagination-bar">
                    <button type="button" className="page-button" onClick={() => setReplicatorPatternPage((page) => Math.max(1, page - 1))} disabled={safeReplicatorPatternPage === 1}>Previous Page</button>
                    <div className="page-indicator">
                      <span className="eyebrow">Pattern Pagination</span>
                      <strong>{safeReplicatorPatternPage} / {totalReplicatorPatternPages}</strong>
                    </div>
                    <button type="button" className="page-button" onClick={() => setReplicatorPatternPage((page) => Math.min(totalReplicatorPatternPages, page + 1))} disabled={safeReplicatorPatternPage === totalReplicatorPatternPages}>Next Page</button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {replicatorTab === 'newpattern' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Pattern Authoring</span>
                  <strong>Add New Replicator Pattern</strong>
                </div>

                <form className="action-form" onSubmit={handleReplicatorPatternSubmit}>
                  <div className="action-grid">
                    <label className="control">
                      <span>Pattern Name</span>
                      <input name="pattern_name" value={replicatorPatternForm.pattern_name} onChange={handleReplicatorPatternChange} placeholder="Tomato soup, hot" required />
                    </label>

                    <label className="control">
                      <span>Category</span>
                      <input name="category" value={replicatorPatternForm.category} onChange={handleReplicatorPatternChange} placeholder="Beverage, Meal, Medical" />
                    </label>

                    <label className="control">
                      <span>Origin Species</span>
                      <input name="origin_species" value={replicatorPatternForm.origin_species} onChange={handleReplicatorPatternChange} placeholder="Human" />
                    </label>

                    <label className="control">
                      <span>Energy Cost</span>
                      <input name="energy_cost" value={replicatorPatternForm.energy_cost} onChange={handleReplicatorPatternChange} placeholder="2.50" />
                    </label>

                    <label className="control">
                      <span>Last Updated Stardate</span>
                      <input name="last_updated_stardate" value={replicatorPatternForm.last_updated_stardate} onChange={handleReplicatorPatternChange} placeholder="48532.4" />
                    </label>
                  </div>

                  <label className="control">
                    <span>Description</span>
                    <textarea name="description" value={replicatorPatternForm.description} onChange={handleReplicatorPatternChange} placeholder="Standard officer-mess serving with nutritional profile and heat preference." rows="4" />
                  </label>

                  <button className="submit-button" type="submit" disabled={submittingReplicatorPattern}>
                    {submittingReplicatorPattern ? 'Saving Pattern...' : 'Add Replicator Pattern'}
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

export default ReplicatorConsole;
