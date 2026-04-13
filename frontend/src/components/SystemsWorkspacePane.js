import { useState } from 'react';
import SystemsCompartmentWindow from './SystemsCompartmentWindow';
import SystemsWorkspace from './SystemsWorkspace';
import { useSystemsWorkspace } from '../hooks/useSystemsWorkspace';
import { CREW_PAGE_SIZE } from '../lib/constants';

function SystemsWorkspacePane({
  activeWorkspace,
  apiFetch,
  currentUser,
  dossierRef,
  setError,
}) {
  const [systemsCompartments, setSystemsCompartments] = useState([]);
  const [systemsSearch, setSystemsSearch] = useState('');
  const [systemsPage, setSystemsPage] = useState(1);
  const [selectedCompartmentId, setSelectedCompartmentId] = useState(null);
  const [selectedCompartment, setSelectedCompartment] = useState(null);
  const [loadingSystems, setLoadingSystems] = useState(true);
  const [loadingSystemDetail, setLoadingSystemDetail] = useState(false);

  useSystemsWorkspace({
    apiFetch,
    currentUser,
    selectedCompartmentId,
    setError,
    setLoadingSystemDetail,
    setLoadingSystems,
    setSelectedCompartment,
    setSelectedCompartmentId,
    setSystemsCompartments,
    setSystemsPage,
    systemsSearch,
  });

  const totalSystemsPages = Math.max(1, Math.ceil(systemsCompartments.length / CREW_PAGE_SIZE));
  const safeSystemsPage = Math.min(systemsPage, totalSystemsPages);
  const pagedCompartments = systemsCompartments.slice(
    (safeSystemsPage - 1) * CREW_PAGE_SIZE,
    safeSystemsPage * CREW_PAGE_SIZE
  );

  return (
    <>
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
      {(activeWorkspace === 'systems' || selectedCompartment) ? (
        <SystemsCompartmentWindow
          activeWorkspace={activeWorkspace}
          closeWindow={() => setSelectedCompartmentId(null)}
          dossierRef={dossierRef}
          loadingSystemDetail={loadingSystemDetail}
          selectedCompartment={selectedCompartment}
        />
      ) : null}
    </>
  );
}

export default SystemsWorkspacePane;
