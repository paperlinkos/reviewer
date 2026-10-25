import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';

function Popup() {
  const [apiUrl, setApiUrl] = useState(''); const [status, setStatus] = useState('Inactive');
  useEffect(() => { void chrome.storage.local.get('apiUrl').then(({ apiUrl: value }) => setApiUrl(value ?? 'http://localhost:3001')); }, []);
  const toggle = () => void chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { type: 'toggle-review' }, () => {
      if (chrome.runtime.lastError) chrome.scripting.executeScript({ target: { tabId: tab.id! }, files: ['content-scripts/content.js'] }, () => chrome.tabs.sendMessage(tab.id!, { type: 'toggle-review' }));
    }); setStatus('Toggled on current page');
  });
  return <main style={{ width: 300, padding: 16, fontFamily: 'system-ui' }}><h1 style={{ fontSize: 18 }}>Visual Feedback</h1><p>{status}. Nothing is captured until you deliberately place a pin.</p><button type="button" onClick={toggle}>Toggle review mode</button><label>API URL<input aria-label="API URL" value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} style={{ display: 'block', width: '100%', marginTop: 6 }} /></label><button type="button" onClick={() => void chrome.storage.local.set({ apiUrl })} style={{ marginTop: 12 }}>Save setting</button></main>;
}
createRoot(document.getElementById('root')!).render(<Popup />);
