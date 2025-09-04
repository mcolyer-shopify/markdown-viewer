import { marked } from 'https://cdn.jsdelivr.net/npm/marked@16.2.1/+esm';

const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;
const { openPath } = window.__TAURI__.opener;

let contentEl;

async function openFile() {
  try {
    // Open file dialog to select markdown file
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Markdown',
        extensions: ['md', 'markdown', 'txt']
      }]
    });

    if (selected) {
      await loadFile(selected);
    }
  } catch (error) {
    console.error('Error opening file:', error);
    showError('Failed to open file dialog');
  }
}

async function loadFile(filePath) {
  try {
    // Read file contents using Tauri command
    const content = await invoke('read_file', { path: filePath });
    
    // Parse markdown and render to HTML
    const htmlContent = marked(content);
    
    // Update UI
    contentEl.innerHTML = htmlContent;
    
    // Add click handlers for external links
    setupLinkHandlers();
    
    // Save the file path to local storage for next launch
    localStorage.setItem('lastOpenedFile', filePath);
    
  } catch (error) {
    console.error('Error loading file:', error);
    showError('Failed to load file: ' + error);
  }
}

function showError(message) {
  contentEl.innerHTML = `<p class="error" style="color: #d32f2f; font-style: italic;">${message}</p>`;
}

function setupLinkHandlers() {
  // Find all links in the content
  const links = contentEl.querySelectorAll('a[href]');
  
  links.forEach(link => {
    link.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent default link behavior
      
      const href = link.getAttribute('href');
      
      try {
        // Open the link in the system browser
        await openPath(href);
      } catch (error) {
        console.error('Failed to open link:', error);
        // Fallback: try to open with window.open if opener fails
        window.open(href, '_blank');
      }
    });
  });
}

async function reloadCurrentFile() {
  const currentFilePath = localStorage.getItem('lastOpenedFile');
  if (currentFilePath) {
    try {
      await loadFile(currentFilePath);
      console.log('File reloaded:', currentFilePath);
    } catch (error) {
      console.error('Failed to reload file:', error);
      showError('Failed to reload file: ' + error);
    }
  } else {
    console.log('No file to reload');
  }
}

async function restoreLastFile() {
  const lastFilePath = localStorage.getItem('lastOpenedFile');
  if (lastFilePath) {
    try {
      // Check if file still exists by trying to read it
      await loadFile(lastFilePath);
    } catch (error) {
      console.log('Last opened file no longer accessible:', lastFilePath);
      // Clear the stored path if file is no longer accessible
      localStorage.removeItem('lastOpenedFile');
      // Show default placeholder
      contentEl.innerHTML = '<p class="placeholder">Press ⌘O or use File → Open to select a markdown file.</p>';
    }
  }
}

function handleKeyDown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'o') {
    event.preventDefault();
    openFile();
  } else if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
    event.preventDefault();
    reloadCurrentFile();
  }
}

async function setupMenu() {
  try {
    const { Menu, MenuItem, Submenu } = window.__TAURI__.menu;
    
    // Create File menu with Open item
    const fileMenu = await Submenu.new({
      text: 'File',
      items: [
        await MenuItem.new({
          id: 'open',
          text: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          action: openFile
        })
      ]
    });

    // Create main menu
    const menu = await Menu.new({
      items: [fileMenu]
    });

    // Set as app menu
    await menu.setAsAppMenu();
  } catch (error) {
    console.error('Failed to setup menu:', error);
    // Fallback: just ensure keyboard shortcut works
    console.log('Menu setup failed, keyboard shortcut (Cmd+O) will still work');
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  contentEl = document.querySelector('#content');
  
  // Setup system menu
  await setupMenu();
  
  // Handle keyboard shortcut directly
  document.addEventListener('keydown', handleKeyDown);
  
  // Restore the last opened file if available
  await restoreLastFile();
});
