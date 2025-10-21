// src/App.js (Corrected Imports and Export)
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react";
import "./App.css"; // Main CSS
import "./Header.css"; // Header CSS
import "./Auth.css"; // Auth CSS
import { useState, useEffect, useRef, useCallback } from "react"; // <-- Saare Hooks Import Karein
import axios from "axios";
import { FaTrash, FaFileCode, FaFolder, FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa"; // <-- Saare Icons Import Karein
import Header from "./Header";
import Auth from "./Auth";

const API_BASE_URL = "http://localhost:5000/api";

const initialFiles = {
  "/App.js": `export default function App() {
  return <h1>Hello! Create or load a project.</h1>
}`,
  "/index.js": `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  "/styles.css": `body {
  font-family: sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.2s, color 0.2s;
}
h1 { color: var(--text-highlight); }`,
};

// --- Axios Interceptor ---
let interceptorId = null;
const setupAxiosInterceptor = (token) => {
  if (interceptorId !== null) {
      axios.interceptors.request.eject(interceptorId);
  }
  interceptorId = axios.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};


/* --- Component 1: File Explorer (With Rename) --- */
function FileExplorer() {
  const { sandpack } = useSandpack();
  const [newFileName, setNewFileName] = useState("");
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef(null);

  const handleRename = async (originalName) => {
    const newNameTrimmed = renameValue.trim();
    if (!newNameTrimmed || newNameTrimmed === originalName.substring(1)) {
        setRenamingFile(null);
        return;
    }

    let finalNewName = newNameTrimmed;
    if (!finalNewName.startsWith('/')) {
        finalNewName = '/' + finalNewName;
    }

    try {
        if (sandpack.files[finalNewName]) {
            alert(`A file named "${finalNewName.substring(1)}" already exists.`);
            setRenamingFile(null);
            return;
        }

        const fileContent = sandpack.files[originalName]?.code;

        if (typeof fileContent === 'string') {
             sandpack.addFile(finalNewName, fileContent);
             sandpack.deleteFile(originalName);

             if (sandpack.activeFile === originalName) {
                 sandpack.setActiveFile(finalNewName);
             }
             console.log(`Renamed (locally): ${originalName} -> ${finalNewName}`);
        } else {
             console.error("Could not get file content for renaming.");
        }
    } catch (error) {
        console.error("Error during local rename:", error);
        alert("Error renaming file locally.");
    } finally {
        setRenamingFile(null);
    }
     // TODO: Make rename persistent using backend API
  };

  const handleDoubleClick = (fileName) => {
    setRenamingFile(fileName);
    setRenameValue(fileName.substring(1));
  };

  useEffect(() => {
    if (renamingFile && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingFile]);

  const handleRenameChange = (e) => {
    setRenameValue(e.target.value);
  };

  const handleRenameSubmit = (fileName) => {
     handleRename(fileName);
  };
  const handleBlur = (fileName) => {
      setTimeout(() => {
          if (renamingFile === fileName) {
             handleRename(fileName);
          }
      }, 100);
  };


  const handleAddFile = () => {
    let fileName = newFileName.trim();
    if (!fileName) return;
    const isFile = fileName.includes('.');
    if (!fileName.startsWith("/")) {
      fileName = "/" + fileName;
    }
    if (sandpack.files[fileName]) {
      alert("File or folder with this name already exists!");
    } else {
       if (isFile) {
           sandpack.addFile(fileName, "// Start coding...");
           sandpack.setActiveFile(fileName);
       } else {
           alert("Creating folders is not supported in this simple setup.");
       }
      setNewFileName("");
    }
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <h3>Explorer</h3>
      </div>
      <div className="file-list">
        {Object.keys(sandpack.files)
          .sort()
          .map((fileName) => {
            const isFile = fileName.includes('.') || !fileName.endsWith('/');
            const isRenamingThisFile = renamingFile === fileName;

            return (
              <div key={fileName} className="file-item">
                {isRenamingThisFile ? (
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={handleRenameChange}
                    onBlur={() => handleBlur(fileName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(fileName);
                      if (e.key === 'Escape') setRenamingFile(null);
                    }}
                    className="rename-input"
                  />
                ) : (
                  <button
                    className={`file-button ${
                      fileName === sandpack.activeFile ? "active" : ""
                    }`}
                    onClick={() => sandpack.setActiveFile(fileName)}
                    onDoubleClick={() => handleDoubleClick(fileName)}
                    title={fileName.substring(1)}
                  >
                    <span className="file-icon">
                      {isFile ? <FaFileCode size={12} /> : <FaFolder size={12} />}
                    </span>
                    {fileName.substring(1)}
                  </button>
                )}
                {!isRenamingThisFile && (
                    <button
                        className="delete-button"
                        title={`Delete ${fileName.substring(1)}`}
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${fileName.substring(1)}?`)) {
                                if (sandpack.activeFile === fileName) {
                                    const otherFile = Object.keys(sandpack.files).find(f => f !== fileName && f !== '/index.js') || '/App.js';
                                    sandpack.setActiveFile(otherFile);
                                }
                                sandpack.deleteFile(fileName);
                            }
                        }}
                        >
                        <FaTrash size={12} />
                    </button>
                )}
              </div>
            );
        })}
      </div>
      <div className="add-file-container">
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="New file (e.g., /utils.js)"
        />
        <button className="add-button" onClick={handleAddFile}>
          + Add File
        </button>
      </div>
    </div>
  );
}

/* --- Component 2: MainApp (IDE) --- */
function MainApp({ theme, toggleTheme, onLogout }) {
  const { sandpack } = useSandpack();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(false);
  const autosaveTimeoutRef = useRef(null);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Could not fetch projects:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createNewProject = async () => {
    const projectName = prompt("Enter new project name:");
    if (!projectName?.trim()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/projects`, {
        name: projectName.trim(),
        files: initialFiles,
      });
      alert("Project created successfully!");
      await fetchProjects();
      setActiveProjectId(response.data.projectId);
      sandpack.resetFiles(initialFiles);
    } catch (error) {
      alert("Error creating project: " + error.response?.data?.message || error.message);
    }
  };

  const loadProject = useCallback(async (projectId) => {
    setActiveProjectId(projectId);
    if (!projectId) {
      sandpack.resetFiles(initialFiles);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
      sandpack.resetFiles(response.data);
    } catch (error) {
      alert("Error loading project.");
      setActiveProjectId(null);
    }
  }, [sandpack]);

  const saveProject = useCallback(async () => {
    if (!activeProjectId) {
      console.warn("No active project ID, cannot save.");
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/projects/${activeProjectId}`, {
        files: sandpack.files,
      });
      console.log("Project Saved!");
    } catch (error) {
      console.error("Error saving project:", error);
    }
  }, [activeProjectId, sandpack.files]);

  useEffect(() => {
    if (!isAutosaveEnabled || !activeProjectId) {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
      return;
    }

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(() => {
      console.log("Autosaving...");
      saveProject();
    }, 2500);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [sandpack.files, isAutosaveEnabled, activeProjectId, saveProject]);

  const handleToggleAutosave = () => {
    setIsAutosaveEnabled((prev) => {
        const newState = !prev;
        if (!newState && autosaveTimeoutRef.current) {
            clearTimeout(autosaveTimeoutRef.current);
        }
        return newState;
    });
  };


  return (
    <div className={`main-wrapper ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <Header
        projects={projects}
        onLoadProject={loadProject}
        onNewProject={createNewProject}
        onSaveProject={saveProject}
        activeProjectId={activeProjectId}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={onLogout}
        isAutosaveEnabled={isAutosaveEnabled}
        onToggleAutosave={handleToggleAutosave}
      />
      <div className="app-container">
          <FileExplorer /> {/* <-- FileExplorer yahaan use ho raha hai */}
          <div className="editor-preview-wrapper">
            <div className="editor-container">
              <SandpackCodeEditor
                showTabs={false}
                showLineNumbers={true}
                wrapContent={true}
              />
            </div>
            <div className="preview-container">
              <SandpackPreview showRefreshButton={true} />
            </div>
          </div>
        </div>
    </div>
  );
}

/* --- Component 3: App (Provider aur Auth) --- */
// Yeh main component hai jo index.js import karta hai
export default function App() { // <-- Yeh Default Export hai
  const [theme, setTheme] = useState("dark");
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      setupAxiosInterceptor(token);
    }
     return () => {
        if (interceptorId !== null) {
            axios.interceptors.request.eject(interceptorId);
            interceptorId = null;
        }
    };
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    setupAxiosInterceptor(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setupAxiosInterceptor(null);
  };

  useEffect(() => {
      document.body.className = theme === 'dark' ? 'theme-dark' : '';
  }, [theme]);


  if (!authToken) {
    return (
      <div className={`main-wrapper ${theme === 'dark' ? 'theme-dark' : ''}`}>
        <Auth onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <SandpackProvider
      template="react"
      files={initialFiles}
      theme={theme}
    >
      <SandpackLayout>
        <MainApp
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}