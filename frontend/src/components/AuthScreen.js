function AuthScreen({
  authForm,
  authLoading,
  authMode,
  authSubmitting,
  error,
  handleAuthChange,
  handleAuthSubmit,
  setAuthMode,
  successMessage,
}) {
  if (authLoading) {
    return (
      <div className="auth-shell">
        <div className="auth-terminal">
          <span className="eyebrow">LCARS ACCESS NODE</span>
          <h1>Voyager Vital Databases</h1>
          <p>Establishing secure link to protected ship records.</p>
          <div className="auth-status-pill">Authorizing Terminal...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-terminal">
        <div className="auth-terminal-header">
          <div>
            <span className="eyebrow">LCARS ACCESS NODE</span>
            <h1>Voyager Vital Databases</h1>
          </div>
          <div className="auth-status-pill">{authMode === 'login' ? 'Secure Sign-In' : 'New Access Request'}</div>
        </div>

        <p className="auth-copy">
          Authorization is required before records, medical charts, and ship systems can be accessed. Enter your access ID and authorization code to continue.
        </p>

        {error ? <div className="banner error">{error}</div> : null}
        {successMessage ? <div className="banner success">{successMessage}</div> : null}

        <div className="detail-tabs auth-tabs">
          <button type="button" className={`detail-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Access Existing Account</button>
          <button type="button" className={`detail-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Create Access Node</button>
        </div>

        <form className="action-form auth-form" onSubmit={handleAuthSubmit}>
          <label className="control">
            <span>Access ID</span>
            <input type="email" name="email" value={authForm.email} onChange={handleAuthChange} placeholder="captain@voyagerdb.com" required />
          </label>

          <label className="control">
            <span>Authorization Code</span>
            <input type="password" name="password" value={authForm.password} onChange={handleAuthChange} placeholder="Enter secure code" required />
          </label>

          {authMode === 'register' ? (
            <label className="control">
              <span>Confirm Authorization Code</span>
              <input type="password" name="confirmPassword" value={authForm.confirmPassword} onChange={handleAuthChange} placeholder="Repeat secure code" required />
            </label>
          ) : null}

          <button className="submit-button auth-submit" type="submit" disabled={authSubmitting}>
            {authSubmitting
              ? 'Validating Credentials...'
              : authMode === 'login'
                ? 'Access Voyager Records'
                : 'Create Access Node'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthScreen;
