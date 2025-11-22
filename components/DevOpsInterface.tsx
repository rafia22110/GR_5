
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const REQUIREMENTS_TXT = `requests
PyGithub
gitpython
`;

// --- Python Scripts (Legacy Mode) ---
const PYTHON_SCRIPT_EN = `import os
import sys
import time
import argparse
from pathlib import Path
import requests
from github import Github, GithubException
from git import Repo, GitCommandError
`;

const PYTHON_SCRIPT_HE = `import os
`;

interface LogEntry {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
  } catch (e) {
    return undefined;
  }
}

const DevOpsInterface: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const { plan } = useAuth();
  const [mode, setMode] = useState<'web' | 'cli'>('web');
  
  // Legacy CLI State
  const scriptContent = language === 'he' ? PYTHON_SCRIPT_HE : PYTHON_SCRIPT_EN;
  const [repoName, setRepoName] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [token, setToken] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Web Deployer State
  const [deployFiles, setDeployFiles] = useState<FileList | null>(null);
  const [webRepoName, setWebRepoName] = useState('');
  
  // Initialize from LocalStorage or Env
  const [webToken, setWebToken] = useState(() => {
     return getEnv('GITHUB_TOKEN') || localStorage.getItem('gh_token') || '';
  });
  const [showToken, setShowToken] = useState(false);
  const [saveToken, setSaveToken] = useState(true);
  const [tokenVerified, setTokenVerified] = useState(false);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployLogs, setDeployLogs] = useState<LogEntry[]>([]);
  const [finalRepoUrl, setFinalRepoUrl] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Domain State
  const [useCustomDomain, setUseCustomDomain] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  
  // Subdomain state
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  
  // Usage Limits State
  const [limitReached, setLimitReached] = useState(false);
  
  // Tabs & Preview
  const [activeTab, setActiveTab] = useState<'terminal' | 'preview'>('terminal');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const TOKEN_URL = "https://github.com/settings/tokens/new?scopes=repo,workflow,user";

  // --- Persistence Effect ---
  useEffect(() => {
    if (saveToken && webToken) {
        localStorage.setItem('gh_token', webToken);
    } else if (!saveToken) {
        localStorage.removeItem('gh_token');
    }
    // Reset verification when token changes
    setTokenVerified(false);
  }, [webToken, saveToken]);

  // --- Preview Logic ---
  useEffect(() => {
    if (deployFiles && deployFiles.length > 0) {
      const fileArray = Array.from(deployFiles);
      const indexFile = fileArray.find(f => f.name === 'index.html' || f.webkitRelativePath.endsWith('index.html'));
      
      if (indexFile) {
         const reader = new FileReader();
         reader.onload = async (e) => {
            let html = e.target?.result as string;
            
            // Try to inject CSS files locally for preview
            // This is a basic simulation to make the preview look better
            const cssFiles = fileArray.filter(f => f.name.endsWith('.css') || f.webkitRelativePath.endsWith('.css'));
            for (const cssFile of cssFiles) {
                const cssContent = await new Promise<string>(resolve => {
                    const r = new FileReader();
                    r.onload = ev => resolve(ev.target?.result as string);
                    r.readAsText(cssFile);
                });
                html = html.replace('</head>', `<style>${cssContent}</style></head>`);
            }
            
            setPreviewSrc(html);
            setActiveTab('preview'); // Auto-switch to preview on select
         };
         reader.readAsText(indexFile);
      } else {
        setPreviewSrc(null);
        setActiveTab('terminal');
      }
    }
  }, [deployFiles]);


  // --- Helpers ---
  const addLog = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDeployLogs(prev => [...prev, { message: msg, type, timestamp }]);
    // Auto switch to terminal on log activity if not already there
    if (type !== 'info') setActiveTab('terminal');
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [deployLogs]);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateCommand = () => {
    const scriptName = 'devops_agent.py';
    const repoPart = repoName ? `--name "${repoName.trim()}"` : '--name "my-repo"';
    const dirPart = localPath ? `--dir "${localPath}"` : '--dir "./"';
    const tokenPart = token ? `--token "${token.trim()}"` : '';
    const privatePart = isPrivate ? '--private' : '';
    return `python ${scriptName} ${dirPart} ${repoPart} ${tokenPart} ${privatePart}`.replace(/\s+/g, ' ').trim();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleProvisionDomain = () => {
    setIsProvisioning(true);
    // For GitHub Pages, the URL is deterministic, no simulation needed.
    if (finalRepoUrl) {
         const urlParts = finalRepoUrl.replace("https://github.com/", "").split("/");
         if (useCustomDomain && customDomain) {
             setLiveUrl(`https://${customDomain}`);
         } else if (urlParts.length === 2) {
             // username.github.io/repo
            setLiveUrl(`https://${urlParts[0]}.github.io/${urlParts[1]}/`);
         }
    }
    setIsProvisioning(false);
  };

  // --- Robust Fetch Helper ---
  const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, options);
        if (res.status === 403 || res.status === 429) {
           // Rate limited, wait longer
           await new Promise(r => setTimeout(r, delay * 2));
           continue;
        }
        return res;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw new Error("Fetch failed after retries");
  };

  // --- Verify Token ---
  const verifyToken = async (): Promise<boolean> => {
    if (!webToken) return false;
    try {
        const res = await fetch('https://api.github.com/user', {
            headers: { 
                Authorization: `token ${webToken.trim()}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        if (res.ok) {
            const data = await res.json();
            addLog(`Token Verified! Connected as: ${data.login}`, 'success');
            setTokenVerified(true);
            return true;
        } else {
            addLog(`Token Verification Failed: ${res.statusText}`, 'error');
            setTokenVerified(false);
            return false;
        }
    } catch (e) {
        addLog(`Connection Failed: ${(e as Error).message}`, 'error');
        setTokenVerified(false);
        return false;
    }
  };

  // --- Check Usage Limits ---
  const checkUsageLimit = (): boolean => {
      const historyStr = localStorage.getItem('deploy_history');
      const history: number[] = historyStr ? JSON.parse(historyStr) : [];
      const now = Date.now();

      if (plan === 'free') {
          // 3 uploads total, 1 per week.
          if (history.length >= 3) return false;
          if (history.length > 0) {
              const lastUpload = history[history.length - 1];
              const daysDiff = (now - lastUpload) / (1000 * 60 * 60 * 24);
              if (daysDiff < 7) return false;
          }
      } else if (plan === 'pro') {
          // 50 per month
          const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
          const uploadsThisMonth = history.filter(ts => ts > monthAgo);
          if (uploadsThisMonth.length >= 50) return false;
      }
      return true;
  };

  const incrementUsage = () => {
      const historyStr = localStorage.getItem('deploy_history');
      const history: number[] = historyStr ? JSON.parse(historyStr) : [];
      history.push(Date.now());
      localStorage.setItem('deploy_history', JSON.stringify(history));
  };


  // --- Web Deployer Logic ---
  const handleWebDeploy = async () => {
    if (!checkUsageLimit()) {
        setLimitReached(true);
        return;
    }

    if (!webToken || !webRepoName || !deployFiles || deployFiles.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }
    
    // Switch to terminal view for logs
    setActiveTab('terminal');

    const sanitizedToken = webToken.trim();
    const sanitizedRepoName = webRepoName.trim();

    setIsDeploying(true);
    setDeployLogs([]);
    setFinalRepoUrl(null);
    setLiveUrl(null);
    addLog(t.devops.logs.start, 'info');

    // Auto-Verify if not done
    let currentVerified = tokenVerified;
    if (!currentVerified) {
        addLog("Auto-verifying token...", 'info');
        currentVerified = await verifyToken();
        if (!currentVerified) {
            setIsDeploying(false);
            alert("Token validation failed. Please check your GitHub token.");
            return;
        }
    }

    const readFileAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
           const content = e.target?.result as string;
           const base64 = content.split(',')[1];
           resolve(base64);
        };
        reader.readAsDataURL(file);
      });
    };

    const readFileAsText = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(file);
      });
    };

    try {
      // 1. Analyze Files
      addLog(t.devops.logs.analyzing, 'info');
      let detectedLang = 'unknown';
      let hasDockerfile = false;
      let hasWorkflow = false;
      let isVite = false;
      let pkgText = '';
      
      const fileArray = Array.from(deployFiles);
      const fileNames = fileArray.map(f => f.webkitRelativePath || f.name);

      const hasIndexHtml = fileNames.some(n => n.endsWith('index.html'));
      if (!hasIndexHtml) {
         addLog('[WARNING] No index.html found! Deployment might fail.', 'warning');
      }

      const packageJsonFile = fileArray.find(f => f.name === 'package.json' || (f.webkitRelativePath && f.webkitRelativePath.endsWith('/package.json')));
      
      if (packageJsonFile) {
         detectedLang = 'node';
         try {
           pkgText = await readFileAsText(packageJsonFile);
           if (pkgText.includes('"vite"') || pkgText.includes("'vite'")) {
             isVite = true;
           }
         } catch (e) { }
      } else if (fileNames.some(n => n.includes('requirements.txt'))) {
        detectedLang = 'python';
      }
      
      if (fileNames.some(n => n.endsWith('Dockerfile'))) hasDockerfile = true;
      if (fileNames.some(n => n.includes('.github/workflows'))) hasWorkflow = true;

      addLog(`${t.devops.logs.detected} ${detectedLang.toUpperCase()}${isVite ? ' (Vite/React)' : ''}`, 'success');

      // 2. Generate Infra (Memory)
      addLog(t.devops.logs.generating, 'info');
      let dockerfileContent = '';
      let workflowContent = '';

      if (!hasDockerfile && detectedLang === 'node') {
          dockerfileContent = `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]`;
      }

      // WORKFLOW GENERATION FOR GITHUB PAGES
      if (!hasWorkflow) {
        if (detectedLang === 'node') {
            // Force Base path for Vite
            const buildCommand = isVite 
              ? `npm install && npx vite build --base /${sanitizedRepoName}/`
              : `npm install && npm run build`;
            
            workflowContent = `name: Deploy to GitHub Pages
on:
  push:
    branches: ["main"]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Install and Build
        run: ${buildCommand}
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
        } else {
            // Static HTML/CSS
            workflowContent = `name: Deploy Static Content
on:
  push:
    branches: ["main"]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: false
jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
        }
      }

      // 3. Create Repo
      addLog(t.devops.logs.creatingRepo, 'info');
      
      const userResp = await fetchWithRetry('https://api.github.com/user', {
        headers: { 
            Authorization: `token ${sanitizedToken}`,
            Accept: 'application/vnd.github.v3+json'
        }
      });
      
      if (!userResp.ok) throw new Error("GitHub Token Invalid or Network Error");
      const user = await userResp.json();

      const repoResp = await fetchWithRetry('https://api.github.com/user/repos', {
        method: 'POST',
        headers: { 
          Authorization: `token ${sanitizedToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: sanitizedRepoName, 
          private: false,
          auto_init: true 
        })
      });
      
      if (!repoResp.ok && repoResp.status !== 422) {
        throw new Error(`Failed to create repo: ${repoResp.statusText}`);
      }

      // Wait for repo to be available
      await new Promise(r => setTimeout(r, 2000));
      const repoUrl = `https://github.com/${user.login}/${sanitizedRepoName}`;
      setFinalRepoUrl(repoUrl);

      // 4. Enable Pages
      addLog("Activating GitHub Pages...", 'info');
      try {
        await fetchWithRetry(`https://api.github.com/repos/${user.login}/${sanitizedRepoName}/pages`, {
          method: 'POST',
          headers: { 
            Authorization: `token ${sanitizedToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.switcheroo-preview+json'
          },
          body: JSON.stringify({ source: { branch: "main", path: "/" } })
        });
      } catch (e) { }

      // 5. Upload Files Logic
      addLog(t.devops.logs.uploading, 'info');
      
      const uploadToGithub = async (path: string, contentBase64: string) => {
        const encodedPath = path.split('/').map(p => encodeURIComponent(p)).join('/');
        const apiUrl = `https://api.github.com/repos/${user.login}/${sanitizedRepoName}/contents/${encodedPath}`;
        
        let sha = undefined;
        try {
           const check = await fetch(`https://api.github.com/repos/${user.login}/${sanitizedRepoName}/contents/${encodedPath}`, {
             headers: { Authorization: `token ${sanitizedToken}` }
           });
           if (check.ok) {
             const data = await check.json();
             sha = data.sha;
           }
        } catch (e) {}

        const res = await fetch(apiUrl, {
          method: 'PUT',
          headers: { 
            Authorization: `token ${sanitizedToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Update via GitRocket',
            content: contentBase64,
            sha: sha
          })
        });
        
        if (!res.ok) throw new Error(`Failed to upload ${path}`);
      };

      await uploadToGithub('.nojekyll', btoa(''));
      
      if (useCustomDomain && customDomain.trim()) {
          await uploadToGithub('CNAME', btoa(customDomain.trim()));
      }
      
      if (isVite) {
          const configContent = `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nexport default defineConfig({\n  base: '/${sanitizedRepoName}/',\n  plugins: [react()],\n})`;
          await uploadToGithub('vite.config.js', btoa(configContent));
      }

      const filteredFiles = fileArray.filter(f => {
        const path = f.webkitRelativePath || f.name;
        return !path.includes('node_modules') && !path.includes('.git') && !path.includes('dist') && !path.includes('.next');
      });

      const maxFiles = 20; 
      if (filteredFiles.length > maxFiles) {
        addLog(`[WARN] Uploading top ${maxFiles} files. Large projects should use CLI.`, 'warning');
      }

      let uploadedCount = 0;
      for (const file of filteredFiles.slice(0, maxFiles)) {
        const path = file.webkitRelativePath || file.name;
        const cleanPath = path.split('/').slice(1).join('/') || path; 
        if (!cleanPath) continue; 

        const content = await readFileAsBase64(file);
        await uploadToGithub(cleanPath, content);
        
        uploadedCount++;
        if (uploadedCount % 3 === 0) {
             addLog(`Uploaded ${uploadedCount} files...`, 'info');
             await new Promise(r => setTimeout(r, 500)); 
        }
      }

      if (!hasWorkflow && workflowContent) {
        await uploadToGithub('.github/workflows/ci_cd.yml', btoa(workflowContent));
      }

      incrementUsage();
      addLog(t.devops.logs.done, 'success');
      setIsDeploying(false);

    } catch (err: any) {
      console.error(err);
      addLog(`${t.devops.logs.error} ${err.message}`, 'error');
      setIsDeploying(false);
    }
  };

  return (
    <div className="h-full bg-gemini-bg text-gray-200 p-6 overflow-y-auto" dir={dir}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {limitReached && (
           <div className="bg-red-900/20 border border-red-500 rounded-xl p-4 flex items-center gap-4">
              <h4 className="font-bold text-red-400">{t.devops.web.limitReached}</h4>
           </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              {t.devops.title}
            </h2>
            <p className="text-gray-400 mt-2 text-lg">{t.devops.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
             {/* Config */}
             <div className="bg-gemini-surface border border-gray-700 p-6 rounded-2xl shadow-xl space-y-6">
                
                <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-300">{t.devops.web.tokenLabel}</label>
                    </div>
                    <div className="flex gap-2">
                        <input 
                           type={showToken ? "text" : "password"}
                           value={webToken} 
                           onChange={(e) => setWebToken(e.target.value)}
                           placeholder="ghp_..."
                           className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                        />
                        <button
                           onClick={() => setShowToken(!showToken)}
                           className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 hover:text-white"
                        >
                           {showToken ? 'Hide' : 'Show'}
                        </button>
                        <button
                           onClick={verifyToken}
                           className={`px-4 py-2 rounded-lg font-bold text-sm border ${tokenVerified ? 'bg-green-600 border-green-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
                        >
                            {tokenVerified ? 'Verified ✓' : 'Verify'}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.devops.web.repoLabel}</label>
                    <input 
                       type="text" 
                       value={webRepoName} 
                       onChange={(e) => setWebRepoName(e.target.value)}
                       className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.devops.web.folderLabel}</label>
                    <div className="relative group">
                       <input 
                          type="file" 
                          webkitdirectory=""
                          directory=""
                          onChange={(e) => setDeployFiles(e.target.files)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       />
                       <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                         deployFiles ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 group-hover:border-cyan-400 group-hover:bg-gray-800'
                       }`}>
                          <span className="font-medium text-gray-300">
                               {deployFiles ? `${deployFiles.length} files selected` : t.devops.web.folderBtn}
                          </span>
                       </div>
                    </div>
                </div>

                <button 
                  onClick={handleWebDeploy}
                  disabled={limitReached || isDeploying || !webRepoName || !deployFiles}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                    isDeploying 
                      ? 'bg-gray-700 text-gray-400 cursor-wait' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-[1.02]'
                  }`}
                >
                  {isDeploying ? t.devops.web.deploying : t.devops.web.deployBtn}
                </button>
             </div>

             {/* Output Section with Tabs */}
             <div className="flex flex-col gap-4 h-[500px]">
                <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl flex flex-col flex-1 overflow-hidden shadow-lg">
                   {/* Tabs Header */}
                   <div className="bg-[#252526] border-b border-black flex">
                      <button 
                        onClick={() => setActiveTab('terminal')}
                        className={`px-4 py-2 text-xs font-bold font-mono border-r border-black transition-colors ${
                            activeTab === 'terminal' ? 'bg-[#1e1e1e] text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                          {t.devops.web.tabs.terminal}
                      </button>
                      <button 
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-2 text-xs font-bold font-mono border-r border-black transition-colors ${
                            activeTab === 'preview' ? 'bg-[#1e1e1e] text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                          {t.devops.web.tabs.preview}
                      </button>
                   </div>

                   {/* Tab Content */}
                   <div className="flex-1 overflow-hidden relative">
                       {activeTab === 'terminal' && (
                           <div ref={terminalRef} className="absolute inset-0 overflow-y-auto p-4 font-mono text-xs leading-relaxed" dir="ltr">
                              {deployLogs.map((log, i) => (
                                  <div key={i} className={`${
                                    log.type === 'error' ? 'text-red-400' : 
                                    log.type === 'success' ? 'text-green-400' : 
                                    'text-gray-300'
                                  }`}>
                                     [{log.timestamp}] {log.message}
                                  </div>
                              ))}
                           </div>
                       )}

                       {activeTab === 'preview' && (
                           <div className="absolute inset-0 bg-white">
                               {previewSrc ? (
                                   <iframe 
                                      srcDoc={previewSrc}
                                      className="w-full h-full border-none"
                                      title="Local Preview"
                                      sandbox="allow-scripts" 
                                   />
                               ) : (
                                   <div className="flex items-center justify-center h-full text-gray-500 text-sm p-4 text-center">
                                       {t.devops.web.previewHint}
                                   </div>
                               )}
                           </div>
                       )}
                   </div>
                </div>

                {finalRepoUrl && !isDeploying && (
                   <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between animate-fadeIn">
                      <div>
                           <h4 className="font-bold text-white">{t.devops.web.success}</h4>
                           <a href={finalRepoUrl} target="_blank" rel="noreferrer" className="text-xs text-green-400 hover:underline">{finalRepoUrl}</a>
                      </div>
                      <div className="flex gap-2">
                         {!liveUrl ? (
                           <button 
                             onClick={handleProvisionDomain}
                             className="px-3 py-2 border border-cyan-500/50 text-cyan-400 text-sm font-bold rounded-lg"
                           >
                              {isProvisioning ? 'Checking...' : 'Get Live URL'}
                           </button>
                         ) : (
                           <a href={liveUrl} target="_blank" rel="noreferrer" className="px-3 py-2 bg-cyan-600 text-white text-sm font-bold rounded-lg">
                              {t.devops.web.openApp}
                           </a>
                         )}
                      </div>
                   </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default DevOpsInterface;
