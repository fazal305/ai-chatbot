import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import "./AppShell.css";

/**
 * Top-level layout: header across the top, sidebar + main content below.
 * Below the tablet breakpoint the sidebar becomes an off-canvas drawer
 * (see AppShell.css) — `isSidebarOpen` controls it and only matters on
 * those narrower layouts; desktop CSS ignores it and keeps the sidebar
 * always visible.
 */
function AppShell({ children, onOpenSettings, isSidebarOpen, onToggleSidebar, onCloseSidebar }) {
  return (
    <div className="app-shell">
      <Header onOpenSettings={onOpenSettings} onToggleSidebar={onToggleSidebar} />
      <div className="app-shell__body">
        <Sidebar isOpen={isSidebarOpen} onNavigate={onCloseSidebar} />
        {isSidebarOpen && (
          <div className="app-shell__backdrop" onClick={onCloseSidebar} aria-hidden="true" />
        )}
        <main className="app-shell__main" aria-label="Chat">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
