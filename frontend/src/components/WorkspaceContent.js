import HolodeckWorkspace from './HolodeckWorkspace';
import MedicalWorkspace from './MedicalWorkspace';
import PersonnelWorkspace from './PersonnelWorkspace';
import ReplicatorWorkspace from './ReplicatorWorkspace';
import SystemsWorkspace from './SystemsWorkspace';
import TransporterWorkspace from './TransporterWorkspace';

function WorkspaceContent(props) {
  const {
    activeWorkspace,
    crew,
    departments,
    designation,
    departmentFilter,
    holodeckLogs,
    holodeckSearch,
    loadingCrew,
    loadingHolodeck,
    loadingMedicalCharts,
    loadingReplicator,
    loadingSystems,
    loadingTransporter,
    medicalCharts,
    medicalSearch,
    openHolodeckConsole,
    openReplicatorConsole,
    openTransporterConsole,
    pagedCompartments,
    pagedCrew,
    pagedHolodeckLogs,
    pagedMedicalCharts,
    pagedReplicatorLogs,
    pagedTransporterLogs,
    replicatorLogs,
    replicatorPatterns,
    replicatorSearch,
    replicatorUnits,
    safeCrewPage,
    safeHolodeckPage,
    safeMedicalPage,
    safeReplicatorPage,
    safeSystemsPage,
    safeTransporterPage,
    search,
    selectedCompartment,
    selectedCompartmentId,
    selectedCrew,
    selectedCrewId,
    selectedHolodeckLogId,
    selectedMedicalChart,
    selectedMedicalCrewId,
    selectedReplicatorLogId,
    selectedTransporterEventId,
    setCrewPage,
    setDepartmentFilter,
    setDesignation,
    setHolodeckPage,
    setHolodeckSearch,
    setMedicalPage,
    setMedicalSearch,
    setReplicatorPage,
    setReplicatorSearch,
    setSearch,
    setSelectedCompartmentId,
    setSelectedCrewId,
    setSelectedMedicalCrewId,
    setShowCrewCreate,
    setSystemsPage,
    setSystemsSearch,
    setTransporterPage,
    setTransporterSearch,
    showHolodeckConsole,
    showTransporterConsole,
    systemsCompartments,
    systemsSearch,
    totalCrewPages,
    totalHolodeckPages,
    totalMedicalPages,
    totalReplicatorPages,
    totalSystemsPages,
    totalTransporterPages,
    transporterLocations,
    transporterLogs,
    transporterSearch,
    transporterUnits,
  } = props;

  if (activeWorkspace === 'personnel') {
    return (
      <PersonnelWorkspace
        crew={crew}
        departments={departments}
        designation={designation}
        departmentFilter={departmentFilter}
        loadingCrew={loadingCrew}
        pagedCrew={pagedCrew}
        safeCrewPage={safeCrewPage}
        search={search}
        selectedCrew={selectedCrew}
        selectedCrewId={selectedCrewId}
        setCrewPage={setCrewPage}
        setDepartmentFilter={setDepartmentFilter}
        setDesignation={setDesignation}
        setSearch={setSearch}
        setSelectedCrewId={setSelectedCrewId}
        setShowCrewCreate={setShowCrewCreate}
        totalCrewPages={totalCrewPages}
      />
    );
  }

  if (activeWorkspace === 'medical') {
    return (
      <MedicalWorkspace
        loadingMedicalCharts={loadingMedicalCharts}
        medicalCharts={medicalCharts}
        medicalSearch={medicalSearch}
        pagedMedicalCharts={pagedMedicalCharts}
        safeMedicalPage={safeMedicalPage}
        selectedMedicalChart={selectedMedicalChart}
        selectedMedicalCrewId={selectedMedicalCrewId}
        setMedicalPage={setMedicalPage}
        setMedicalSearch={setMedicalSearch}
        setSelectedMedicalCrewId={setSelectedMedicalCrewId}
        totalMedicalPages={totalMedicalPages}
      />
    );
  }

  if (activeWorkspace === 'transporter') {
    return (
      <TransporterWorkspace
        loadingTransporter={loadingTransporter}
        openTransporterConsole={openTransporterConsole}
        pagedTransporterLogs={pagedTransporterLogs}
        safeTransporterPage={safeTransporterPage}
        selectedTransporterEventId={selectedTransporterEventId}
        setTransporterPage={setTransporterPage}
        setTransporterSearch={setTransporterSearch}
        showTransporterConsole={showTransporterConsole}
        totalTransporterPages={totalTransporterPages}
        transporterLocations={transporterLocations}
        transporterLogs={transporterLogs}
        transporterSearch={transporterSearch}
        transporterUnits={transporterUnits}
      />
    );
  }

  if (activeWorkspace === 'replicator') {
    return (
      <ReplicatorWorkspace
        loadingReplicator={loadingReplicator}
        openReplicatorConsole={openReplicatorConsole}
        pagedReplicatorLogs={pagedReplicatorLogs}
        replicatorLogs={replicatorLogs}
        replicatorPatterns={replicatorPatterns}
        replicatorSearch={replicatorSearch}
        replicatorUnits={replicatorUnits}
        safeReplicatorPage={safeReplicatorPage}
        selectedReplicatorLogId={selectedReplicatorLogId}
        setReplicatorPage={setReplicatorPage}
        setReplicatorSearch={setReplicatorSearch}
        totalReplicatorPages={totalReplicatorPages}
      />
    );
  }

  if (activeWorkspace === 'holodeck') {
    return (
      <HolodeckWorkspace
        holodeckLogs={holodeckLogs}
        holodeckSearch={holodeckSearch}
        loadingHolodeck={loadingHolodeck}
        openHolodeckConsole={openHolodeckConsole}
        pagedHolodeckLogs={pagedHolodeckLogs}
        safeHolodeckPage={safeHolodeckPage}
        selectedHolodeckLogId={selectedHolodeckLogId}
        setHolodeckPage={setHolodeckPage}
        setHolodeckSearch={setHolodeckSearch}
        showHolodeckConsole={showHolodeckConsole}
        totalHolodeckPages={totalHolodeckPages}
      />
    );
  }

  return (
    <SystemsWorkspace
      loadingSystems={loadingSystems}
      pagedCompartments={pagedCompartments}
      safeSystemsPage={safeSystemsPage}
      selectedCompartment={selectedCompartment}
      selectedCompartmentId={selectedCompartmentId}
      setSelectedCompartmentId={setSelectedCompartmentId}
      setSystemsPage={setSystemsPage}
      setSystemsSearch={setSystemsSearch}
      systemsCompartments={systemsCompartments}
      systemsSearch={systemsSearch}
      totalSystemsPages={totalSystemsPages}
    />
  );
}

export default WorkspaceContent;
