import { VOYAGER_EPISODE_GUIDE } from '../lib/constants';

function MedicalChartWindow({
  activeWorkspace,
  closeChart,
  dossierRef,
  handleMedicalProfileChange,
  handleMedicalProfileSubmit,
  handleMedicalRecordChange,
  handleMedicalRecordEpisodeChange,
  handleMedicalRecordSeasonChange,
  handleMedicalRecordSubmit,
  loadingMedicalDetail,
  medicalProfileForm,
  medicalRecordForm,
  medicalTab,
  selectedMedicalChart,
  selectedMedicalSeasonGuide,
  setMedicalTab,
  submittingMedical,
}) {
  if (!selectedMedicalChart || activeWorkspace !== 'medical') {
    return null;
  }

  return (
    <div className="dossier-overlay" onClick={closeChart}>
      <div
        ref={dossierRef}
        className="dossier-window"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="window-toolbar">
          <div>
            <span className="eyebrow">Medical Chart</span>
            <strong>{loadingMedicalDetail ? 'Syncing chart...' : selectedMedicalChart.display_name}</strong>
          </div>
          <button className="window-close" type="button" onClick={closeChart}>
            Close Chart
          </button>
        </div>

        <div className="window-grid">
          <div className="panel panel-dossier">
            <div className="dossier-grid">
              <div className="metric">
                <span>Patient</span>
                <strong>{selectedMedicalChart.display_name}</strong>
              </div>
              <div className="metric">
                <span>Species</span>
                <strong>{selectedMedicalChart.species || 'Unknown'}</strong>
              </div>
              <div className="metric">
                <span>Date Of Birth</span>
                <strong>{selectedMedicalChart.birth_stardate || 'Not Recorded'}</strong>
              </div>
              <div className="metric">
                <span>Profile Status</span>
                <strong>{selectedMedicalChart.medical_profile ? 'On File' : 'Not Started'}</strong>
              </div>
              <div className="metric">
                <span>Treatment Logs</span>
                <strong>{selectedMedicalChart.medical_records.length}</strong>
              </div>
              <div className="metric">
                <span>Chart Type</span>
                <strong>Sickbay Record</strong>
              </div>
            </div>

            <div className="profile-note">
              <span className="eyebrow">Medical Guidance</span>
              <p>Use the baseline profile for persistent health data and the treatment log for incident-based care, follow-up, and interventions.</p>
            </div>
          </div>

          <div className="panel panel-detail">
            <div className="detail-tabs">
              <button type="button" className={`detail-tab ${medicalTab === 'profile' ? 'active' : ''}`} onClick={() => setMedicalTab('profile')}>Profile</button>
              <button type="button" className={`detail-tab ${medicalTab === 'records' ? 'active' : ''}`} onClick={() => setMedicalTab('records')}>Treatment Logs</button>
              <button type="button" className={`detail-tab ${medicalTab === 'newlog' ? 'active' : ''}`} onClick={() => setMedicalTab('newlog')}>New Log</button>
            </div>

            {medicalTab === 'profile' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Baseline Medical Profile</span>
                  <strong>{selectedMedicalChart.medical_profile ? 'Update Existing Profile' : 'Create Initial Profile'}</strong>
                </div>

                <form className="action-form" onSubmit={handleMedicalProfileSubmit}>
                  <div className="action-grid">
                    <label className="control">
                      <span>Blood Type</span>
                      <input name="blood_type" value={medicalProfileForm.blood_type} onChange={handleMedicalProfileChange} placeholder="O+" />
                    </label>
                    <label className="control">
                      <span>Emergency Contact</span>
                      <input name="emergency_contact" value={medicalProfileForm.emergency_contact} onChange={handleMedicalProfileChange} placeholder="Captain Janeway" />
                    </label>
                  </div>

                  <label className="control">
                    <span>Allergies</span>
                    <input name="allergies" value={medicalProfileForm.allergies} onChange={handleMedicalProfileChange} placeholder="Leola root, anesthesia compound 9..." />
                  </label>

                  <label className="control">
                    <span>Chronic Conditions</span>
                    <input name="chronic_conditions" value={medicalProfileForm.chronic_conditions} onChange={handleMedicalProfileChange} placeholder="Recurring migraines, transporter sensitivity..." />
                  </label>

                  <button className="submit-button" type="submit" disabled={submittingMedical}>
                    {submittingMedical ? 'Saving Profile...' : 'Save Medical Profile'}
                  </button>
                </form>
              </div>
            ) : null}

            {medicalTab === 'records' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">Treatment History</span>
                  <strong>{selectedMedicalChart.medical_records.length} treatment logs</strong>
                </div>

                <div className="timeline">
                  {selectedMedicalChart.medical_records.length ? (
                    selectedMedicalChart.medical_records.map((record) => (
                      <article key={record.record_id} className="timeline-entry">
                        <div className="timeline-badge">MED</div>
                        <div>
                          <strong>{record.reason_for_visit || 'Treatment record'}</strong>
                          <p>Visit Stardate {record.visit_stardate || 'pending'}</p>
                          <p>Treatment: {record.treatment_provided || 'Not specified'}</p>
                          <p>Follow-up Required: {record.follow_up_required ? 'Yes' : 'No'}</p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="empty-state">No treatment logs have been entered for this chart yet.</div>
                  )}
                </div>
              </div>
            ) : null}

            {medicalTab === 'newlog' ? (
              <div className="detail-pane">
                <div className="panel-subheader">
                  <span className="eyebrow">New Medical Log</span>
                  <strong>Record Treatment Or Follow-Up</strong>
                </div>

                <form className="action-form" onSubmit={handleMedicalRecordSubmit}>
                  <div className="action-grid">
                    <label className="control">
                      <span>Season</span>
                      <select name="episode_season" value={medicalRecordForm.episode_season} onChange={handleMedicalRecordSeasonChange}>
                        <option value="">Manual Stardate Entry</option>
                        {VOYAGER_EPISODE_GUIDE.map((entry) => (
                          <option key={`medical-${entry.season}`} value={entry.season}>
                            {entry.season}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="control">
                      <span>Episode</span>
                      <select
                        name="episode_title"
                        value={medicalRecordForm.episode_title}
                        onChange={handleMedicalRecordEpisodeChange}
                        disabled={!medicalRecordForm.episode_season}
                      >
                        <option value="">{medicalRecordForm.episode_season ? 'Select Episode' : 'Choose Season First'}</option>
                        {(selectedMedicalSeasonGuide?.episodes || []).map(([title]) => (
                          <option key={`medical-episode-${title}`} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="control">
                      <span>Visit Stardate</span>
                      <input name="visit_stardate" value={medicalRecordForm.visit_stardate} onChange={handleMedicalRecordChange} placeholder="48532.4" />
                    </label>
                    <label className="control checkbox-control">
                      <span>Follow-Up Required</span>
                      <input type="checkbox" name="follow_up_required" checked={medicalRecordForm.follow_up_required} onChange={handleMedicalRecordChange} />
                    </label>
                  </div>

                  <label className="control">
                    <span>Reason For Visit</span>
                    <input name="reason_for_visit" value={medicalRecordForm.reason_for_visit} onChange={handleMedicalRecordChange} placeholder="Radiation exposure, plasma burn, neural fatigue..." />
                  </label>

                  <label className="control">
                    <span>Treatment Provided</span>
                    <textarea name="treatment_provided" value={medicalRecordForm.treatment_provided} onChange={handleMedicalRecordChange} placeholder="Cortical stimulator applied, patient held for observation..." rows="4" />
                  </label>

                  <button className="submit-button" type="submit" disabled={submittingMedical}>
                    {submittingMedical ? 'Logging Treatment...' : 'Add Medical Log'}
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

export default MedicalChartWindow;
