function SystemsCompartmentWindow({
  activeWorkspace,
  closeWindow,
  dossierRef,
  loadingSystemDetail,
  selectedCompartment,
}) {
  if (!selectedCompartment || activeWorkspace !== 'systems') {
    return null;
  }

  return (
    <div className="dossier-overlay" onClick={closeWindow}>
      <div
        ref={dossierRef}
        className="dossier-window"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="window-toolbar">
          <div>
            <span className="eyebrow">Ship Systems</span>
            <strong>{loadingSystemDetail ? 'Syncing compartment...' : `${selectedCompartment.compartment_name} | ${selectedCompartment.compartment_id}`}</strong>
          </div>
          <button className="window-close" type="button" onClick={closeWindow}>
            Close Compartment
          </button>
        </div>

        <div className="window-grid">
          <div className="panel panel-dossier">
            <div className="dossier-grid">
              <div className="metric">
                <span>Compartment</span>
                <strong>{selectedCompartment.compartment_name}</strong>
              </div>
              <div className="metric">
                <span>Compartment ID</span>
                <strong>{selectedCompartment.compartment_id}</strong>
              </div>
              <div className="metric">
                <span>Designation</span>
                <strong>{selectedCompartment.compartment_designation || 'Not Assigned'}</strong>
              </div>
              <div className="metric">
                <span>Replicators</span>
                <strong>{selectedCompartment.replicators.length}</strong>
              </div>
              <div className="metric">
                <span>Transporters</span>
                <strong>{selectedCompartment.transporters.length}</strong>
              </div>
              <div className="metric">
                <span>System Scope</span>
                <strong>Infrastructure</strong>
              </div>
              <div className="metric">
                <span>Holodecks</span>
                <strong>{selectedCompartment.holodecks.length}</strong>
              </div>
            </div>

            <div className="profile-note">
              <span className="eyebrow">Compartment Notes</span>
              <p>This view tracks what is installed in the space itself. Usage history lives in the dedicated activity workspaces, while this panel stays focused on room inventory.</p>
            </div>
          </div>

          <div className="panel panel-detail">
            <div className="detail-pane">
              <div className="panel-subheader">
                <span className="eyebrow">Installed Replicators</span>
                <strong>{selectedCompartment.replicators.length} units</strong>
              </div>
              <div className="timeline">
                {selectedCompartment.replicators.length ? (
                  selectedCompartment.replicators.map((unit) => (
                    <article key={unit.unit_id} className="timeline-entry">
                      <div className="timeline-badge">REP</div>
                      <div>
                        <strong>{unit.unit_id}</strong>
                        <p>Type: {unit.unit_type || 'Unknown'}</p>
                        <p>Access Level: {unit.access_level || 'Not specified'}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">No replicator units are currently cataloged in this compartment.</div>
                )}
              </div>

              <div className="panel-subheader systems-subheader">
                <span className="eyebrow">Installed Transporters</span>
                <strong>{selectedCompartment.transporters.length} units</strong>
              </div>
              <div className="timeline">
                {selectedCompartment.transporters.length ? (
                  selectedCompartment.transporters.map((unit) => (
                    <article key={unit.unit_id} className="timeline-entry">
                      <div className="timeline-badge">TRN</div>
                      <div>
                        <strong>{unit.unit_id}</strong>
                        <p>Transporter pad assigned to this compartment.</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">No transporter units are currently cataloged in this compartment.</div>
                )}
              </div>

              <div className="panel-subheader systems-subheader">
                <span className="eyebrow">Holodeck Bays</span>
                <strong>{selectedCompartment.holodecks.length} bays</strong>
              </div>
              <div className="timeline">
                {selectedCompartment.holodecks.length ? (
                  selectedCompartment.holodecks.map((bay) => (
                    <article key={bay.holodeck_id} className="timeline-entry">
                      <div className="timeline-badge">HLD</div>
                      <div>
                        <strong>{bay.holodeck_id}</strong>
                        <p>Designation: {bay.holodeck_designation || 'Standard Holodeck'}</p>
                        <p>Access Level: {bay.access_level || 'Not specified'} | Programs: {bay.program_count}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">No holodeck bays are currently cataloged in this compartment.</div>
                )}
              </div>

              <div className="panel-subheader systems-subheader">
                <span className="eyebrow">Holodeck Programs</span>
                <strong>{selectedCompartment.holodeck_programs.length} programs</strong>
              </div>
              <div className="timeline">
                {selectedCompartment.holodeck_programs.length ? (
                  selectedCompartment.holodeck_programs.map((program) => (
                    <article key={program.program_id} className="timeline-entry">
                      <div className="timeline-badge">PRG</div>
                      <div>
                        <strong>{program.program_name}</strong>
                        <p>{program.holodeck_id} | Genre: {program.genre || 'Unspecified'}</p>
                        <p>Created By: {program.created_by || 'Unknown'} | Access Level: {program.access_level || 'Not specified'}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">No holodeck programs are currently cataloged in this compartment.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemsCompartmentWindow;
