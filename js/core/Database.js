/**
 * Database Layer - Simulates database using localStorage
 * Implements Repository Pattern
 */
class Database {
    constructor() {
        this.storage = window.localStorage;
        this.initializeDatabase();
    }

    initializeDatabase() {
        // Initialize collections if they don't exist
        const collections = ['users', 'memes', 'comments', 'votes', 'achievements', 'arenas'];
        collections.forEach(collection => {
            if (!this.storage.getItem(collection)) {
                this.storage.setItem(collection, JSON.stringify([]));
            }
        });

        // Initialize default admin and member users
        const users = this.getAll('users');
        if (users.length === 0) {
            const defaultAdmin = {
                id: this.generateId(),
                username: 'admin',
                password: 'admin123', // In production, this should be hashed
                email: 'admin@warmofmeme.com',
                role: 'moderator',
                title: 'Administrator',
                createdAt: new Date().toISOString(),
                stats: {
                    totalUploads: 100,
                    totalWins: 60,
                    totalLikes: 500
                }
            };
            this.create('users', defaultAdmin);

            const defaultMember = {
                id: this.generateId(),
                username: 'member',
                password: 'member123',
                email: 'member@warmofmeme.com',
                role: 'member',
                title: 'Member',
                createdAt: new Date().toISOString(),
                stats: {
                    totalUploads: 10,
                    totalWins: 6,
                    totalLikes: 120
                }
            };
            this.create('users', defaultMember);
        } else {
            // Ensure admin and member exist even if users already exist
            const existingUsernames = users.map(u => u.username);
            if (!existingUsernames.includes('admin')) {
                const defaultAdmin = {
                    id: this.generateId(),
                    username: 'admin',
                    password: 'admin123',
                    email: 'admin@warmofmeme.com',
                    role: 'moderator',
                    title: 'Administrator',
                    createdAt: new Date().toISOString(),
                    stats: {
                        totalUploads: 100,
                        totalWins: 60,
                        totalLikes: 500
                    }
                };
                this.create('users', defaultAdmin);
            }
            if (!existingUsernames.includes('member')) {
                const defaultMember = {
                    id: this.generateId(),
                    username: 'member',
                    password: 'member123',
                    email: 'member@warmofmeme.com',
                    role: 'member',
                    title: 'Member',
                    createdAt: new Date().toISOString(),
                    stats: {
                        totalUploads: 10,
                        totalWins: 6,
                        totalLikes: 120
                    }
                };
                this.create('users', defaultMember);
            }
        }

        // Initialize default achievements
        const achievements = this.getAll('achievements');
        if (achievements.length === 0) {
            const defaultAchievements = [
                {
                    id: this.generateId(),
                    name: 'First Upload',
                    description: 'Upload your first meme',
                    icon: '🎬',
                    requirement: { type: 'upload', count: 1 },
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: 'Viral Creator',
                    description: 'Get 100 votes on a single meme',
                    icon: '🔥',
                    requirement: { type: 'single_vote', count: 100 },
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: 'Top Contributor',
                    description: 'Upload 50 memes',
                    icon: '⭐',
                    requirement: { type: 'upload', count: 50 },
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: 'Community Favorite',
                    description: 'Get 1000 total votes across all memes',
                    icon: '❤️',
                    requirement: { type: 'total_votes', count: 1000 },
                    createdAt: new Date().toISOString()
                }
            ];
            defaultAchievements.forEach(achievement => {
                this.create('achievements', achievement);
            });
        }

        // Initialize dummy memes for leaderboard (top 10)
        const memes = this.getAll('memes');
        // Create dummy memes if there are no memes or less than 10
        // Fix image paths for existing memes (in case they have wrong paths)
        memes.forEach(meme => {
            if (meme.imageUrl) {
                // Fix paths that are missing slash or have wrong format
                if (meme.imageUrl.includes('assetsmeme')) {
                    // Fix paths like 'assetsmeme1.jpg' to 'assets/meme1.jpg'
                    meme.imageUrl = meme.imageUrl.replace('assetsmeme', 'assets/meme');
                    this.update('memes', meme.id, meme);
                } else if (meme.imageUrl.startsWith('/assets/')) {
                    // Remove leading slash for relative path
                    meme.imageUrl = meme.imageUrl.substring(1);
                    this.update('memes', meme.id, meme);
                } else if (meme.imageUrl.startsWith('./assets/')) {
                    // Remove ./ prefix
                    meme.imageUrl = meme.imageUrl.substring(2);
                    this.update('memes', meme.id, meme);
                }
            }
        });
        
        // Check if we need to add dummy memes
        const needsDummyMemes = memes.length === 0 || memes.length < 10;
        if (needsDummyMemes) {
            // Clear existing memes if we're going to add dummy ones
            if (memes.length > 0 && memes.length < 10) {
                // Remove existing memes to avoid duplicates
                memes.forEach(meme => {
                    this.delete('memes', meme.id);
                });
            }
            const dummyMemes = [
                {
                    id: this.generateId(),
                    userId: 'user1',
                    username: 'Cynthia Erivo',
                    title: 'Surprised Reaction',
                    category: 'Funny',
                    description: 'Description ini adalah meme yang akan digunakan sebagai dummy untuk testing leaderboard.',
                    imageUrl: 'assets/meme1.jpg',
                    voteCount: 120,
                    commentCount: 45,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user2',
                    username: 'John Smith',
                    title: 'Epic Moment',
                    category: 'Relatable',
                    description: 'Meme ini menggambarkan momen yang sangat relatable dengan kehidupan sehari-hari kita.',
                    imageUrl: 'assets/meme2.jpg',
                    voteCount: 98,
                    commentCount: 32,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user3',
                    username: 'Sarah Johnson',
                    title: 'Dark Humor',
                    category: 'Dark',
                    description: 'Dark humor meme yang membuat kita tertawa sambil merenung tentang kehidupan.',
                    imageUrl: 'assets/meme3.jpg',
                    voteCount: 87,
                    commentCount: 28,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user4',
                    username: 'Mike Wilson',
                    title: 'Wholesome Content',
                    category: 'Wholesome',
                    description: 'Meme wholesome yang membuat hati terasa hangat dan bahagia.',
                    imageUrl: 'assets/meme4.jpg',
                    voteCount: 76,
                    commentCount: 21,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user5',
                    username: 'Emma Davis',
                    title: 'Political Satire',
                    category: 'Political',
                    description: 'Meme politik yang menyindir dengan cara yang lucu dan menghibur.',
                    imageUrl: 'assets/meme5.jpg',
                    voteCount: 65,
                    commentCount: 18,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user6',
                    username: 'David Brown',
                    title: 'Funny Moment',
                    category: 'Funny',
                    description: 'Momen lucu yang terjadi dalam kehidupan sehari-hari yang bisa membuat kita tertawa.',
                    imageUrl: 'assets/meme6.jpg',
                    voteCount: 54,
                    commentCount: 15,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user7',
                    username: 'Lisa Anderson',
                    title: 'Relatable Situation',
                    category: 'Relatable',
                    description: 'Situasi yang sangat relatable dan membuat kita merasa "ini banget!".',
                    imageUrl: 'assets/meme7.jpg',
                    voteCount: 43,
                    commentCount: 12,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user8',
                    username: 'Tom Miller',
                    title: 'Dark Comedy',
                    category: 'Dark',
                    description: 'Komedi gelap yang membuat kita tertawa dengan cara yang sedikit aneh.',
                    imageUrl: 'assets/meme8.jpg',
                    voteCount: 38,
                    commentCount: 10,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user9',
                    username: 'Anna Taylor',
                    title: 'Heartwarming',
                    category: 'Wholesome',
                    description: 'Konten yang menghangatkan hati dan membuat kita tersenyum.',
                    imageUrl: 'assets/meme9.jpg',
                    voteCount: 29,
                    commentCount: 8,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                    arenaId: null
                },
                {
                    id: this.generateId(),
                    userId: 'user10',
                    username: 'Chris Lee',
                    title: 'Funny Reaction',
                    category: 'Funny',
                    description: 'Reaksi lucu yang menggambarkan ekspresi kita dalam berbagai situasi.',
                    imageUrl: 'assets/meme10.jpg',
                    voteCount: 22,
                    commentCount: 6,
                    statusComments: 'enabled',
                    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), // 11 days ago
                    arenaId: null
                }
            ];
            dummyMemes.forEach(meme => {
                this.create('memes', meme);
            });
            console.log('Dummy memes initialized:', dummyMemes.length);
        }

        // Initialize dummy comments for memes
        const existingComments = this.getAll('comments');
        const allMemes = this.getAll('memes');
        
        console.log('Checking for dummy comments. Existing comments:', existingComments.length, 'Memes:', allMemes.length);
        
        // Create dummy comments if there are memes but no comments (or very few comments)
        // Check if we need to create dummy comments
        const needsDummyComments = allMemes.length > 0 && (existingComments.length === 0 || existingComments.length < allMemes.length);
        
        if (needsDummyComments) {
            console.log('Creating dummy comments for', allMemes.length, 'memes');
            const dummyComments = [];
            const commentUsernames = [
                'username', 'meme_lover', 'funny_guy', 'dark_humor', 'wholesome_user',
                'reaction_master', 'meme_king', 'laugh_factory', 'comedy_central', 'joke_teller',
                'humor_seeker', 'meme_collector', 'funny_bone', 'laugh_out_loud', 'comedy_gold'
            ];
            
            const commentTexts = [
                'ini isi comment nya',
                'Meme ini sangat lucu! 😂',
                'Relatable banget!',
                'Hahaha ini beneran terjadi sama aku',
                'Top tier meme!',
                'Ini yang aku cari!',
                'Mantap gan!',
                'LOL ini terlalu akurat',
                'Bener banget sih',
                'Ini meme terbaik hari ini',
                'Saya setuju dengan ini',
                'Ini membuat hari saya lebih baik',
                'Kocak abis!',
                'Meme of the year!',
                'Ini harus viral!',
                'Perfect timing!',
                'Sangat relate!',
                'Ini beneran terjadi',
                'Hahaha mantap',
                'Ini yang paling lucu'
            ];

            // Create comments for each meme
            allMemes.forEach((meme) => {
                // Create 3-8 comments per meme
                const commentCount = Math.floor(Math.random() * 6) + 3; // 3-8 comments
                
                for (let i = 0; i < commentCount; i++) {
                    const randomUsername = commentUsernames[Math.floor(Math.random() * commentUsernames.length)];
                    const randomText = commentTexts[Math.floor(Math.random() * commentTexts.length)];
                    
                    // Create comment with timestamp spread over the last few days
                    const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago
                    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000).toISOString();
                    
                    dummyComments.push({
                        id: this.generateId(),
                        memeId: meme.id,
                        userId: `user${Math.floor(Math.random() * 10) + 1}`, // Random user ID
                        username: randomUsername,
                        text: randomText,
                        createdAt: createdAt
                    });
                }
            });

            // Create all dummy comments
            dummyComments.forEach(comment => {
                this.create('comments', comment);
            });
            
            // Update commentCount for each meme
            allMemes.forEach(meme => {
                const memeComments = dummyComments.filter(c => c.memeId === meme.id);
                if (memeComments.length > 0) {
                    this.update('memes', meme.id, { commentCount: memeComments.length });
                }
            });
            
            console.log('Dummy comments initialized:', dummyComments.length);
            console.log('Sample comments:', dummyComments.slice(0, 3));
        } else {
            console.log('Skipping dummy comments creation. Existing comments:', existingComments.length, 'Memes:', allMemes.length);
            // If there are memes but no comments, force create comments
            if (existingComments.length === 0 && allMemes.length > 0) {
                console.log('Force creating dummy comments...');
                // Re-run the comment creation logic
                const dummyComments = [];
                const commentUsernames = [
                    'username', 'meme_lover', 'funny_guy', 'dark_humor', 'wholesome_user',
                    'reaction_master', 'meme_king', 'laugh_factory', 'comedy_central', 'joke_teller',
                    'humor_seeker', 'meme_collector', 'funny_bone', 'laugh_out_loud', 'comedy_gold'
                ];
                
                const commentTexts = [
                    'ini isi comment nya',
                    'Meme ini sangat lucu! 😂',
                    'Relatable banget!',
                    'Hahaha ini beneran terjadi sama aku',
                    'Top tier meme!',
                    'Ini yang aku cari!',
                    'Mantap gan!',
                    'LOL ini terlalu akurat',
                    'Bener banget sih',
                    'Ini meme terbaik hari ini',
                    'Saya setuju dengan ini',
                    'Ini membuat hari saya lebih baik',
                    'Kocak abis!',
                    'Meme of the year!',
                    'Ini harus viral!',
                    'Perfect timing!',
                    'Sangat relate!',
                    'Ini beneran terjadi',
                    'Hahaha mantap',
                    'Ini yang paling lucu'
                ];

                allMemes.forEach((meme) => {
                    const commentCount = Math.floor(Math.random() * 6) + 3;
                    for (let i = 0; i < commentCount; i++) {
                        const randomUsername = commentUsernames[Math.floor(Math.random() * commentUsernames.length)];
                        const randomText = commentTexts[Math.floor(Math.random() * commentTexts.length)];
                        const daysAgo = Math.floor(Math.random() * 7);
                        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000).toISOString();
                        
                        dummyComments.push({
                            id: this.generateId(),
                            memeId: meme.id,
                            userId: `user${Math.floor(Math.random() * 10) + 1}`,
                            username: randomUsername,
                            text: randomText,
                            createdAt: createdAt
                        });
                    }
                });

                dummyComments.forEach(comment => {
                    this.create('comments', comment);
                });
                
                allMemes.forEach(meme => {
                    const memeComments = dummyComments.filter(c => c.memeId === meme.id);
                    if (memeComments.length > 0) {
                        this.update('memes', meme.id, { commentCount: memeComments.length });
                    }
                });
                
                console.log('Force created dummy comments:', dummyComments.length);
            }
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getAll(collection) {
        const data = this.storage.getItem(collection);
        return data ? JSON.parse(data) : [];
    }

    getById(collection, id) {
        const items = this.getAll(collection);
        return items.find(item => item.id === id) || null;
    }

    create(collection, item) {
        const items = this.getAll(collection);
        if (!item.id) {
            item.id = this.generateId();
        }
        if (!item.createdAt) {
            item.createdAt = new Date().toISOString();
        }
        items.push(item);
        try {
            this.storage.setItem(collection, JSON.stringify(items));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
                // Try to clean up old memes if this is a meme collection
                if (collection === 'memes') {
                    const cleanupResult = this.clearOldMemes(10);
                    // Try again after cleanup
                    try {
                        this.storage.setItem(collection, JSON.stringify(items));
                        console.warn('Storage quota exceeded. Cleaned up old memes:', cleanupResult);
                        return item;
                    } catch (e2) {
                        // If still fails, throw error
                        throw new Error('Storage quota exceeded. Please clear some data manually or use smaller images. You can clear localStorage from Developer Tools (F12) > Application > Local Storage.');
                    }
                } else {
                    throw new Error('Storage quota exceeded. Please clear some data or use smaller images.');
                }
            }
            throw e;
        }
        return item;
    }

    update(collection, id, updates) {
        const items = this.getAll(collection);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
            try {
                this.storage.setItem(collection, JSON.stringify(items));
            } catch (e) {
                if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
                    throw new Error('Storage quota exceeded. Please clear some data or use smaller images.');
                }
                throw e;
            }
            return items[index];
        }
        return null;
    }

    delete(collection, id) {
        const items = this.getAll(collection);
        const filtered = items.filter(item => item.id !== id);
        try {
            this.storage.setItem(collection, JSON.stringify(filtered));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
                throw new Error('Storage quota exceeded. Please clear some data.');
            }
            throw e;
        }
        return filtered.length < items.length;
    }

    find(collection, predicate) {
        const items = this.getAll(collection);
        return items.filter(predicate);
    }

    findOne(collection, predicate) {
        const items = this.getAll(collection);
        return items.find(predicate) || null;
    }

    count(collection, predicate = null) {
        if (predicate) {
            return this.find(collection, predicate).length;
        }
        return this.getAll(collection).length;
    }

    // Get estimated storage size in bytes
    getStorageSize() {
        let total = 0;
        for (let key in this.storage) {
            if (this.storage.hasOwnProperty(key)) {
                    total += this.storage[key].length + key.length;
            }
        }
        return total;
    }

    // Get storage size in human readable format
    getStorageSizeFormatted() {
        const bytes = this.getStorageSize();
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Clear old memes to free up space (keeps latest N memes)
    clearOldMemes(keepCount = 10) {
        try {
            const memes = this.getAll('memes');
            if (memes.length <= keepCount) {
                return { deleted: 0, message: 'No memes to delete' };
            }

            // Sort by createdAt (oldest first)
            const sortedMemes = [...memes].sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateA - dateB;
            });

            // Delete oldest memes
            const toDelete = sortedMemes.slice(0, memes.length - keepCount);
            let deleted = 0;
            toDelete.forEach(meme => {
                try {
                    const items = this.getAll('memes');
                    const filtered = items.filter(item => item.id !== meme.id);
                    this.storage.setItem('memes', JSON.stringify(filtered));
                    deleted++;
                } catch (e) {
                    console.error('Error deleting meme:', e);
                }
            });

            return { deleted, message: `Deleted ${deleted} old memes` };
        } catch (e) {
            console.error('Error in clearOldMemes:', e);
            return { deleted: 0, message: 'Error clearing old memes' };
        }
    }
}

// Singleton instance
const database = new Database();

