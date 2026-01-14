/**
 * Leaderboard Controller
 * Handles leaderboard pagination and display
 * Displays top 10 memes sorted by votes (default: top votes)
 * Top 3 are displayed permanently, rank 4-10 use pagination (3 per page)
 */
class LeaderboardController {
    constructor() {
        this.currentPage = 0;
        this.itemsPerPage = 3; // 3 memes per page for rank 4-10
        this.memes = [];
        this.filter = {
            category: '',
            timeRange: 'all',
            sortBy: 'votes' // Default: sort by votes (top votes)
        };
        this.memeRepository = new MemeRepository();
        this.userRepository = new UserRepository();
        this.initCountdown();
    }

    init() {
        this.loadLeaderboard();
        this.setupEventListeners();
    }

    initCountdown() {
        // Set countdown to 2 days from now
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 2);
        this.countdownEnd = endDate;
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const countdownElement = document.getElementById('countdownDays');
        if (!countdownElement) return; // Skip if element doesn't exist

        const now = new Date();
        const diff = this.countdownEnd - now;

        if (diff <= 0) {
            countdownElement.textContent = '0';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            countdownElement.textContent = days;
        } else if (hours > 0) {
            countdownElement.textContent = `${hours}h`;
        } else {
            countdownElement.textContent = `${minutes}m`;
        }
    }

    loadLeaderboard() {
        // Get all memes and sort by votes (default: top votes)
        let allMemes = this.memeRepository.findAll();
        console.log('Total memes found:', allMemes.length);
        
        // Apply filters
        if (this.filter.category) {
            allMemes = allMemes.filter(m => m.category === this.filter.category);
            console.log('After category filter:', allMemes.length);
        }
        if (this.filter.timeRange && this.filter.timeRange !== 'all') {
            const now = new Date();
            const timeRanges = {
                'today': 1,
                'week': 7,
                'month': 30,
                'all': Infinity
            };
            const days = timeRanges[this.filter.timeRange] || Infinity;
            if (days !== Infinity) {
                const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                allMemes = allMemes.filter(m => new Date(m.createdAt) >= cutoffDate);
                console.log('After timeRange filter:', allMemes.length);
            }
        }

        // Sort by vote count (descending) - default: top votes
        allMemes.sort((a, b) => b.voteCount - a.voteCount);
        
        // Get top 10
        this.memes = allMemes.slice(0, 10);
        console.log('Top 10 memes:', this.memes.length);
        
        this.renderLeaderboard();
    }

    renderTop3() {
        const container = document.getElementById('top3Container');
        if (!container) return;

        const top3 = this.memes.slice(0, 3);
        
        if (top3.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 2rem;">Tidak ada meme di leaderboard</div>';
            return;
        }

        container.innerHTML = top3.map((meme, index) => {
            const rank = index + 1;
            const rankLabel = rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place';
            const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : 'rank-3';
            
            // Get user info for title display
            let username = meme.username || 'username';
            let userTitle = '';
            let isAdmin = false;
            
            if (meme.userId) {
                const user = this.userRepository.findById(meme.userId);
                if (user) {
                    username = user.username || username;
                    userTitle = user.title || '';
                    isAdmin = user.role === 'moderator';
                }
            }
            
            // Generate username handle from name
            const usernameHandle = '@' + username.toLowerCase().replace(/\s+/g, '');
            
            // Generate title display (same as arena)
            const titleDisplay = isAdmin 
                ? '<span class="user-title-admin">Admin</span>' 
                : (userTitle ? `<span class="user-title">${userTitle}</span>` : '<span class="user-title">Newbie</span>');
            
            // Check if user can access comments (member or moderator)
            const canAccessComments = this.canAccessComments();
            const clickHandler = canAccessComments ? `onclick="openLeaderboardCommentPage('${meme.id}')"` : '';
            const clickableClass = canAccessComments ? 'clickable' : '';
            const cardClickHandler = canAccessComments ? `onclick="openLeaderboardCommentPage('${meme.id}')"` : '';
            
            return `
                <div class="top-3-item ${rankClass} ${clickableClass}" ${cardClickHandler}>
                    <div class="top-3-label">${rankLabel}</div>
                    <div class="top-3-vote-badge">▲ ${meme.voteCount}</div>
                    <img src="${meme.imageUrl}" alt="${meme.title}" class="top-3-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22400%22%3E%3Crect fill=%22%231a1a2e%22 width=%22320%22 height=%22400%22/%3E%3Ctext fill=%22%23fff%22 font-family=%22Arial%22 font-size=%2218%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EMeme Image%3C/text%3E%3C/svg%3E'">
                    <div class="top-3-info">
                        <div class="top-3-author">${username}</div>
                        <div class="top-3-username">${usernameHandle} ${titleDisplay}</div>
                        <div class="top-3-description">${meme.description || 'Description ini adalah meme yang akan digunakan sebagai dummy.'}</div>
                        <div class="top-3-meta">
                            <div class="top-3-category-wrapper">
                                ${this.getCategoryTags(meme.category)}
                            </div>
                            <div class="top-3-stats">
                                <span class="top-3-comments">
                                    <img src="assets/comment.png" alt="Comment" class="comment-icon-img">
                                    ${meme.commentCount || 0}
                                </span>
                                <span class="top-3-share">🔗</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderLeaderboard() {
        const slider = document.getElementById('leaderboardSlider');
        const container = document.querySelector('.leaderboard-container');
        const pagination = document.querySelector('.leaderboard-pagination');
        const top3Container = document.getElementById('top3Container');
        
        if (!slider) return;

        // Hide top3Container since we're using pagination for all memes
        if (top3Container) {
            top3Container.parentElement.style.display = 'none';
        }

        if (this.memes.length === 0) {
            // Hide container and pagination if no memes
            if (container) container.style.display = 'none';
            if (pagination) pagination.style.display = 'none';
            return;
        }

        // Show container and pagination
        if (container) container.style.display = 'flex';
        if (pagination) pagination.style.display = 'block';

        // Calculate total pages: all memes divided by 3 per page
        const totalPages = Math.ceil(this.memes.length / this.itemsPerPage);
        console.log('Total pages:', totalPages, 'Total memes:', this.memes.length);

        // Clear slider
        slider.innerHTML = '';

        // Create pages: each page shows 3 memes
        // Page 1: Top 1-3, Page 2: Top 4-6, Page 3: Top 7-9, Page 4: Top 10
        for (let page = 0; page < totalPages; page++) {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'leaderboard-page';
            pageContainer.style.display = 'grid';
            pageContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
            pageContainer.style.gap = '2rem';
            pageContainer.style.minWidth = '100%';
            pageContainer.style.flexShrink = '0';

            const start = page * this.itemsPerPage;
            const end = Math.min(start + this.itemsPerPage, this.memes.length);
            console.log(`Page ${page + 1}: memes ${start + 1} to ${end}`);

            for (let i = start; i < end; i++) {
                const meme = this.memes[i];
                const rank = i + 1; // Rank starts from 1
                const item = this.createLeaderboardItem(meme, rank);
                if (item) {
                    pageContainer.appendChild(item);
                    console.log(`Added meme ${rank} to page ${page + 1}`);
                }
            }

            // Handle case where last page has less than 3 memes (e.g., only meme #10)
            // Fill remaining slots with empty divs to maintain grid layout
            const itemsOnPage = end - start;
            if (itemsOnPage < 3 && page === totalPages - 1) {
                for (let j = itemsOnPage; j < 3; j++) {
                    const emptyDiv = document.createElement('div');
                    emptyDiv.style.visibility = 'hidden';
                    pageContainer.appendChild(emptyDiv);
                }
            }

            slider.appendChild(pageContainer);
            console.log(`Page ${page + 1} container added to slider`);
        }
        
        console.log('Slider children count:', slider.children.length);

        // Reset to first page
        this.currentPage = 0;
        this.updateSliderPosition();
        this.updatePagination();
        this.updateNavigationButtons();
        
        // Force visibility
        if (slider) {
            slider.style.visibility = 'visible';
            slider.style.display = 'flex';
        }
        if (container) {
            container.style.visibility = 'visible';
            container.style.display = 'flex';
        }
    }

    createLeaderboardItem(meme, rank) {
        const item = document.createElement('div');
        // Use same styling as top-3-item for consistency
        let rankClass = '';
        let rankLabel = `#${rank}`;
        
        // Set rank label and class for top 3
        if (rank === 1) {
            rankClass = 'rank-1';
            rankLabel = '1st Place';
        } else if (rank === 2) {
            rankClass = 'rank-2';
            rankLabel = '2nd Place';
        } else if (rank === 3) {
            rankClass = 'rank-3';
            rankLabel = '3rd Place';
        }
        
        item.className = `top-3-item ${rankClass}`;

        // Get user info for title display
        let username = meme.username || 'username';
        let userTitle = '';
        let isAdmin = false;
        
        if (meme.userId) {
            const user = this.userRepository.findById(meme.userId);
            if (user) {
                username = user.username || username;
                userTitle = user.title || '';
                isAdmin = user.role === 'moderator';
            }
        }
        
        // Generate username handle from name
        const usernameHandle = '@' + username.toLowerCase().replace(/\s+/g, '');
        
        // Generate title display (same as arena)
        const titleDisplay = isAdmin 
            ? '<span class="user-title-admin">Admin</span>' 
            : (userTitle ? `<span class="user-title">${userTitle}</span>` : '<span class="user-title">Newbie</span>');
        
        // Check if user can access comments (member or moderator)
        const canAccessComments = this.canAccessComments();
        const clickableClass = canAccessComments ? 'clickable' : '';
        const cardClickHandler = canAccessComments ? `onclick="openLeaderboardCommentPage('${meme.id}')"` : '';
        
        item.className = `top-3-item ${rankClass} ${clickableClass}`;
        item.setAttribute('data-meme-id', meme.id);
        if (cardClickHandler) {
            item.setAttribute('onclick', `openLeaderboardCommentPage('${meme.id}')`);
        }
        
        item.innerHTML = `
            <div class="top-3-label">${rankLabel}</div>
            <div class="top-3-vote-badge">▲ ${meme.voteCount}</div>
            <img src="${meme.imageUrl}" alt="${meme.title}" class="top-3-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22400%22%3E%3Crect fill=%22%231a1a2e%22 width=%22320%22 height=%22400%22/%3E%3Ctext fill=%22%23fff%22 font-family=%22Arial%22 font-size=%2218%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EMeme Image%3C/text%3E%3C/svg%3E'">
            <div class="top-3-info">
                <div class="top-3-author">${username}</div>
                <div class="top-3-username">${usernameHandle} ${titleDisplay}</div>
                <div class="top-3-description">${meme.description || 'Description ini adalah meme yang akan digunakan sebagai dummy.'}</div>
                <div class="top-3-meta">
                    <div class="top-3-category-wrapper">
                        ${this.getCategoryTags(meme.category)}
                    </div>
                    <div class="top-3-stats">
                        <span class="top-3-comments">
                            <img src="assets/comment.png" alt="Comment" class="comment-icon-img">
                            ${meme.commentCount || 0}
                        </span>
                        <span class="top-3-share">🔗</span>
                    </div>
                </div>
            </div>
        `;

        return item;
    }

    getCategoryTags(category) {
        // Map categories to colors (matching comment.html category colors)
        const categoryColorMap = {
            'Funny': '#ef4444',      // Red
            'Relatable': '#8b5cf6',  // Purple
            'Dark': '#2563eb',       // Blue
            'Wholesome': '#10b981',  // Green
            'Political': '#f59e0b'   // Orange/Amber
        };
        
        const mainCategory = category || 'kategories';
        const mainColor = categoryColorMap[mainCategory] || '#6b7280'; // Gray as default
        
        return `
            <span class="top-3-category-tag" style="background: ${mainColor};">#${mainCategory.toLowerCase()}</span>
            <span class="top-3-category-tag" style="background: #6b7280;">#kategories</span>
        `;
    }

    nextPage() {
        const totalPages = Math.ceil(this.memes.length / this.itemsPerPage);
        if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.updateSliderPosition();
            this.updatePagination();
            this.updateNavigationButtons();
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.updateSliderPosition();
            this.updatePagination();
            this.updateNavigationButtons();
        }
    }

    updateSliderPosition() {
        const slider = document.getElementById('leaderboardSlider');
        if (!slider) return;

        const offset = -this.currentPage * 100;
        slider.style.transform = `translateX(${offset}%)`;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.memes.length / this.itemsPerPage);
        const indicator = document.getElementById('pageIndicator');
        if (indicator) {
            if (totalPages > 0) {
                indicator.textContent = `${this.currentPage + 1} / ${totalPages}`;
            } else {
                indicator.textContent = '';
            }
        }
    }

    updateNavigationButtons() {
        const totalPages = Math.ceil(this.memes.length / this.itemsPerPage);
        const prevBtn = document.querySelector('.prev-nav');
        const nextBtn = document.querySelector('.next-nav');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 0 || totalPages === 0;
            if (totalPages === 0) {
                prevBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'block';
            }
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages - 1 || totalPages === 0;
            if (totalPages === 0) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'block';
            }
        }
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevPage();
            } else if (e.key === 'ArrowRight') {
                this.nextPage();
            }
        });

        // Touch/swipe support
        this.touchStartX = 0;
        this.touchEndX = 0;

        const slider = document.getElementById('leaderboardSlider');
        if (slider) {
            slider.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            });

            slider.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            });
        }
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextPage();
            } else {
                this.prevPage();
            }
        }
    }

    applyFilter() {
        // Get date filter (radio button)
        const dateRadio = document.querySelector('input[name="date"]:checked');
        const date = dateRadio ? dateRadio.value : '';

        // Get category filter (checkboxes)
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
        const categories = Array.from(categoryCheckboxes).map(cb => cb.value);
        const category = categories.length > 0 ? categories[0] : ''; // For leaderboard, use first selected category

        // Get top filter (radio button)
        const topRadio = document.querySelector('input[name="top"]:checked');
        const topFilter = topRadio ? topRadio.value : 'vote'; // Default to 'vote'

        // Map date values
        const dateMap = {
            'week': 'week',
            'month': 'month',
            '6months': 'month',
            '12months': 'all'
        };

        // Map top filter to sortBy
        const sortByMap = {
            'vote': 'votes',
            'downvote': 'downvotes',
            'likedUploaders': 'likedUploaders',
            'activeUploaders': 'activeUploaders'
        };

        this.filter = {
            category,
            timeRange: dateMap[date] || 'all',
            sortBy: sortByMap[topFilter] || 'votes' // Default: sort by votes (top votes)
        };

        this.currentPage = 0;
        this.loadLeaderboard();
        closeFilter();
    }

    resetFilter() {
        // Reset all filter inputs
        const dateRadios = document.querySelectorAll('input[name="date"]');
        dateRadios.forEach(radio => radio.checked = false);

        const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
        categoryCheckboxes.forEach(checkbox => checkbox.checked = false);

        const topRadios = document.querySelectorAll('input[name="top"]');
        topRadios.forEach(radio => radio.checked = false);

        // Reset filter state to default
        this.filter = {
            category: '',
            timeRange: 'all',
            sortBy: 'votes'
        };

        // Update filter section visual states
        updateFilterSection('dateSection');
        updateFilterSection('categoriesSection');
        updateFilterSection('topSection');

        // Reload leaderboard with default filter
        this.currentPage = 0;
        this.loadLeaderboard();
        closeFilter();
    }

    canAccessComments() {
        // Check if current user is member or moderator
        if (typeof authService === 'undefined') {
            return false;
        }
        const currentUser = authService.getCurrentUser();
        return currentUser && (currentUser.role === 'member' || currentUser.role === 'moderator');
    }
}

// Global instance
const leaderboardController = new LeaderboardController();

// Filter functions
function toggleFilter() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        const currentDisplay = modal.style.display || window.getComputedStyle(modal).display;
        if (currentDisplay === 'none' || currentDisplay === '') {
            modal.style.display = 'flex';
            // Setup radio button toggle saat modal dibuka
            setTimeout(() => {
                setupRadioButtonToggle();
            }, 50);
        } else {
            modal.style.display = 'none';
        }
    }
}

function closeFilter() {
    const modal = document.getElementById('filterModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function applyFilter() {
    leaderboardController.applyFilter();
}

function resetFilter() {
    leaderboardController.resetFilter();
}

function openLeaderboardCommentPage(memeId) {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'member' && currentUser.role !== 'moderator')) {
        alert('Hanya member dan moderator yang dapat melihat komentar');
        return;
    }
    window.location.href = `comment.html?id=${memeId}`;
}

// Function untuk setup radio button toggle (dipanggil dari index.html)
function setupRadioButtonToggle() {
    // Setup untuk semua radio button di filter modal
    const filterModal = document.getElementById('filterModal');
    if (!filterModal) return;
    
    const radioButtons = filterModal.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        // Flag untuk menandai bahwa kita sedang uncheck
        let isUnchecking = false;
        
        // Tambahkan mousedown listener di capture phase untuk toggle
        radio.addEventListener('mousedown', function(e) {
            // Jika sudah checked, uncheck langsung dan prevent semua event
            if (this.checked) {
                isUnchecking = true;
                e.preventDefault();
                e.stopImmediatePropagation();
                // Uncheck langsung
                this.checked = false;
                const sectionId = this.closest('.filter-section')?.id;
                if (sectionId) {
                    updateFilterSection(sectionId);
                }
                return false;
            } else {
                isUnchecking = false;
            }
        }, true); // Capture phase
        
        // Prevent click event jika sedang uncheck
        radio.addEventListener('click', function(e) {
            if (isUnchecking) {
                e.preventDefault();
                e.stopImmediatePropagation();
                isUnchecking = false;
                return false;
            }
        }, true); // Capture phase
    });
}

// Update filter section background when selection changes
function updateFilterSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    let hasSelection = false;

    // Check for radio buttons (status, date)
    if (sectionId === 'statusSection' || sectionId === 'dateSection') {
        const checked = section.querySelector('input[type="radio"]:checked');
        hasSelection = checked !== null;
    } else {
        // Check for checkboxes (categories, top)
        const checked = section.querySelectorAll('input[type="checkbox"]:checked');
        hasSelection = checked.length > 0;
    }

    if (hasSelection) {
        section.classList.add('has-selection');
    } else {
        section.classList.remove('has-selection');
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('filterModal');
    if (modal && e.target === modal) {
        closeFilter();
    }
});

