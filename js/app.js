/**
 * Main Application Controller
 */
class App {
    constructor() {
        this.init();
    }

    init() {
        this.updateNavigation();
        this.checkAuth();
    }

    updateNavigation() {
        const currentUser = authService.getCurrentUser();
        const navUserName = document.getElementById('navUserName');
        const navUserMenu = document.getElementById('navUserMenu');
        const navLoginLink = document.getElementById('navLoginLink');
        const arenaMenu = document.getElementById('arenaMenu');
        const memberMenu = document.getElementById('memberMenu');
        const memberMenu3 = document.getElementById('memberMenu3');
        const moderatorMenuNav = document.getElementById('moderatorMenuNav');
        const navUserTitle = document.getElementById('navUserTitle');
        const loginMenu = document.getElementById('loginMenu');
        const logoutMenu = document.getElementById('logoutMenu');

        if (currentUser) {
            if (navUserName) navUserName.textContent = currentUser.username;
            if (navUserMenu) navUserMenu.style.display = 'block';
            if (navLoginLink) navLoginLink.style.display = 'none';
            if (arenaMenu) arenaMenu.style.display = 'block';
            if (memberMenu) memberMenu.style.display = 'block';
            if (memberMenu3) memberMenu3.style.display = 'block';
            if (loginMenu) loginMenu.style.display = 'none';
            if (logoutMenu) logoutMenu.style.display = 'none';

            if (currentUser.role === 'moderator') {
                if (moderatorMenuNav) moderatorMenuNav.style.display = 'block';
                if (navUserTitle) navUserTitle.style.display = 'block';
            } else {
                if (moderatorMenuNav) moderatorMenuNav.style.display = 'none';
                if (navUserTitle) navUserTitle.style.display = 'none';
            }
        } else {
            if (navUserName) navUserName.textContent = 'Guest';
            if (navUserTitle) navUserTitle.style.display = 'none';
            if (moderatorMenuNav) moderatorMenuNav.style.display = 'none';
            if (navUserMenu) navUserMenu.style.display = 'none';
            if (navLoginLink) navLoginLink.style.display = 'block';
            if (arenaMenu) arenaMenu.style.display = 'none';
            if (memberMenu) memberMenu.style.display = 'none';
            if (memberMenu3) memberMenu3.style.display = 'none';
            if (loginMenu) loginMenu.style.display = 'block';
            if (logoutMenu) logoutMenu.style.display = 'none';
        }
    }

    checkAuth() {
        const currentUser = authService.getCurrentUser();
        const protectedPages = ['memes.html', 'profile.html', 'achievement.html', 'admin.html', 'upload-meme.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (protectedPages.includes(currentPage) && !currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Only member and moderator can access upload-meme.html
        if (currentPage === 'upload-meme.html' && currentUser && currentUser.role !== 'member' && currentUser.role !== 'moderator') {
            window.location.href = 'index.html';
            return;
        }

        if (currentPage === 'admin.html' && currentUser && currentUser.role !== 'moderator') {
            window.location.href = 'index.html';
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Expose updateNavUI as a global function
window.updateNavUI = function() {
    if (window.app && window.app.updateNavigation) {
        window.app.updateNavigation();
    }
};

