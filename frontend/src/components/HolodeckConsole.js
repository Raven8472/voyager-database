import { VOYAGER_EPISODE_GUIDE } from '../lib/constants';
import { formatHolodeckLabel, formatRecordName } from '../lib/formatters';

function HolodeckConsole({
  activeWorkspace,
  closeHolodeckConsole,
  dossierRef,
  handleHolodeckEpisodeChange,
  handleHolodeckLogChange,
  handleHolodeckLogSubmit,
  handleHolodeckProgramChange,
  handleHolodeckProgramSubmit,
  handleHolodeckSeasonChange,
  holodeckLogForm,
  holodeckProgramForm,
  holodeckPrograms,
  holodeckTab,
  holodeckUnits,
  replicatorCrewOptions,
  selectedHolodeckCrew,
  selectedHolodeckLog,
  selectedHolodeckProgram,
  selectedHolodeckSeasonGuide,
  selectedHolodeckUnit,
  setHolodeckTab,
  showHolodeckConsole,
  submittingHolodeck,
  submittingHolodeckProgram,
}) {
  const selectedProgramHomeUnit = holodeckUnits.find(
    (unit) => unit.holodeck_id === holodeckProgramForm.holodeck_id
  );

  if (!showHolodeckConsole || activeWorkspace !== 'holodeck') {
    return null;
  }

  return (
    <div className="dossier-overlay" onClick={closeHolodeckConsole}>
      <div
        ref={dossierRef}
        className="dossier-window"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="window-toolbar">
          <div>
            <span className="eyebrow">Holodeck Console</span>
            <strong>
              {selectedHolodeckLog
                ? `${selectedHolodeckLog.program_name || selectedHolodeckLog.program_id} | ${selectedHolodeckLog.holodeck_designation || selectedHolodeckLog.holodeck_id}`
                : 'New Holodeck Record'}
            </strong>
          </div>
          <button className="window-close" type="button" onClick={closeHolodeckConsole}>
            Close Console
          </button>
        </div>

        <div className="window-grid">
          <div className="panel panel-dossier">
            <div className="dossier-grid">
              <div className="metric">
                <span>Active Log</span>
                <strong>{selectedHolodeckLog ? selectedHolodeckLog.log_id : 'New Entry'}</strong>
              </div>
              <div className="metric">
                <span>Program</span>
                <strong>{selectedHolodeckLog?.program_name || selectedHolodeckProgram?.program_name || 'Not selected'}</strong>
              </div>
              <div className="metric">
                <span>Crew</span>
                <strong>{selectedHolodeckLog ? formatRecordName(selectedHolodeckLog) : selectedHolodeckCrew ? formatRecordName(selectedHolodeckCrew) : 'No crew selected'}</strong>
              </div>
              <div className="metric">
                <span>Holodeck</span>
                <strong>{selectedHolodeckLog ? formatHolodeckLabel(selectedHolodeckLog) : selectedHolodeckUnit ? formatHolodeckLabel(selectedHolodeckUnit) : 'Not selected'}</strong>
              </div>
              <div className="metric">
                <span>Originator</span>
                <strong>{selectedHolodeckLog?.created_by || selectedHolodeckProgram?.created_by || 'Unknown'}</strong>
              </div>
              <div className="metric">
                <span>Stardate</span>
                <strong>{selectedHolodeckLog?.stardate || holodeckLogForm.stardate || 'Pending'}</strong>
              </div>
            </div>

            <div className="profile-note">
              <span className="eyebrow">Console Guidance</span>
              <p>Use this console to track who ran what, where, and when. Program authorship stays with the library record, while each session captures the crew behavior.</p>
            </div>
          </div>

          <div className="panel panel-detail">
            <div className="detail-tabs">
              <button type="button" className={`detail-tab ${holodeckTab === 'detail' ? 'active' : ''}`} onClick={() => setHolodeckTab('detail')}>Log Detail</button>
              <button type="button" className={`detail-tab ${holodeckTab === 'newlog' ? 'active' : ''}`} onClick={() => setHolodeckTab('newlog')}>New Log</button>
              <button type="button" className={`detail-tab ${holodeckTab === 'programs' ? 'active' : ''}`} onClick={() => setHolodeckTab('programs')}>Program Library</button>
              <button type="button" className={`detail-tab ${holodeckTab === 'newprogram' ? 'active' : ''}`} onClick={() => setHolodeckTab('newprogram')}>New Program</button>
            </div>

            {holodeckTab === 'detail' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Selected Holodeck Event</span>
                  <strong>{selectedHolodeckLog ? 'Session Loaded' : 'No Log Selected'}</strong>
                </div>

                {selectedHolodeckLog ? (
                  <div className="timeline">
                    <article className="timeline-entry">
                      <div className="timeline-badge">HLD</div>
                      <div>
                        <strong>{selectedHolodeckLog.program_name || selectedHolodeckLog.program_id}</strong>
                        <p>Crew: {formatRecordName(selectedHolodeckLog)}</p>
                        <p>Holodeck: {formatHolodeckLabel(selectedHolodeckLog)}</p>
                        <p>Stardate: {selectedHolodeckLog.stardate || 'Not recorded'}</p>
                        <p>Created By: {selectedHolodeckLog.created_by || 'Unknown'} | Genre: {selectedHolodeckLog.genre || 'Unspecified'}</p>
                      </div>
                    </article>
                  </div>
                ) : (
                  <div className="empty-state">Select an entry from the holodeck log, or open the New Log tab to file a fresh session.</div>
                )}
              </div>
            ) : null}

            {holodeckTab === 'newlog' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">New Holodeck Session</span>
                  <strong>Record A Program Run</strong>
                </div>

                <form className="action-form" onSubmit={handleHolodeckLogSubmit}>
                  <div className="action-grid">
                    <label className="control">
                      <span>Crew Member</span>
                      <select name="crew_id" value={holodeckLogForm.crew_id} onChange={handleHolodeckLogChange} required>
                        <option value="">Select Crew</option>
                        {replicatorCrewOptions.map((member) => (
                          <option key={`holodeck-crew-${member.crew_id}`} value={member.crew_id}>
                            {formatRecordName(member)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Holodeck Bay</span>
                      <select name="holodeck_id" value={holodeckLogForm.holodeck_id} onChange={handleHolodeckLogChange} required>
                        <option value="">Select Bay</option>
                        {holodeckUnits.map((unit) => (
                          <option key={unit.holodeck_id} value={unit.holodeck_id}>
                            {formatHolodeckLabel(unit)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Program</span>
                      <select name="program_id" value={holodeckLogForm.program_id} onChange={handleHolodeckLogChange} required>
                        <option value="">Select Program</option>
                        {holodeckPrograms.map((program) => (
                          <option key={`holodeck-program-${program.program_id}`} value={program.program_id}>
                            {program.program_name} | {program.holodeck_designation || program.holodeck_id}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Season</span>
                      <select name="episode_season" value={holodeckLogForm.episode_season} onChange={handleHolodeckSeasonChange}>
                        <option value="">Manual Stardate Entry</option>
                        {VOYAGER_EPISODE_GUIDE.map((entry) => (
                          <option key={`holodeck-${entry.season}`} value={entry.season}>
                            {entry.season}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Episode</span>
                      <select
                        name="episode_title"
                        value={holodeckLogForm.episode_title}
                        onChange={handleHolodeckEpisodeChange}
                        disabled={!holodeckLogForm.episode_season}
                      >
                        <option value="">{holodeckLogForm.episode_season ? 'Select Episode' : 'Choose Season First'}</option>
                        {(selectedHolodeckSeasonGuide?.episodes || []).map(([title]) => (
                          <option key={`holodeck-episode-${title}`} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Stardate</span>
                      <input name="stardate" value={holodeckLogForm.stardate} onChange={handleHolodeckLogChange} placeholder="48658.2" required />
                    </label>
                  </div>

                  <div className="action-preview">
                    <span className="eyebrow">Preview</span>
                    <p>
                      {selectedHolodeckCrew ? formatRecordName(selectedHolodeckCrew) : 'Crew pending'} |{' '}
                      {selectedHolodeckProgram?.program_name || 'Program pending'} |{' '}
                      {selectedHolodeckUnit ? formatHolodeckLabel(selectedHolodeckUnit) : 'Holodeck pending'}
                    </p>
                  </div>

                  <button className="submit-button" type="submit" disabled={submittingHolodeck}>
                    {submittingHolodeck ? 'Logging Session...' : 'Log Holodeck Session'}
                  </button>
                </form>
              </div>
            ) : null}

            {holodeckTab === 'programs' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Program Library</span>
                  <strong>{holodeckPrograms.length} programs in scope</strong>
                </div>

                <div className="timeline">
                  {holodeckPrograms.length ? (
                    holodeckPrograms.map((program) => (
                      <article key={`library-${program.program_id}`} className="timeline-entry">
                        <div className="timeline-badge">PRG</div>
                        <div>
                          <strong>{program.program_name}</strong>
                          <p>{formatHolodeckLabel(program)} | Genre: {program.genre || 'Unspecified'}</p>
                          <p>Created By: {program.created_by || 'Unknown'} | Access Level: {program.access_level || 'Not specified'}</p>
                          <p>{program.description || 'No program description is currently on file.'}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">No holodeck programs match the current search.</div>
                  )}
                </div>
              </div>
            ) : null}

            {holodeckTab === 'newprogram' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Program Authoring</span>
                  <strong>Add New Holodeck Program</strong>
                </div>

                <form className="action-form" onSubmit={handleHolodeckProgramSubmit}>
                  <div className="action-grid">
                    <label className="control">
                      <span>Program Name</span>
                      <input name="program_name" value={holodeckProgramForm.program_name} onChange={handleHolodeckProgramChange} placeholder="Bride of Chaotica!" required />
                    </label>

                    <label className="control">
                      <span>Home Holodeck</span>
                      <select name="holodeck_id" value={holodeckProgramForm.holodeck_id} onChange={handleHolodeckProgramChange} required>
                        <option value="">Select Bay</option>
                        {holodeckUnits.map((unit) => (
                          <option key={`authoring-${unit.holodeck_id}`} value={unit.holodeck_id}>
                            {formatHolodeckLabel(unit)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="control">
                      <span>Created By</span>
                      <input name="created_by" value={holodeckProgramForm.created_by} onChange={handleHolodeckProgramChange} placeholder="Tom Paris" />
                    </label>

                    <label className="control">
                      <span>Access Level</span>
                      <input name="access_level" value={holodeckProgramForm.access_level} onChange={handleHolodeckProgramChange} placeholder="Unrestricted" />
                    </label>

                    <label className="control">
                      <span>Genre</span>
                      <input name="genre" value={holodeckProgramForm.genre} onChange={handleHolodeckProgramChange} placeholder="Sci-Fi Serial" />
                    </label>
                  </div>

                  <label className="control">
                    <span>Description</span>
                    <textarea name="description" value={holodeckProgramForm.description} onChange={handleHolodeckProgramChange} placeholder="Pulp serial adventure with Arachnia, Death Ray theatrics, and melodramatic villain entrances." rows="4" />
                  </label>

                  <div className="action-preview">
                    <span className="eyebrow">Library Preview</span>
                    <p>
                      {holodeckProgramForm.program_name || 'Program pending'} |{' '}
                      {holodeckProgramForm.created_by || 'Creator pending'} |{' '}
                      {selectedProgramHomeUnit ? formatHolodeckLabel(selectedProgramHomeUnit) : 'Holodeck pending'}
                    </p>
                  </div>

                  <button className="submit-button" type="submit" disabled={submittingHolodeckProgram}>
                    {submittingHolodeckProgram ? 'Adding Program...' : 'Add Holodeck Program'}
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

export default HolodeckConsole;
