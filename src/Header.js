// src/Header.js (Modern UI with Icons)
import React from 'react';
import { FaMoon, FaSun, FaSignOutAlt, FaSave, FaPlus, FaCaretDown } from 'react-icons/fa'; // Added icons
import './Header.css';

function Header({
  projects,
  onLoadProject,
  onNewProject,
  onSaveProject,
  activeProjectId,
  theme,
  toggleTheme,
  onLogout,
  isAutosaveEnabled,
  onToggleAutosave,
}) {
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    onLoadProject(projectId);
  };

  const activeProjectName = projects.find(p => p._id === activeProjectId)?.name || "Select Project";

  return (
    <nav className="header">
      <div className="header-left">
        <h1 className="header-title">CipherStudio <span className="title-icon">🚀</span></h1>
      </div>

      <div className="header-center">
         {/* Custom styled dropdown appearance */}
         <div className="project-select-wrapper">
             <select
               className="project-dropdown"
               value={activeProjectId || ""}
               onChange={handleProjectChange}
               title={activeProjectName} // Show full name on hover
             >
               <option value="" disabled={!!activeProjectId}>-- Select a Project --</option>
               {projects.map((project) => (
                 <option key={project._id} value={project._id}>
                   {project.name}
                 </option>
               ))}
             </select>
             <FaCaretDown className="dropdown-arrow" />
         </div>

        <button className="icon-button new-project-button" onClick={onNewProject} title="New Project">
          <FaPlus /> New
        </button>

        <button className="icon-button save-button-header" onClick={onSaveProject} title="Save Project">
          <FaSave /> Save
        </button>
      </div>

      <div className="header-right">
        <div className="autosave-toggle" title="Toggle Autosave">
          <label htmlFor="autosave-switch">Autosave</label>
          <label className="switch">
            <input
              id="autosave-switch"
              type="checkbox"
              checked={isAutosaveEnabled}
              onChange={onToggleAutosave}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <button className="icon-button theme-toggle-button-header" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
        <button className="icon-button logout-button-header" onClick={onLogout} title="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
}

export default Header;