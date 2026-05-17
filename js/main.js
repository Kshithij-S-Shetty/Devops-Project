/**
 * Main Application Logic
 * Handles global UI interactions, sidebar, theme toggle, and auth checks.
 */

// --- Authentication Middleware ---
function requireAuth() {
    const user = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that don't require auth
    const publicPages = ['index.html', 'register.html', ''];
    
    if (!user && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return false;
    }

    if (user) {
        // If logged in but not onboarded, force onboarding
        if (!user.settings.onboarded && currentPage !== 'onboarding.html' && !publicPages.includes(currentPage)) {
            window.location.href = 'onboarding.html';
            return false;
        }

        // If logged in and onboarded, prevent accessing public auth pages
        if (publicPages.includes(currentPage)) {
            window.location.href = 'dashboard.html';
            return false;
        }
    }
    
    return true;
}

// Run auth check immediately
requireAuth();

document.addEventListener('DOMContentLoaded', () => {
    const user = getCurrentUser();

    // 1. Theme Initialization
    const themeToggleBtn = document.getElementById('theme-toggle');
    let currentTheme = user ? user.settings.theme : 'dark';

    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        if(themeToggleBtn) {
            themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    applyTheme(currentTheme);

    if (themeToggleBtn && user) {
        themeToggleBtn.addEventListener('click', async () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme);
            
            // Save theme preference to current user
            user.settings.theme = currentTheme;
            try {
                await updateSettings({ theme: currentTheme });
            } catch (err) {
                console.error('Failed to update theme preference on server', err);
            }
        });
    }

    // 2. Sidebar Toggle
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !sidebarToggleBtn.contains(e.target) && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }

    // 3. User Info Population
    if (user) {
        const userNameEls = document.querySelectorAll('.user-name');
        userNameEls.forEach(el => el.textContent = user.name);
        
        // Update avatar initials
        const avatarEls = document.querySelectorAll('.avatar');
        avatarEls.forEach(el => {
            const names = user.name.trim().split(' ');
            let initials = names[0][0];
            if (names.length > 1) {
                initials += names[names.length - 1][0];
            }
            el.textContent = initials.toUpperCase();
        });
    }

    // 4. Logout Handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearSession();
            window.location.href = 'index.html';
        });
    }

    // 5. Active Nav Link Highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === 'index.html' && href === 'dashboard.html' && user)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Helper Function to setup Modals
function setupModal(modalId, triggerBtnId, closeBtnClass = '.close-modal') {
    const modal = document.getElementById(modalId);
    if (!modal) return null;

    const closeBtns = modal.querySelectorAll(closeBtnClass);

    // Some modals might be triggered dynamically, so triggerBtnId is optional
    if (triggerBtnId) {
        const trigger = document.getElementById(triggerBtnId);
        if (trigger) {
            trigger.addEventListener('click', () => {
                modal.classList.add('show');
            });
        }
    }

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    return {
        show: () => modal.classList.add('show'),
        hide: () => modal.classList.remove('show')
    };
}
