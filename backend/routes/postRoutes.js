import express from 'express';
import protect from '../middleware/authMiddleware.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

const router = express.Router();

// Helper to populate post data consistently
const populatePost = async (postId) => {
    return await Post.findById(postId)
        .populate('user', 'id name username avatarUrl followers following blockedUsers')
        .populate('comments.user', 'id name username avatarUrl followers following blockedUsers');
}

// @route   GET /api/posts
// @desc    Get all posts, sorted by newest
router.get('/', protect, async (req, res) => {
    try {
        const posts = await Post.find({})
            .sort({ createdAt: -1 });
            
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/posts
// @desc    Create a new post
router.post('/', protect, async (req, res) => {
    const { content, imageUrl } = req.body;

    if (!content && !imageUrl) {
        return res.status(400).json({ message: 'Post must have content or an image' });
    }

    try {
        const post = new Post({
            content: content || '',
            imageUrl: imageUrl || null,
            user: req.user.id,
        });

        const createdPost = await post.save();
        const populated = await populatePost(createdPost._id);
        
        // Emit the new post to all clients
        req.io.emit('newPost', populated);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await post.deleteOne();
        
        // Emit delete event to all clients
        req.io.emit('postDeleted', req.params.id);

        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   PUT /api/posts/:id/like
// @desc    Like or unlike a post
router.put('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isLiked = post.likes.some(like => like.equals(req.user.id));

        if (isLiked) {
            post.likes = post.likes.filter(like => !like.equals(req.user.id));
        } else {
            post.likes.push(req.user.id);
            // Create and emit notification if liking someone else's post
            if (post.user.toString() !== req.user.id) {
                 const notification = new Notification({
                    recipient: post.user,
                    sender: req.user.id,
                    type: 'like',
                    postId: post._id,
                });
                await notification.save();
                const populatedNotification = await notification.populate('sender', 'id name username avatarUrl');

                const recipientSocket = req.onlineUsers.get(post.user.toString());
                if (recipientSocket) {
                    req.io.to(recipientSocket).emit('newNotification', populatedNotification);
                }
            }
        }

        await post.save();
        const populated = await populatePost(post._id);

        // Emit update event to all clients
        req.io.emit('postUpdated', populated);
        
        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/posts/:id/comments
// @desc    Comment on a post
router.post('/:id/comments', protect, async (req, res) => {
    const { text } = req.body;
     if (!text) {
        return res.status(400).json({ message: 'Comment text is required' });
    }
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = { text, user: req.user.id };
        post.comments.push(newComment);
        await post.save();

        // Create and emit notification if commenting on someone else's post
        if (post.user.toString() !== req.user.id) {
             const notification = new Notification({
                recipient: post.user,
                sender: req.user.id,
                type: 'comment',
                postId: post._id,
            });
            await notification.save();
            const populatedNotification = await notification.populate('sender', 'id name username avatarUrl');

            const recipientSocket = req.onlineUsers.get(post.user.toString());
            if (recipientSocket) {
                req.io.to(recipientSocket).emit('newNotification', populatedNotification);
            }
        }
        
        const populated = await populatePost(post._id);
        req.io.emit('postUpdated', populated);
        res.status(201).json(populated);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/posts/:id/comments/:comment_id
// @desc    Delete a comment
router.delete('/:id/comments/:comment_id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.find(c => c._id.toString() === req.params.comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment does not exist' });
        }

        if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        post.comments = post.comments.filter(c => c._id.toString() !== req.params.comment_id);
        await post.save();

        const populated = await populatePost(post._id);
        req.io.emit('postUpdated', populated);
        res.json(populated);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;