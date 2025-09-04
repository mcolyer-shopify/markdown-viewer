import { marked } from 'https://cdn.jsdelivr.net/npm/marked@16.2.1/+esm';

const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;

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
    
  } catch (error) {
    console.error('Error loading file:', error);
    showError('Failed to load file: ' + error);
  }
}

function showError(message) {
  contentEl.innerHTML = `<p class="error" style="color: #d32f2f; font-style: italic;">${message}</p>`;
}

function handleKeyDown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'o') {
    event.preventDefault();
    openFile();
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
  
  // Also handle keyboard shortcut directly
  document.addEventListener('keydown', handleKeyDown);
});
