document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initCopyButtons();
  applySavedConfig();
  updateTime();
  setInterval(updateTime, 1000);
});

function initTabs() {
  const tabBtns = document.querySelectorAll('.cmd-tab-btn');
  const tabContents = document.querySelectorAll('.command-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
      });

      // Add active to clicked
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
        targetContent.style.display = 'block';
      }
    });
  });
}

function initCopyButtons() {
  const copyBtns = document.querySelectorAll('.copy-cmd-btn');
  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const codeWrapper = btn.closest('.command-code-wrapper');
      const codeEl = codeWrapper.querySelector('.command-code');
      const codeText = codeEl.textContent.trim();

      navigator.clipboard.writeText(codeText).then(() => {
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i>';
        setTimeout(() => {
          btn.innerHTML = originalIcon;
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  });
}

function applySavedConfig() {
  const STORAGE_KEY_CONFIG = 'launchpad_workspace_config';
  const data = localStorage.getItem(STORAGE_KEY_CONFIG);
  let config = {};
  
  if (data) {
    try {
      config = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse config in reference page', e);
    }
  }

  // Background pattern
  const patternOverlay = document.getElementById('bg-pattern-overlay');
  if (patternOverlay) {
    patternOverlay.className = 'bg-pattern-overlay';
    if (config.bgPattern && config.bgPattern !== 'none') {
      patternOverlay.classList.add(`pattern-${config.bgPattern}`);
    }
  }

  // Blobs visibility
  const blobs = document.getElementById('bg-blobs');
  if (blobs) {
    blobs.style.display = config.showBlobs === false ? 'none' : '';
  }

  // Theme Body Class
  document.body.className = config.theme || 'theme-corporate-azure';
  
  // Custom work mode check (just to maintain label context if needed)
  const workModeActive = localStorage.getItem('launchpad_work_mode_active') === 'true';
  if (workModeActive) {
    document.body.classList.add('work-mode-active');
  }

  // Root variables
  document.documentElement.style.setProperty('--glass-blur', config.glassBlur || '20px');
  document.documentElement.style.setProperty('--blob-brightness', config.blobOpacity || '0.45');
  document.documentElement.style.setProperty('--blob-speed', config.blobSpeed || '25s');
  document.documentElement.style.setProperty('--card-radius', config.cardRadius || '24px');

  if (config.themeFont && config.themeFont !== 'default') {
    document.documentElement.style.setProperty('--font-display', config.themeFont);
    document.documentElement.style.setProperty('--font-body', config.themeFont);
  } else {
    document.documentElement.style.setProperty('--font-display', "'Outfit', sans-serif");
    document.documentElement.style.setProperty('--font-body', "'Inter', sans-serif");
  }

  if (config.accentColorOverride) {
    document.documentElement.style.setProperty('--accent-color', config.accentColorOverride);
  }
}

function updateTime() {
  const timeEl = document.getElementById('menu-time');
  const dateEl = document.getElementById('menu-date');
  if (!timeEl || !dateEl) return;

  const now = new Date();
  
  // Formatting Time (e.g. 10:45 AM)
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  timeEl.textContent = `${hours}:${minutes} ${ampm}`;

  // Formatting Date (e.g. Mon 24 Oct)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = days[now.getDay()];
  const date = now.getDate();
  const monthName = months[now.getMonth()];
  dateEl.textContent = `${dayName} ${date} ${monthName}`;
}
