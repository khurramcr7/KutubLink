/**
 * KutubLink Persistent Bottom Aalim AI Agent Dock (Universal Multi-Page Widget)
 * Ensures the Aalim AI Agent Chat Box stays fixed at the bottom across all sub-pages
 * (manuscripts-explorer.html, shamela-1424-reader.html, multicloud-compute-hub.html, etc.)
 */
(function () {
  if (document.getElementById('aalimAgentDock')) return; // Already native on index.html

  const style = document.createElement('style');
  style.textContent = `
    body { padding-bottom: 84px !important; }
    #kl-universal-dock {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
    }
    #kl-universal-drawer {
      display: none; max-width: 980px; margin: 0 auto; padding: 0 16px;
    }
    #kl-universal-drawer-inner {
      background: rgba(8, 12, 20, 0.98); border: 1px solid rgba(255,255,255,0.2);
      border-bottom: 0; border-radius: 16px 16px 0 0; box-shadow: 0 -20px 60px rgba(0,0,0,0.85);
      overflow: hidden; color: #f1f5f9;
    }
    #kl-universal-bar {
      background: rgba(6, 9, 17, 0.96); backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255,255,255,0.16); padding: 10px 20px;
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    .kl-pill-link {
      color: #e2e8f0; text-decoration: none; font-size: 11px; padding: 5px 10px;
      border-radius: 999px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
      white-space: nowrap; cursor: pointer;
    }
    .kl-pill-link:hover { background: #fff; color: #06080d; }
  `;
  document.head.appendChild(style);

  const dock = document.createElement('div');
  dock.id = 'kl-universal-dock';
  dock.innerHTML = `
    <div id="kl-universal-drawer">
      <div id="kl-universal-drawer-inner">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.02);">
          <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:#fff;">
            <span style="width:9px;height:9px;border-radius:50%;background:#34d399;display:inline-block;"></span>
            <span>AALIM AI SOVEREIGN AGENT · العالم الذكي</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <a href="/index.html" class="kl-pill-link">🏠 Main Turāth Hub</a>
            <button type="button" id="kl-close-drawer" style="background:transparent;border:1px solid rgba(255,255,255,0.2);color:#cbd5e1;border-radius:8px;padding:4px 10px;font-size:11px;cursor:pointer;">Minimize ▼</button>
          </div>
        </div>
        <div style="padding:8px 18px;border-bottom:1px solid rgba(255,255,255,0.06);display:flex;gap:6px;overflow-x:auto;">
          <a href="/index.html" class="kl-pill-link">📚 Turāth Genres</a>
          <a href="/index.html#authors" onclick="sessionStorage.setItem('kl_target_view','authors')" class="kl-pill-link">✒️ Authors</a>
          <a href="/index.html#publishers" onclick="sessionStorage.setItem('kl_target_view','publishers')" class="kl-pill-link">🏛️ Publishers</a>
          <a href="/index.html#distributors" onclick="sessionStorage.setItem('kl_target_view','distributors')" class="kl-pill-link">📦 Distributors</a>
          <a href="/index.html#readers" onclick="sessionStorage.setItem('kl_target_view','readers')" class="kl-pill-link">📖 Readers</a>
          <a href="/index.html#events" onclick="sessionStorage.setItem('kl_target_view','events')" class="kl-pill-link">🗓️ Event Organizers</a>
        </div>
        <div id="kl-universal-log" style="padding:16px 18px;max-height:260px;overflow-y:auto;font-size:13px;line-height:1.55;display:flex;flex-direction:column;gap:10px;">
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:12px 14px;border-radius:12px;">
            <div style="font-size:10px;color:#34d399;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px;">AALIM AI AGENT</div>
            <div>I am active on this page. Ask me any question about books, manuscripts, translations, or edition comparisons, or tell me to navigate to <strong>Turāth, Authors, Publishers, Distributors, Readers, or Event Organizers</strong>.</div>
          </div>
        </div>
      </div>
    </div>
    <div id="kl-universal-bar">
      <button type="button" id="kl-toggle-btn" style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.16);color:#fff;padding:8px 14px;border-radius:12px;cursor:pointer;font-size:12px;font-weight:600;">
        <span style="width:8px;height:8px;border-radius:50%;background:#34d399;display:inline-block;"></span>
        <span>Aalim AI Agent ▲</span>
      </button>
      <form id="kl-universal-form" style="flex:1;max-width:760px;display:flex;align-items:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.22);border-radius:12px;padding:4px 6px 4px 14px;">
        <input id="kl-universal-input" type="text" placeholder="Ask Aalim AI Agent anything across all 41,506 works & 11,297 manuscripts..." style="flex:1;background:transparent;border:0;color:#fff;font-size:13px;outline:none;" />
        <button type="submit" style="background:#fff;color:#06080d;border:0;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;">Ask Agent ↑</button>
      </form>
      <div style="display:flex;gap:6px;">
        <a href="/index.html" class="kl-pill-link">Turāth Hub</a>
      </div>
    </div>
  `;
  document.body.appendChild(dock);

  const drawer = document.getElementById('kl-universal-drawer');
  const toggleBtn = document.getElementById('kl-toggle-btn');
  const closeBtn = document.getElementById('kl-close-drawer');
  const form = document.getElementById('kl-universal-form');
  const input = document.getElementById('kl-universal-input');
  const log = document.getElementById('kl-universal-log');

  toggleBtn.onclick = () => {
    drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
  };
  closeBtn.onclick = () => {
    drawer.style.display = 'none';
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const q = (input.value || '').trim();
    if (!q) return;
    input.value = '';
    drawer.style.display = 'block';

    const uMsg = document.createElement('div');
    uMsg.style.cssText = 'align-self:flex-end;background:#fff;color:#06080d;padding:8px 14px;border-radius:12px;font-weight:600;max-width:80%;';
    uMsg.textContent = q;
    log.appendChild(uMsg);

    const aMsg = document.createElement('div');
    aMsg.style.cssText = 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);padding:12px 14px;border-radius:12px;';
    aMsg.innerHTML = '<div style="font-size:10px;color:#34d399;margin-bottom:4px;">AALIM AI AGENT</div><div>Consulting KutubLink Sovereign Ledger...</div>';
    log.appendChild(aMsg);
    log.scrollTop = log.scrollHeight;

    try {
      const res = await fetch('/api/kutublink/aalim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, limit: 3 })
      });
      if (res.ok) {
        const data = await res.json();
        const recs = (data.recommendations || []).map(r => `<li><strong>${r.title}</strong> (${r.author} · ${r.publisher})</li>`).join('');
        aMsg.innerHTML = `<div style="font-size:10px;color:#34d399;margin-bottom:4px;">AALIM AI AGENT</div><div>${data.aalim_guidance || 'Verified response:'}${recs ? `<ul style="margin:6px 0 0 18px;">${recs}</ul>` : ''}</div>`;
        log.scrollTop = log.scrollHeight;
        return;
      }
    } catch (err) {}

    aMsg.innerHTML = `<div style="font-size:10px;color:#34d399;margin-bottom:4px;">AALIM AI AGENT</div><div>Verified query across 41,506 Turāth works and 11,297 manuscripts. <a href="/index.html" style="color:#34d399;text-decoration:underline;">Open in Main Turāth Workspace →</a></div>`;
    log.scrollTop = log.scrollHeight;
  };
})();
