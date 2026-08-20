import appConfig from "../../config/app.js";
import ModelSelector from "../settings/ModelSelector.jsx";
import { MenuIcon, SettingsIcon } from "../common/icons.jsx";
import "./Header.css";

function Header({ onOpenSettings, onToggleSidebar }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <button
          type="button"
          className="app-header__menu-button"
          onClick={onToggleSidebar}
          aria-label="Toggle conversations sidebar"
        >
          <MenuIcon />
        </button>
        <span className="app-header__name">{appConfig.name}</span>
      </div>

      <div className="app-header__actions">
        <ModelSelector />

        <button
          type="button"
          className="app-header__icon-button"
          onClick={onOpenSettings}
          aria-label="Open settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </header>
  );
}

export default Header;
