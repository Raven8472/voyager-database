const WORKSPACE_BUTTONS = [
  { id: 'personnel', label: 'Personnel' },
  { id: 'medical', label: 'Medical' },
  { id: 'transporter', label: 'Transporter' },
  { id: 'replicator', label: 'Replicator' },
  { id: 'holodeck', label: 'Holodeck' },
  { id: 'systems', label: 'Ship Systems' },
];

function LcarsShell({
  activeWorkspace,
  apiBaseUrl,
  children,
  currentUser,
  error,
  handleLogout,
  health,
  recentActionCount,
  setActiveWorkspace,
  successMessage,
  workspaceMode,
  workspaceTitle,
}) {
  return (
    <div className="app-shell">
      <aside className="lcars-rail">
        <div className="rail-block rail-brand">
          <span className="eyebrow">USS VOYAGER</span>
          <h1>Records Console</h1>
          <p>File and records officer workstation for live personnel updates.</p>
        </div>

        <div className="rail-stack">
          {WORKSPACE_BUTTONS.map((workspace) => (
            <button
              key={workspace.id}
              className={`rail-button ${activeWorkspace === workspace.id ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveWorkspace(workspace.id)}
            >
              {workspace.label}
            </button>
          ))}
        </div>

        <div className="rail-block rail-status">
          <span className="eyebrow">System Status</span>
          <p>User: {currentUser.email}</p>
          <p>API: {health ? health.status.toUpperCase() : 'CHECKING'}</p>
          <p>Action Log: {health?.personnel_actions_ready ? 'READY' : 'SCHEMA NEEDED'}</p>
          <p>Auth: {health?.auth_ready ? 'READY' : 'SCHEMA NEEDED'}</p>
          <p>Recent Actions: {recentActionCount}</p>
          <button className="page-button rail-logout" type="button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>

      <main className="lcars-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">LCARS WORKSTATION</span>
            <h2>{workspaceTitle}</h2>
          </div>
          <div className="topbar-meta">
            <span>Active Role: Records Officer</span>
            <span>Mode: {workspaceMode}</span>
            <span>API: {apiBaseUrl}</span>
          </div>
        </header>

        {error ? <div className="banner error">{error}</div> : null}
        {successMessage ? <div className="banner success">{successMessage}</div> : null}

        {children}
      </main>
    </div>
  );
}

export default LcarsShell;
