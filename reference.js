document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initCopyButtons();
  applySavedConfig();
  updateTime();
  setInterval(updateTime, 1000);
  initScriptRepo();
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

// Script Repository Logic
function initScriptRepo() {
  const scriptRepoData = [
    {
      title: "Clear Teams Cache",
      description: "Force closes Microsoft Teams and clears all local cached files to resolve common glitching issues.",
      category: "Exchange",
      badgeClass: "exchange",
      code: `Get-Process -Name Teams -ErrorAction SilentlyContinue | Stop-Process -Force\nRemove-Item -Path "$env:appdata\\Microsoft\\Teams\\Cache\\*" -Recurse -Force\nWrite-Host "Teams cache cleared successfully."`
    },
    {
      title: "Export Mailbox Permissions",
      description: "Exports all delegates and permissions for a specific mailbox to a CSV file.",
      category: "Exchange",
      badgeClass: "exchange",
      code: `Get-MailboxPermission -Identity "user@domain.com" | Where-Object {($_.IsInherited -eq $false) -and ($_.User -ne "NT AUTHORITY\\\\SELF")} | Export-Csv "C:\\temp\\mailbox_perms.csv" -NoTypeInformation`
    },
    {
      title: "Restart Print Spooler",
      description: "Forcefully restarts the Windows Print Spooler service to fix stuck print jobs.",
      category: "Local Admin",
      badgeClass: "network",
      code: `Restart-Service -Name Spooler -Force\nWrite-Host "Print Spooler restarted."`
    },
    {
      title: "Find Locked Out User Source",
      description: "Queries the Primary Domain Controller to find which computer is causing an AD account lockout.",
      category: "Entra ID",
      badgeClass: "entra",
      code: `Get-EventLog -LogName Security | Where-Object {$_.EventID -eq 4740} | Select-Object TimeGenerated, ReplacementStrings, Message -First 5`
    },
    {
      title: "Generate Battery Health Report",
      description: "Creates an HTML report showing the laptop's battery degradation and charge history.",
      category: "Local Admin",
      badgeClass: "network",
      code: `powercfg /batteryreport /output "C:\\temp\\battery_report.html"\nInvoke-Item "C:\\temp\\battery_report.html"`
    },
    {
      title: "Find Uptime",
      description: "Check how long a computer has been turned on without a reboot.",
      category: "Local Admin",
      badgeClass: "network",
      code: `Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object LastBootUpTime`
    },
    {
      title: "Check BitLocker Status",
      description: "Verifies if the C: drive is fully encrypted and protected by BitLocker.",
      category: "Intune",
      badgeClass: "intune",
      code: `Get-BitLockerVolume -MountPoint "C:"`
    },
    {
      title: "Reset Windows Update Components",
      description: "Stops update services, renames the SoftwareDistribution folder, and restarts the services to fix stuck updates.",
      category: "Local Admin",
      badgeClass: "network",
      code: `Stop-Service -Name wuauserv, cryptSvc, bits, msiserver -Force\nRename-Item -Path "C:\\Windows\\SoftwareDistribution" -NewName "SoftwareDistribution.old" -ErrorAction SilentlyContinue\nStart-Service -Name wuauserv, cryptSvc, bits, msiserver`
    },
    {
      title: "Export Installed Software List",
      description: "Gets all installed programs and their versions from the registry and exports them to a CSV.",
      category: "Local Admin",
      badgeClass: "network",
      code: `Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher | Where-Object {$_.DisplayName -ne $null} | Export-Csv "C:\\temp\\installed_software.csv" -NoTypeInformation`
    },
    {
      title: "Identify Expiring User Passwords",
      description: "Connects to AD/Entra and finds users whose passwords expire in the next 14 days.",
      category: "Entra ID",
      badgeClass: "entra",
      code: `Search-ADAccount -PasswordExpiring | Select-Object Name, PasswordExpirationDate, UserPrincipalName`
    },
    {
      title: "Restart Primary Wi-Fi Adapter",
      description: "Quickly disables and re-enables the primary Wi-Fi adapter to refresh the network connection.",
      category: "Network",
      badgeClass: "network",
      code: `Disable-NetAdapter -Name "Wi-Fi" -Confirm:$false\nStart-Sleep -Seconds 3\nEnable-NetAdapter -Name "Wi-Fi"`
    },
    {
      title: "Gather Basic System Diagnostics",
      description: "Grabs IP, Hostname, Serial Number, OS version, and outputs a clean text summary.",
      category: "Local Admin",
      badgeClass: "network",
      code: `Write-Host "Hostname: $env:COMPUTERNAME"\nWrite-Host "Serial: $((Get-CimInstance Win32_BIOS).SerialNumber)"\nWrite-Host "OS: $((Get-CimInstance Win32_OperatingSystem).Caption)"\nWrite-Host "IP: $((Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi','Ethernet' -ErrorAction SilentlyContinue).IPAddress)"`
    }
  ];

  const grid = document.getElementById('script-repository-grid');
  const searchInput = document.getElementById('script-search-input');
  
  if (!grid || !searchInput) return;

  function renderScripts(scripts) {
    grid.innerHTML = '';
    
    if (scripts.length === 0) {
      grid.innerHTML = '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">No scripts found matching your search.</div>';
      return;
    }

    scripts.forEach(script => {
      const card = document.createElement('div');
      card.className = 'script-card';
      
      let icon = 'fa-file-code';
      if (script.badgeClass === 'exchange') icon = 'fa-envelope';
      if (script.badgeClass === 'intune') icon = 'fa-laptop-medical';
      if (script.badgeClass === 'entra') icon = 'fa-id-badge';
      if (script.badgeClass === 'network') icon = 'fa-network-wired';

      card.innerHTML = `
        <div class="script-card-header">
          <div class="script-title-row">
            <div class="script-title">
              <i class="fa-solid ${icon}" style="color: var(--text-secondary); font-size: 0.9em;"></i> ${script.title}
            </div>
            <div class="script-desc">${script.description}</div>
          </div>
          <span class="script-badge ${script.badgeClass}">${script.category}</span>
        </div>
        <div class="command-code-wrapper" style="margin-top: 8px;">
          <code class="command-code">${script.code}</code>
          <button class="copy-cmd-btn" title="Copy to clipboard"><i class="fa-regular fa-copy"></i></button>
        </div>
      `;
      grid.appendChild(card);
    });
    
    // Re-initialize copy buttons for the newly added elements
    initCopyButtonsForContainer(grid);
  }

  // Initial render
  renderScripts(scriptRepoData);

  // Search logic
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = scriptRepoData.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.description.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term)
    );
    renderScripts(filtered);
  });
}

function initCopyButtonsForContainer(container) {
  const copyBtns = container.querySelectorAll('.copy-cmd-btn');
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
