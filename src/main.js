import { marked } from 'https://cdn.jsdelivr.net/npm/marked@16.2.1/+esm';

const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;
const { openPath, openUrl } = window.__TAURI__.opener;
const { getCurrentWindow } = window.__TAURI__.window;

// Find/search functionality
class FindManager {
  constructor() {
    this.isVisible = false;
    this.currentSearchTerm = '';
    this.matches = [];
    this.currentMatchIndex = -1;
    this.caseSensitive = false;
    this.findBarEl = null;
    this.findInputEl = null;
    this.findMatchInfoEl = null;
    this.findPreviousEl = null;
    this.findNextEl = null;
    this.findCaseSensitiveEl = null;
    this.findCloseEl = null;
  }

  init() {
    this.findBarEl = document.getElementById('find-bar');
    this.findInputEl = document.getElementById('find-input');
    this.findMatchInfoEl = document.getElementById('find-match-info');
    this.findPreviousEl = document.getElementById('find-previous');
    this.findNextEl = document.getElementById('find-next');
    this.findCaseSensitiveEl = document.getElementById('find-case-sensitive');
    this.findCloseEl = document.getElementById('find-close');

    // Add event listeners
    this.findInputEl.addEventListener('input', () => this.handleSearchInput());
    this.findInputEl.addEventListener('keydown', (e) => this.handleInputKeydown(e));
    this.findPreviousEl.addEventListener('click', () => this.findPrevious());
    this.findNextEl.addEventListener('click', () => this.findNext());
    this.findCaseSensitiveEl.addEventListener('click', () => this.toggleCaseSensitive());
    this.findCloseEl.addEventListener('click', () => this.hide());
  }

  show() {
    this.isVisible = true;
    this.findBarEl.classList.add('visible');
    this.findInputEl.focus();
    this.findInputEl.select();
  }

  hide() {
    this.isVisible = false;
    this.findBarEl.classList.remove('visible');
    this.clearHighlights();
    this.currentSearchTerm = '';
    this.matches = [];
    this.currentMatchIndex = -1;
    this.updateMatchInfo();
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  handleSearchInput() {
    const searchTerm = this.findInputEl.value;
    if (searchTerm !== this.currentSearchTerm) {
      this.currentSearchTerm = searchTerm;
      this.search();
    }
  }

  handleInputKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.shiftKey) {
        this.findPrevious();
      } else {
        this.findNext();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.hide();
    }
  }

  toggleCaseSensitive() {
    this.caseSensitive = !this.caseSensitive;
    this.findCaseSensitiveEl.classList.toggle('active', this.caseSensitive);
    if (this.currentSearchTerm) {
      this.search();
    }
  }

  search() {
    this.clearHighlights();
    this.matches = [];
    this.currentMatchIndex = -1;

    if (!this.currentSearchTerm) {
      this.updateMatchInfo();
      return;
    }

    const activeContentEl = this.getActiveContentElement();
    if (!activeContentEl) {
      this.updateMatchInfo();
      return;
    }

    // Find and highlight all matches
    this.highlightMatches(activeContentEl, this.currentSearchTerm);
    this.updateMatchInfo();

    if (this.matches.length > 0) {
      this.currentMatchIndex = 0;
      this.highlightCurrentMatch();
      this.scrollToCurrentMatch();
    }
  }

  highlightMatches(element, searchTerm) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      const regex = new RegExp(this.escapeRegExp(searchTerm), this.caseSensitive ? 'g' : 'gi');
      const matches = [...text.matchAll(regex)];

      if (matches.length > 0) {
        const parent = textNode.parentNode;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach((match, index) => {
          // Add text before match
          if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }

          // Create highlight element
          const highlight = document.createElement('span');
          highlight.className = 'search-highlight';
          highlight.textContent = match[0];
          fragment.appendChild(highlight);

          this.matches.push(highlight);
          lastIndex = match.index + match[0].length;
        });

        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        parent.replaceChild(fragment, textNode);
      }
    });
  }

  clearHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize(); // Merge adjacent text nodes
    });
  }

  highlightCurrentMatch() {
    // Remove current class from all matches
    this.matches.forEach((match) => {
      match.classList.remove('current');
    });

    // Add current class to current match
    if (this.currentMatchIndex >= 0 && this.currentMatchIndex < this.matches.length) {
      this.matches[this.currentMatchIndex].classList.add('current');
    }
  }

  scrollToCurrentMatch() {
    if (this.currentMatchIndex >= 0 && this.currentMatchIndex < this.matches.length) {
      const currentMatch = this.matches[this.currentMatchIndex];
      currentMatch.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  findNext() {
    if (this.matches.length === 0) {
      return;
    }

    this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
    this.highlightCurrentMatch();
    this.scrollToCurrentMatch();
    this.updateMatchInfo();
  }

  findPrevious() {
    if (this.matches.length === 0) {
      return;
    }

    this.currentMatchIndex = this.currentMatchIndex <= 0 
      ? this.matches.length - 1 
      : this.currentMatchIndex - 1;
    this.highlightCurrentMatch();
    this.scrollToCurrentMatch();
    this.updateMatchInfo();
  }

  updateMatchInfo() {
    if (this.matches.length === 0) {
      this.findMatchInfoEl.textContent = this.currentSearchTerm ? 'No matches' : '0 of 0';
    } else {
      this.findMatchInfoEl.textContent = `${this.currentMatchIndex + 1} of ${this.matches.length}`;
    }
  }

  getActiveContentElement() {
    const activeContent = document.querySelector('.tab-content.active');
    return activeContent;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Called when tab switches to clear search state
  onTabSwitch() {
    if (this.isVisible) {
      this.clearHighlights();
      this.search(); // Re-search in new tab content
    }
  }
}

// Tab management system
class TabManager {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.tabIdCounter = 0;
    this.tabListEl = null;
    this.tabContentContainerEl = null;
    this.tabAddButtonEl = null;
    
    // Drag and drop state
    this.draggedTabId = null;
    this.dragOverIndex = -1;
    
    // Context menu state
    this.contextMenuEl = null;
    this.contextTabId = null;
  }

  init() {
    this.tabListEl = document.getElementById('tab-list');
    this.tabContentContainerEl = document.getElementById('tab-content-container');
    this.tabAddButtonEl = document.getElementById('tab-add-button');
    this.contextMenuEl = document.getElementById('tab-context-menu');

    // Add event listeners
    this.tabAddButtonEl.addEventListener('click', () => this.createNewTab());
    
    // Context menu event listeners
    document.getElementById('context-copy-markdown').addEventListener('click', () => this.copyMarkdown());
    document.getElementById('context-copy-html').addEventListener('click', () => this.copyHTML());
    document.getElementById('context-close-tab').addEventListener('click', () => this.closeContextTab());
    
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!this.contextMenuEl.contains(e.target)) {
        this.hideContextMenu();
      }
    });
    
    // Load persisted state
    this.loadState();
    
    // If no tabs loaded, create a default tab
    if (this.tabs.length === 0) {
      this.createNewTab();
    }
  }

  createNewTab(filePath = null, title = null) {
    const tabId = `tab-${++this.tabIdCounter}`;
    const tab = {
      id: tabId,
      path: filePath,
      title: title || 'Untitled',
      content: null,
      markdownContent: null  // Store original markdown content for copying
    };

    this.tabs.push(tab);
    this.renderTab(tab);
    this.createTabContent(tab);
    this.switchToTab(tabId);

    // If a file path is provided, load it
    if (filePath) {
      this.loadFileInTab(tabId, filePath);
    }

    this.saveState();
    return tabId;
  }

  renderTab(tab) {
    const tabEl = document.createElement('button');
    tabEl.className = 'tab';
    tabEl.setAttribute('data-tab-id', tab.id);
    tabEl.setAttribute('draggable', 'true');
    tabEl.title = tab.path || tab.title;

    const titleEl = document.createElement('span');
    titleEl.className = 'tab-title';
    titleEl.textContent = tab.title;

    const closeEl = document.createElement('button');
    closeEl.className = 'tab-close';
    closeEl.textContent = '×';
    closeEl.title = 'Close tab';

    tabEl.appendChild(titleEl);
    tabEl.appendChild(closeEl);

    // Event listeners
    tabEl.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        this.switchToTab(tab.id);
      }
    });

    closeEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tab.id);
    });

    // Drag and drop event listeners
    tabEl.addEventListener('dragstart', (e) => this.handleDragStart(e, tab.id));
    tabEl.addEventListener('dragover', (e) => this.handleDragOver(e));
    tabEl.addEventListener('drop', (e) => this.handleDrop(e, tab.id));
    tabEl.addEventListener('dragend', (e) => this.handleDragEnd(e));
    tabEl.addEventListener('dragenter', (e) => this.handleDragEnter(e));
    tabEl.addEventListener('dragleave', (e) => this.handleDragLeave(e));

    // Context menu event listener
    tabEl.addEventListener('contextmenu', (e) => this.handleTabRightClick(e, tab.id));

    this.tabListEl.appendChild(tabEl);
  }

  createTabContent(tab) {
    const contentEl = document.createElement('section');
    contentEl.className = 'tab-content';
    contentEl.id = `content-${tab.id}`;

    if (!tab.path) {
      contentEl.innerHTML = '<p class="placeholder">Press ⌘O or use File → Open to select a markdown file.</p>';
    }

    this.tabContentContainerEl.appendChild(contentEl);
  }

  switchToTab(tabId) {
    // Update active tab ID
    this.activeTabId = tabId;

    // Update tab appearances
    document.querySelectorAll('.tab').forEach(tabEl => {
      tabEl.classList.toggle('active', tabEl.getAttribute('data-tab-id') === tabId);
    });

    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(contentEl => {
      contentEl.classList.toggle('active', contentEl.id === `content-${tabId}`);
    });

    // Notify find manager about tab switch
    if (window.findManager) {
      window.findManager.onTabSwitch();
    }

    this.saveState();
  }

  closeTab(tabId) {
    const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;

    // Remove tab data
    this.tabs.splice(tabIndex, 1);

    // Remove DOM elements
    const tabEl = document.querySelector(`[data-tab-id="${tabId}"]`);
    const contentEl = document.getElementById(`content-${tabId}`);
    
    if (tabEl) tabEl.remove();
    if (contentEl) contentEl.remove();

    // Handle active tab change
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        // Switch to the next tab, or previous if this was the last
        const newActiveIndex = Math.min(tabIndex, this.tabs.length - 1);
        this.switchToTab(this.tabs[newActiveIndex].id);
      } else {
        // Create a new empty tab if no tabs left
        this.createNewTab();
      }
    }

    this.saveState();
  }

  async loadFileInTab(tabId, filePath) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab) return;

    try {
      const content = await invoke('read_file', { path: filePath });
      const htmlContent = marked(content);

      // Update tab data
      tab.path = filePath;
      tab.title = this.extractFilename(filePath);
      tab.content = htmlContent;
      tab.markdownContent = content;  // Store original markdown

      // Update tab title in UI
      const tabEl = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tabEl) {
        const titleEl = tabEl.querySelector('.tab-title');
        titleEl.textContent = tab.title;
        tabEl.title = filePath;
      }

      // Update content
      const contentEl = document.getElementById(`content-${tabId}`);
      if (contentEl) {
        contentEl.innerHTML = htmlContent;
        this.setupLinkHandlers(contentEl);
      }

      this.saveState();
    } catch (error) {
      console.error('Error loading file in tab:', error);
      this.showErrorInTab(tabId, `Failed to load file: ${error}`);
    }
  }

  showErrorInTab(tabId, message) {
    const contentEl = document.getElementById(`content-${tabId}`);
    if (contentEl) {
      contentEl.innerHTML = `<p class="error" style="color: #d32f2f; font-style: italic;">${message}</p>`;
    }
  }

  setupLinkHandlers(contentEl) {
    const links = contentEl.querySelectorAll('a[href]');
    links.forEach((link) => {
      link.addEventListener('click', async (event) => {
        event.preventDefault();
        const href = link.getAttribute('href');
        try {
          // Check if it's a URL (http/https/mailto/tel) or a file path
          if (href.match(/^(https?|mailto|tel):/)) {
            await openUrl(href);
          } else {
            await openPath(href);
          }
        } catch (error) {
          console.error('Failed to open link:', error);
          window.open(href, '_blank');
        }
      });
    });
  }

  extractFilename(filePath) {
    return filePath.split('/').pop() || filePath.split('\\').pop() || 'Untitled';
  }

  getActiveTab() {
    return this.tabs.find(tab => tab.id === this.activeTabId);
  }

  saveState() {
    const state = {
      tabs: this.tabs.map(tab => ({
        id: tab.id,
        path: tab.path,
        title: tab.title
      })),
      activeTabId: this.activeTabId,
      tabIdCounter: this.tabIdCounter
    };
    localStorage.setItem('tabManagerState', JSON.stringify(state));
  }

  loadState() {
    try {
      const state = JSON.parse(localStorage.getItem('tabManagerState') || '{}');
      
      if (state.tabs && state.tabs.length > 0) {
        this.tabIdCounter = state.tabIdCounter || 0;
        
        // Recreate tabs
        for (const tabData of state.tabs) {
          const tab = {
            id: tabData.id,
            path: tabData.path,
            title: tabData.title,
            content: null,
            markdownContent: null
          };
          
          this.tabs.push(tab);
          this.renderTab(tab);
          this.createTabContent(tab);
          
          // Load file if path exists
          if (tab.path) {
            this.loadFileInTab(tab.id, tab.path).catch(() => {
              // If file can't be loaded, show error in tab
              tab.path = null;
              tab.title = 'File not found';
              const tabEl = document.querySelector(`[data-tab-id="${tab.id}"]`);
              if (tabEl) {
                tabEl.querySelector('.tab-title').textContent = tab.title;
                tabEl.title = 'File not found';
              }
              this.showErrorInTab(tab.id, 'File not found or no longer accessible');
            });
          }
        }
        
        // Restore active tab
        if (state.activeTabId && this.tabs.find(t => t.id === state.activeTabId)) {
          this.switchToTab(state.activeTabId);
        } else if (this.tabs.length > 0) {
          this.switchToTab(this.tabs[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading tab state:', error);
    }
  }

  handleDragStart(e, tabId) {
    this.draggedTabId = tabId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.classList.add('dragging');
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const tabEl = e.currentTarget;
    const rect = tabEl.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    
    // Determine if we should insert before or after this tab
    const insertAfter = e.clientX > midpoint;
    
    // Remove previous drop indicators
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('drop-before', 'drop-after');
    });
    
    // Add drop indicator
    if (insertAfter) {
      tabEl.classList.add('drop-after');
    } else {
      tabEl.classList.add('drop-before');
    }
  }

  handleDragEnter(e) {
    e.preventDefault();
  }

  handleDragLeave(e) {
    // Only remove drop indicators if we're actually leaving the tab
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('drop-before', 'drop-after');
    }
  }

  handleDrop(e, targetTabId) {
    e.preventDefault();
    
    if (!this.draggedTabId || this.draggedTabId === targetTabId) {
      return;
    }

    const draggedIndex = this.tabs.findIndex(tab => tab.id === this.draggedTabId);
    const targetIndex = this.tabs.findIndex(tab => tab.id === targetTabId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Determine insertion position based on drop indicator
    const tabEl = e.currentTarget;
    const rect = tabEl.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    const insertAfter = e.clientX > midpoint;
    
    let newIndex = targetIndex;
    if (insertAfter) {
      newIndex = targetIndex + 1;
    }
    
    // Adjust for the removal of the dragged tab
    if (draggedIndex < newIndex) {
      newIndex--;
    }

    // Reorder tabs array
    const [draggedTab] = this.tabs.splice(draggedIndex, 1);
    this.tabs.splice(newIndex, 0, draggedTab);

    // Re-render all tabs to reflect new order
    this.renderAllTabs();
    
    // Restore active tab state
    this.switchToTab(this.activeTabId);
    
    // Save the new state
    this.saveState();
  }

  handleDragEnd(e) {
    // Clean up drag state
    e.target.classList.remove('dragging');
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('drop-before', 'drop-after');
    });
    this.draggedTabId = null;
    this.dragOverIndex = -1;
  }

  renderAllTabs() {
    // Clear existing tab elements
    this.tabListEl.innerHTML = '';
    
    // Re-render all tabs in the correct order
    this.tabs.forEach(tab => {
      this.renderTab(tab);
    });
  }

  handleTabRightClick(event, tabId) {
    event.preventDefault();
    this.contextTabId = tabId;
    this.showContextMenu(event.clientX, event.clientY);
  }

  showContextMenu(x, y) {
    this.contextMenuEl.style.left = `${x}px`;
    this.contextMenuEl.style.top = `${y}px`;
    this.contextMenuEl.classList.add('visible');

    // Adjust position if menu would go off screen
    const menuRect = this.contextMenuEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (menuRect.right > viewportWidth) {
      this.contextMenuEl.style.left = `${x - menuRect.width}px`;
    }
    if (menuRect.bottom > viewportHeight) {
      this.contextMenuEl.style.top = `${y - menuRect.height}px`;
    }
  }

  hideContextMenu() {
    this.contextMenuEl.classList.remove('visible');
    this.contextTabId = null;
  }

  async copyMarkdown() {
    if (!this.contextTabId) return;

    const tab = this.tabs.find(t => t.id === this.contextTabId);
    if (!tab || !tab.markdownContent) {
      console.warn('No markdown content available to copy');
      return;
    }

    try {
      await invoke('plugin:clipboard-manager|write_text', { text: tab.markdownContent });
      console.log('Markdown copied to clipboard');
    } catch (error) {
      console.error('Failed to copy markdown to clipboard:', error);
    }

    this.hideContextMenu();
  }

  async copyHTML() {
    if (!this.contextTabId) return;

    const tab = this.tabs.find(t => t.id === this.contextTabId);
    if (!tab || !tab.content) {
      console.warn('No HTML content available to copy');
      return;
    }

    try {
      await invoke('plugin:clipboard-manager|write_text', { text: tab.content });
      console.log('HTML copied to clipboard');
    } catch (error) {
      console.error('Failed to copy HTML to clipboard:', error);
    }

    this.hideContextMenu();
  }

  closeContextTab() {
    if (!this.contextTabId) return;

    this.closeTab(this.contextTabId);
    this.hideContextMenu();
  }
}

// Global instances
const findManager = new FindManager();
const tabManager = new TabManager();

// File operations
async function openFile() {
  try {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'Markdown',
          extensions: ['md', 'markdown', 'txt'],
        },
      ],
    });

    if (selected) {
      const activeTab = tabManager.getActiveTab();
      if (activeTab && !activeTab.path) {
        // Load in current empty tab
        await tabManager.loadFileInTab(activeTab.id, selected);
      } else {
        // Create new tab for the file
        tabManager.createNewTab(selected, tabManager.extractFilename(selected));
      }
    }
  } catch (error) {
    console.error('Error opening file:', error);
    const activeTab = tabManager.getActiveTab();
    if (activeTab) {
      tabManager.showErrorInTab(activeTab.id, 'Failed to open file dialog');
    }
  }
}

async function reloadCurrentFile() {
  const activeTab = tabManager.getActiveTab();
  if (activeTab && activeTab.path) {
    try {
      await tabManager.loadFileInTab(activeTab.id, activeTab.path);
      console.log('File reloaded:', activeTab.path);
    } catch (error) {
      console.error('Failed to reload file:', error);
      tabManager.showErrorInTab(activeTab.id, `Failed to reload file: ${error}`);
    }
  } else {
    console.log('No file to reload');
  }
}

function createNewTab() {
  tabManager.createNewTab();
}

function closeCurrentTab() {
  if (tabManager.activeTabId) {
    tabManager.closeTab(tabManager.activeTabId);
  }
}

function handleKeyDown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'o') {
    event.preventDefault();
    openFile();
  } else if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
    event.preventDefault();
    reloadCurrentFile();
  } else if ((event.metaKey || event.ctrlKey) && event.key === 't') {
    event.preventDefault();
    createNewTab();
  } else if ((event.metaKey || event.ctrlKey) && event.key === 'w') {
    event.preventDefault();
    closeCurrentTab();
  } else if ((event.metaKey || event.ctrlKey) && event.key === 'q') {
    event.preventDefault();
    quitApp();
  } else if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
    event.preventDefault();
    findManager.toggle();
  } else if ((event.metaKey || event.ctrlKey) && event.key === 'g') {
    event.preventDefault();
    if (event.shiftKey) {
      findManager.findPrevious();
    } else {
      findManager.findNext();
    }
  } else if (event.key === 'F3') {
    event.preventDefault();
    if (event.shiftKey) {
      findManager.findPrevious();
    } else {
      findManager.findNext();
    }
  } else if ((event.metaKey || event.ctrlKey) && /^[1-9]$/.test(event.key)) {
    event.preventDefault();
    const tabIndex = parseInt(event.key) - 1;
    if (tabIndex < tabManager.tabs.length) {
      tabManager.switchToTab(tabManager.tabs[tabIndex].id);
    }
  }
}

async function quitApp() {
  try {
    const currentWindow = getCurrentWindow();
    await currentWindow.close();
  } catch (error) {
    console.error('Failed to quit app:', error);
  }
}

async function setupMenu() {
  try {
    const { Menu, MenuItem, Submenu } = window.__TAURI__.menu;

    const fileMenu = await Submenu.new({
      text: 'File',
      items: [
        await MenuItem.new({
          id: 'new-tab',
          text: 'New Tab',
          accelerator: 'CmdOrCtrl+T',
          action: createNewTab,
        }),
        await MenuItem.new({
          id: 'open',
          text: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          action: openFile,
        }),
        await MenuItem.new({
          id: 'close-tab',
          text: 'Close Tab',
          accelerator: 'CmdOrCtrl+W',
          action: closeCurrentTab,
        }),
        await MenuItem.new({
          id: 'quit',
          text: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          action: quitApp,
        }),
      ],
    });

    const menu = await Menu.new({
      items: [fileMenu],
    });

    await menu.setAsAppMenu();
  } catch (error) {
    console.error('Failed to setup menu:', error);
    console.log('Menu setup failed, keyboard shortcuts will still work');
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  // Initialize managers
  findManager.init();
  tabManager.init();

  // Make findManager globally accessible
  window.findManager = findManager;

  // Setup system menu
  await setupMenu();

  // Handle keyboard shortcuts
  document.addEventListener('keydown', handleKeyDown);
});