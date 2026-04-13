import HolodeckWorkspacePane from './HolodeckWorkspacePane';
import MedicalWorkspacePane from './MedicalWorkspacePane';
import PersonnelWorkspacePane from './PersonnelWorkspacePane';
import ReplicatorWorkspacePane from './ReplicatorWorkspacePane';
import SystemsWorkspacePane from './SystemsWorkspacePane';
import TransporterWorkspacePane from './TransporterWorkspacePane';

function WorkspaceContent(props) {
  const {
    activeWorkspace,
    departments,
    replicatorCrewOptions,
    setCrewOptions,
    recentActions,
    apiFetch,
    currentUser,
    dossierRef,
    setError,
    setHealth,
    setRecentActions,
    setSuccessMessage,
  } = props;

  if (activeWorkspace === 'personnel') {
    return (
      <PersonnelWorkspacePane
        activeWorkspace={activeWorkspace}
        apiFetch={apiFetch}
        currentUser={currentUser}
        departments={departments}
        dossierRef={dossierRef}
        recentActions={recentActions}
        setCrewOptions={setCrewOptions}
        setError={setError}
        setHealth={setHealth}
        setRecentActions={setRecentActions}
        setSuccessMessage={setSuccessMessage}
      />
    );
  }

  if (activeWorkspace === 'medical') {
    return (
      <MedicalWorkspacePane
        activeWorkspace={activeWorkspace}
        apiFetch={apiFetch}
        currentUser={currentUser}
        dossierRef={dossierRef}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />
    );
  }

  if (activeWorkspace === 'transporter') {
    return (
      <TransporterWorkspacePane
        activeWorkspace={activeWorkspace}
        apiFetch={apiFetch}
        currentUser={currentUser}
        dossierRef={dossierRef}
        replicatorCrewOptions={replicatorCrewOptions}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />
    );
  }

  if (activeWorkspace === 'replicator') {
    return (
      <ReplicatorWorkspacePane
        activeWorkspace={activeWorkspace}
        apiFetch={apiFetch}
        currentUser={currentUser}
        dossierRef={dossierRef}
        replicatorCrewOptions={replicatorCrewOptions}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />
    );
  }

  if (activeWorkspace === 'holodeck') {
    return (
      <HolodeckWorkspacePane
        activeWorkspace={activeWorkspace}
        apiFetch={apiFetch}
        currentUser={currentUser}
        dossierRef={dossierRef}
        replicatorCrewOptions={replicatorCrewOptions}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />
    );
  }

  return (
    <SystemsWorkspacePane
      activeWorkspace={activeWorkspace}
      apiFetch={apiFetch}
      currentUser={currentUser}
      dossierRef={dossierRef}
      setError={setError}
    />
  );
}

export default WorkspaceContent;
