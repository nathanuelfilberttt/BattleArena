/**
 * Meme Service
 */
class MemeService {
    constructor() {
        this.memeRepository = new MemeRepository();
        this.voteRepository = new VoteRepository();
        this.commentRepository = new CommentRepository();
        this.userRepository = new UserRepository();
    }

    createMeme(memeData) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            throw new Error('Authentication required');
        }

        const meme = this.memeRepository.create({
            ...memeData,
            userId: currentUser.id,
            username: currentUser.username,
            voteCount: 0,
            commentCount: 0
        });

        // Update user stats
        const user = this.userRepository.findById(currentUser.id);
        if (user) {
            user.stats.totalUploads++;
            this.userRepository.update(user.id, { stats: user.stats });
        }

        return meme;
    }

    getMeme(id) {
        return this.memeRepository.findById(id);
    }

    getAllMemes() {
        return this.memeRepository.findAll();
    }

    getTrendingMemes(limit = 10, filter = {}) {
        return this.memeRepository.findTrending(limit, filter);
    }

    getMemesByUser(userId) {
        return this.memeRepository.findByUserId(userId);
    }

    getMemesByCategory(category) {
        return this.memeRepository.findByCategory(category);
    }

    voteMeme(memeId) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            throw new Error('Authentication required');
        }

        // Check if already voted
        const existingVote = this.voteRepository.findByMemeAndUser(memeId, currentUser.id);
        if (existingVote) {
            // Remove vote
            this.voteRepository.delete(existingVote.id);
            this.memeRepository.decrementVoteCount(memeId);
            
            // Update user stats
            const user = this.userRepository.findById(currentUser.id);
            if (user) {
                user.stats.totalLikes = Math.max(0, user.stats.totalLikes - 1);
                this.userRepository.update(user.id, { stats: user.stats });
            }
            
            return { voted: false };
        } else {
            // Add vote
            this.voteRepository.create({
                memeId,
                userId: currentUser.id
            });
            this.memeRepository.incrementVoteCount(memeId);
            
            // Update user stats
            const user = this.userRepository.findById(currentUser.id);
            if (user) {
                user.stats.totalLikes++;
                this.userRepository.update(user.id, { stats: user.stats });
            }
            
            return { voted: true };
        }
    }

    hasVoted(memeId) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            return false;
        }
        return this.voteRepository.findByMemeAndUser(memeId, currentUser.id) !== null;
    }

    addComment(memeId, text) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            throw new Error('Authentication required');
        }

        const meme = this.memeRepository.findById(memeId);
        if (!meme) {
            throw new Error('Meme is not found');
        }

        if (meme.statusComments === 'disabled') {
            throw new Error('Comment section on this meme is closed');
        }

        const comment = this.commentRepository.create({
            memeId,
            userId: currentUser.id,
            username: currentUser.username,
            text
        });

        this.memeRepository.incrementCommentCount(memeId);
        return comment;
    }

    getComments(memeId) {
        return this.commentRepository.findByMemeId(memeId);
    }

    enableComments(memeId) {
        if (!authService.isModerator()) {
            throw new Error('Moderator access required');
        }

        const meme = this.memeRepository.findById(memeId);
        if (!meme) {
            throw new Error('Meme is not found');
        }

        return this.memeRepository.update(memeId, {
            statusComments: 'enabled'
        });
    }

    disableComments(memeId) {
        if (!authService.isModerator()) {
            throw new Error('Moderator access required');
        }

        const meme = this.memeRepository.findById(memeId);
        if (!meme) {
            throw new Error('Meme is not found');
        }

        return this.memeRepository.update(memeId, {
            statusComments: 'disabled'
        });
    }

    deleteMeme(memeId) {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
            throw new Error('Authentication required');
        }

        const meme = this.memeRepository.findById(memeId);
        if (!meme) {
            throw new Error('Meme is not found');
        }

        // Only owner or moderator can delete
        if (meme.userId !== currentUser.id && currentUser.role !== 'moderator') {
            throw new Error('Unauthorized');
        }

        // Delete related votes and comments
        const votes = this.voteRepository.findByMemeId(memeId);
        votes.forEach(vote => this.voteRepository.delete(vote.id));
        
        const comments = this.commentRepository.findByMemeId(memeId);
        comments.forEach(comment => this.commentRepository.delete(comment.id));

        return this.memeRepository.delete(memeId);
    }
}

