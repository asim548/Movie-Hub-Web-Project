const {User} = require("./AdminSellerUser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendMail = require("../notification/EmailNotifications");

const registerUser = async (req, res) => {
    console.log(req.body);
    console.log("Backend")
    const user = new User(req.body);
    const { email } = req.body;
    if (!email)
        return res.status(400).send('Invalid Fields');

    if (!email.includes('@')) 
        return res.status(400).send('Invalid email format');

    const foundUser = await User.findOne({ email: email });

    if (foundUser) {
        return res.status(400).send('User already exists');
    } else {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.isSubscribed = false;

        await user.save();
        await sendMail(
            user.email,
            "Welcome to MovieHub",
            `Hi ${user.name || "there"}, your MovieHub user account has been created successfully.`
        );
        res.status(201).send(user);
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .populate('moviesWishlist')
            .populate('userActivity')
            .populate('userPreferences.favoriteActorsOrDirectors');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getSubscriptionForUser = async (req, res) => {
    try {
        console.log("asssssssssssssssssss")
        const userId = req.params.userId;

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
            console.log(user.isSubscribed)
        res.status(200).json(user.isSubscribed);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
       

        const users = await User.find()
            // .limit(noOfEntries)
            .populate('moviesWishlist')
            .populate('userActivity')
            .populate('userPreferences.favoriteActorsOrDirectors');

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        console.log('updateProfile called');
        const userId = req.body._id;
        const userData = { ...req.body };
        console.log(userId);
        if (userData.themeMode && !['dark', 'light'].includes(userData.themeMode)) {
            delete userData.themeMode;
        }
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, userData, {
            new: true,
            runValidators: true,
        })
            .populate('moviesWishlist')
            .populate('userActivity')
            .populate('userPreferences.favoriteActorsOrDirectors');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found or already deleted' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId)
            .populate('moviesWishlist')
            .select('moviesWishlist');

        if (!user) {
            return res.status(404).json({ message: 'No movies found' });
        }

        res.status(200).json(user.moviesWishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMoviesBasedOnUserActivities = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId)
            .populate('userActivity')
            .select('userActivity');

        if (!user) {
            return res.status(404).json({ message: 'No user activity found' });
        }

        res.status(200).json(user.userActivity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {getSubscriptionForUser,
    registerUser,
    getProfile,
    getAllUsers,
    updateProfile,
    deleteUser,
    getUserWishlist,
    getMoviesBasedOnUserActivities,
};
