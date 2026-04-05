import { VOYAGER_EPISODE_GUIDE } from '../lib/constants';
import { formatRecordName } from '../lib/formatters';

function PersonnelDossier({
  departments,
  dossierRef,
  dossierTab,
  formState,
  handleEpisodeChange,
  handleFormChange,
  handleSeasonChange,
  handleSubmit,
  loadingDetail,
  recentActions,
  selectedCrew,
  selectedDepartmentName,
  selectedSeasonGuide,
  setDossierTab,
  setSelectedCrewId,
  submitting,
}) {
  if (!selectedCrew) {
    return null;
  }

  return (
    <div className="dossier-overlay" onClick={() => setSelectedCrewId(null)}>
      <div
        ref={dossierRef}
        className="dossier-window"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="window-toolbar">
          <div>
            <span className="eyebrow">Personnel Dossier</span>
            <strong>{loadingDetail ? 'Syncing file...' : formatRecordName(selectedCrew)}</strong>
          </div>
          <button className="window-close" type="button" onClick={() => setSelectedCrewId(null)}>
            Close Dossier
          </button>
        </div>

        <div className="window-grid">
          <div className="panel panel-dossier">
            <div className="dossier-grid">
              <div className="metric">
                <span>Designation</span>
                <strong>{selectedCrew.designation || 'Unknown'}</strong>
              </div>
              <div className="metric">
                <span>Department</span>
                <strong>{selectedCrew.department || 'Unassigned'}</strong>
              </div>
              <div className="metric">
                <span>Rank</span>
                <strong>{selectedCrew.rank || 'Unassigned Rank'}</strong>
              </div>
              <div className="metric">
                <span>Species</span>
                <strong>{selectedCrew.species || 'Unknown'}</strong>
              </div>
              <div className="metric">
                <span>Service Number</span>
                <strong>{selectedCrew.service_number || 'Not Recorded'}</strong>
              </div>
              <div className="metric">
                <span>Birth Stardate</span>
                <strong>{selectedCrew.birth_stardate || 'Not Recorded'}</strong>
              </div>
            </div>

            <div className="profile-note">
              <span className="eyebrow">Origin</span>
              <p>{selectedCrew.planet_of_origin || 'No world of origin has been entered for this file.'}</p>
            </div>
          </div>

          <div className="panel panel-detail">
            <div className="detail-tabs">
              <button
                type="button"
                className={`detail-tab ${dossierTab === 'history' ? 'active' : ''}`}
                onClick={() => setDossierTab('history')}
              >
                History
              </button>
              <button
                type="button"
                className={`detail-tab ${dossierTab === 'action' ? 'active' : ''}`}
                onClick={() => setDossierTab('action')}
              >
                Action Console
              </button>
            </div>

            {dossierTab === 'history' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Personnel History</span>
                  <strong>{selectedCrew.personnel_actions.length} logged actions</strong>
                </div>

                <div className="timeline">
                  {selectedCrew.personnel_actions.length ? (
                    selectedCrew.personnel_actions.map((action) => (
                      <article key={action.action_id} className="timeline-entry">
                        <div className="timeline-badge">{action.action_type}</div>
                        <div>
                          <strong>
                            {action.old_rank || 'Current'} to {action.new_rank || 'Current'}
                          </strong>
                          <p>
                            Stardate {action.effective_stardate || 'pending'} | Episode {action.episode_reference || 'not tagged'}
                          </p>
                          {(action.old_species || action.new_species) ? (
                            <p>
                              Species: {action.old_species || 'Unknown'} to {action.new_species || 'Unknown'}
                            </p>
                          ) : null}
                          {(action.old_planet_of_origin || action.new_planet_of_origin) ? (
                            <p>
                              Origin: {action.old_planet_of_origin || 'Unknown'} to {action.new_planet_of_origin || 'Unknown'}
                            </p>
                          ) : null}
                          <p>{action.action_notes || 'No supplemental notes were entered.'}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">
                      No personnel actions have been logged for this dossier yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Action Console</span>
                  <strong>Log Official Change</strong>
                </div>

                <form className="action-form" onSubmit={handleSubmit}>
                  <label className="control">
                    <span>Action Type</span>
                    <select name="action_type" value={formState.action_type} onChange={handleFormChange}>
                      <option value="Promotion">Promotion</option>
                      <option value="Demotion">Demotion</option>
                      <option value="Transfer">Transfer</option>
                      <option value="Status Change">Status Change</option>
                      <option value="Commendation">Commendation</option>
                      <option value="Note">Note</option>
                    </select>
                  </label>

                  <div className="action-grid">
                    <label className="control">
                      <span>Season</span>
                      <select name="episode_season" value={formState.episode_season} onChange={handleSeasonChange}>
                        <option value="">Manual Entry</option>
                        {VOYAGER_EPISODE_GUIDE.map((entry) => (
                          <option key={entry.season} value={entry.season}>
                            {entry.season}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Episode</span>
                      <select
                        name="episode_title"
                        value={formState.episode_title}
                        onChange={handleEpisodeChange}
                        disabled={!selectedSeasonGuide}
                      >
                        <option value="">Select Episode</option>
                        {(selectedSeasonGuide?.episodes || []).map(([title]) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>New Rank</span>
                      <input
                        name="new_rank"
                        value={formState.new_rank}
                        onChange={handleFormChange}
                        placeholder="Lieutenant Commander"
                      />
                    </label>

                    <label className="control">
                      <span>Species</span>
                      <input
                        name="new_species"
                        value={formState.new_species}
                        onChange={handleFormChange}
                        placeholder="Bajoran"
                      />
                    </label>

                    <label className="control">
                      <span>World Of Origin</span>
                      <input
                        name="new_planet_of_origin"
                        value={formState.new_planet_of_origin}
                        onChange={handleFormChange}
                        placeholder="Bajor"
                      />
                    </label>

                    <label className="control">
                      <span>New Department</span>
                      <select
                        name="new_department_id"
                        value={formState.new_department_id}
                        onChange={handleFormChange}
                      >
                        <option value="">Unchanged</option>
                        {departments.map((department) => (
                          <option key={department.department_id} value={department.department_id}>
                            {department.department_name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Effective Stardate</span>
                      <input
                        name="effective_stardate"
                        value={formState.effective_stardate}
                        onChange={handleFormChange}
                        placeholder="48532.4"
                      />
                    </label>

                    <label className="control">
                      <span>Episode Reference</span>
                      <input
                        name="episode_reference"
                        value={formState.episode_reference}
                        onChange={handleFormChange}
                        placeholder="S05E03"
                      />
                    </label>
                  </div>

                  <label className="control">
                    <span>Entered By</span>
                    <input
                      name="entered_by"
                      value={formState.entered_by}
                      onChange={handleFormChange}
                      placeholder="Records Officer"
                    />
                  </label>

                  <label className="control">
                    <span>Action Notes</span>
                    <textarea
                      name="action_notes"
                      value={formState.action_notes}
                      onChange={handleFormChange}
                      placeholder="Promotion entered following command review."
                      rows="4"
                    />
                  </label>

                  <div className="action-preview">
                    <span className="eyebrow">Preview</span>
                    <p>
                      {formatRecordName(selectedCrew)} | {formState.action_type} |{' '}
                      {formState.new_rank || selectedCrew?.rank || 'Rank unchanged'} |{' '}
                      {formState.new_species || selectedCrew?.species || 'Species unchanged'} |{' '}
                      {selectedDepartmentName || selectedCrew?.department || 'Department unchanged'}
                    </p>
                  </div>

                  <button className="submit-button" type="submit" disabled={!selectedCrew || submitting}>
                    {submitting ? 'Logging Action...' : 'Log Personnel Action'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="panel recent-panel recent-panel-window">
          <div className="panel-header">
            <span className="eyebrow">Bridge Summary</span>
            <strong>Recent Personnel Actions</strong>
          </div>

          <div className="recent-grid">
            {recentActions.length ? (
              recentActions.map((action) => (
                <article key={action.action_id} className="recent-card">
                  <span className="recent-type">{action.action_type}</span>
                  <strong>{formatRecordName(action)}</strong>
                  <p>{action.new_rank || action.old_rank || 'No rank change recorded'}</p>
                  <p>Episode {action.episode_reference || 'not tagged'}</p>
                </article>
              ))
            ) : (
              <div className="empty-state">
                No recent personnel actions yet. The action feed will appear here once the SQL table is installed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonnelDossier;
