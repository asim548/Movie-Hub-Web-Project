const Notification = require('./Notification');
const cron = require('node-cron');
const{User, AdminSeller} = require('../adminSellerUser/AdminSellerUser');
const Movie = require('../movies/Movie');
const mongoose = require('mongoose');

const findAccountById = async (id) => {
    const user = await User.findById(id).select('_id name email');
    if (user) {
        return { _id: user._id, name: user.name, email: user.email, accountType: 'User' };
    }
    const adminSeller = await AdminSeller.findById(id).select('_id name email role');
    if (adminSeller) {
        const type = String(adminSeller.role || '').toLowerCase() === 'seller' ? 'Seller' : 'Admin';
        return { _id: adminSeller._id, name: adminSeller.name, email: adminSeller.email, accountType: type };
    }
    return null;
};

const createNotificationRecord = async (title, userId, body, sender = {}) => {
    try {
        const notification = new Notification({
            title,
            userId,
            body,
            senderId: sender.senderId || undefined,
            senderName: sender.senderName || 'System',
            senderEmail: sender.senderEmail || '',
            senderRole: sender.senderRole || 'System',
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error adding notification:', error.message);
        throw new Error(error.message);
    }
};

// Add Notification via API
const addNotification = async (req, res) => {
    try {
        const { title, userId, body } = req.body;
        if (!title || !userId || !body) {
            return res.status(400).json({ message: 'title, userId and body are required' });
        }
        const recipient = await findAccountById(userId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        const senderAccount = await findAccountById(req.user?.id);
        const sender = senderAccount
            ? {
                senderId: senderAccount._id,
                senderName: senderAccount.name || 'Unknown',
                senderEmail: senderAccount.email || '',
                senderRole: senderAccount.accountType || 'Unknown',
            }
            : {
                senderId: req.user?.id,
                senderName: 'Unknown',
                senderEmail: '',
                senderRole: String(req.user?.role || 'Unknown'),
            };
        const notification = await createNotificationRecord(title, userId, body, sender);
        res.status(201).json({ notification, message: 'Notification added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Notification
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);

        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        const requestorId = String(req.user?.id || '');
        const requestorRole = String(req.user?.role || '').toLowerCase();
        const isOwner = String(notification.userId) === requestorId;
        if (!isOwner && requestorRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await notification.deleteOne();

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Notification for User
const getNotification = async (req, res) => {
    try {
        const { userId, notificationId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ message: 'Invalid notification request' });
        }
        const requestorId = String(req.user?.id || '');
        const requestorRole = String(req.user?.role || '').toLowerCase();
        if (requestorRole !== 'admin' && requestorId !== String(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const notification = await Notification.findOne({ _id: notificationId, userId });

        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Notifications for User
const getAllNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user id' });
        }
        const requestorId = String(req.user?.id || '');
        const requestorRole = String(req.user?.role || '').toLowerCase();
        if (requestorRole !== 'admin' && requestorId !== String(userId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Get pagination parameters from query with defaults
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default to limit 10 if not provided
        const skip = (page - 1) * limit; // Skip the appropriate number of records

        // Get total count of notifications for pagination info
        const totalNotifications = await Notification.countDocuments({ userId });

        // Fetch paginated notifications
        const notifications = await Notification.find({ userId })
            .skip(skip) // Skip records based on pagination
            .limit(limit) // Limit the number of records per page

        // Send response with notifications and pagination info
        res.status(200).json({
            notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalNotifications / limit),
                totalItems: totalNotifications,
                itemsPerPage: limit,
                hasNextPage: page * limit < totalNotifications,
                hasPrevPage: page > 1,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getNotificationRecipients = async (req, res) => {
    try {
        const [users, sellers, admins] = await Promise.all([
            User.find().select('_id name email'),
            AdminSeller.find({ role: 'seller' }).select('_id name email'),
            AdminSeller.find({ role: 'admin' }).select('_id name email'),
        ]);
        const recipients = [
            ...users.map((u) => ({ _id: u._id, name: u.name, email: u.email, accountType: 'User' })),
            ...sellers.map((s) => ({ _id: s._id, name: s.name, email: s.email, accountType: 'Seller' })),
            ...admins.map((a) => ({ _id: a._id, name: a.name, email: a.email, accountType: 'Admin' })),
        ];
        res.status(200).json({ recipients });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Send Notifications for Movie Releases
const sendMovieReleaseNotifications = async () => {
    try {
        const moviesReleasingTomorrow = await Movie.find({
            releaseDate: new Date(new Date().setDate(new Date().getDate() + 1))
        });

        if (moviesReleasingTomorrow.length > 0) {
            const users = await User.find();
            for (const user of users) {
                for (const movie of moviesReleasingTomorrow) {
                    const title = `Movie Release Tomorrow: ${movie.title}`;
                    const body = `Don't forget to watch ${movie.title} tomorrow! Release Date: ${movie.releaseDate}`;
                    await createNotificationRecord(title, user._id, body, { senderName: 'System', senderRole: 'System' });
                }
            }
        }
    } catch (error) {
        console.error('Error sending movie release notifications:', error.message);
    }
};

// Send Notification for Subscription Plan Added
const sendSubscriptionPlanNotification = async (plan) => {
    try {
        const users = await User.find();
        const title = 'New Subscription Plan Available!';
        const body = `A new subscription plan named "${plan.name}" is now available for you! Check it out!`;

        for (const user of users) {
            await createNotificationRecord(title, user._id, body, { senderName: 'System', senderRole: 'System' });
        }
    } catch (error) {
        console.error('Error sending subscription plan notification:', error.message);
    }
};

// Schedule Movie Release Notifications (to be called once a day at 12 PM)
const scheduleMovieReleaseNotifications = () => {
    const job = cron.schedule('0 12 * * *', () => {
        sendMovieReleaseNotifications();
    });
    job.start();
};




module.exports = {
    addNotification,
    deleteNotification,
    getNotification,
    getAllNotifications,
    getNotificationRecipients,
    sendMovieReleaseNotifications,
    sendSubscriptionPlanNotification,
    scheduleMovieReleaseNotifications
};
