// State management
let isEnabled = false;

// Initialize extension state
function initializeState() {
    chrome.storage.local.get('isEnabled', (data) => {
        // If state doesn't exist, initialize it
        if (typeof data.isEnabled === 'undefined') {
            chrome.storage.local.set({ isEnabled: false });
            isEnabled = false;
        } else {
            isEnabled = data.isEnabled;
        }
    });
}

// Create toggle button
function createToggleButton() {
    const button = document.createElement('button');
    button.id = 'xfocus-toggle';
    button.innerHTML = `
        <span class="symbol">𝕏</span>
        <span class="text">Focus</span>
    `;
    button.classList.add('xfocus-toggle');
    document.body.appendChild(button);

    button.addEventListener('click', toggleFocus);
    return button;
}

// Toggle focus mode
function toggleFocus() {
    isEnabled = !isEnabled;
    const button = document.getElementById('xfocus-toggle');
    
    if (isEnabled) {
        document.body.classList.add('xfocus-enabled');
        button.classList.add('active');
    } else {
        document.body.classList.remove('xfocus-enabled');
        button.classList.remove('active');
    }

    // Save state
    chrome.storage.local.set({ isEnabled });
}

// Initialize extension
function init() {
    // Initialize state first
    initializeState();
    
    // Create toggle button
    createToggleButton();
    
    // Apply initial state if enabled
    if (isEnabled) {
        document.body.classList.add('xfocus-enabled');
        document.getElementById('xfocus-toggle').classList.add('active');
    }
}

// Wait for DOM content to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle dynamic content loading
const observer = new MutationObserver((mutations) => {
    if (isEnabled) {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                // Re-apply focus styles to new content
                document.body.classList.add('xfocus-enabled');
            }
        });
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Handle title notifications
const titleObserver = new MutationObserver(() => {
    if (isEnabled) {
        // Remove notification counters from title (e.g., "(1) X" -> "X")
        if (document.title.match(/^\(\d+\)/)) {
            document.title = document.title.replace(/^\(\d+\)\s*/, '');
        }
    }
});

titleObserver.observe(document.querySelector('title') || document.head, {
    subtree: true,
    childList: true,
    characterData: true
});
