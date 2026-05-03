const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { AdminSeller, User } = require('../modules/adminSellerUser/AdminSellerUser');

const SECRET_KEY = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const app = express();
app.use(express.json());

async function comparePassword(plain, hash) {
    if (!plain || !hash || typeof hash !== 'string' || hash.length < 30) {
        return false;
    }
    try {
        return await bcrypt.compare(plain, hash);
    } catch {
        return false;
    }
}

// Function to login user
const loginUserSellerAdmin = async (req, res) => {
    const rawEmail = req.body?.email;
    const password = req.body?.password;
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    try {
        if (!email || password === undefined || password === null) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });

        if (user) {
            const stored = user.password || '';
            const looksLikeBcryptHash = stored.startsWith('$2');

            if (!looksLikeBcryptHash) {
                return res.status(401).json({
                    message:
                        'This account uses Google sign-in. Use “Continue with Google” instead of email and password.',
                });
            }

            const ok = await comparePassword(password, stored);
            if (!ok) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }

            const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
            return res.status(200).json({
                token,
                id: user._id,
                role: 'user',
                isSubscribed: user.isSubscribed,
                name: user.name || '',
                email: user.email || '',
                photo: user.photo || '',
                themeMode: user.themeMode || 'dark',
            });
        }

        const adminSeller = await AdminSeller.findOne({
            email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        });

        if (!adminSeller) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const ok = await comparePassword(password, adminSeller.password || '');
        if (!ok) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: adminSeller._id, role: adminSeller.role }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({
            token,
            id: adminSeller._id,
            role: adminSeller.role,
            isSubscribed: null,
            name: adminSeller.name || '',
            email: adminSeller.email || '',
            photo: adminSeller.photo || '',
            themeMode: adminSeller.themeMode || 'dark',
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Access denied, token missing' });
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Attach user details to the request
        next();
    });
};

// Middleware to authorize based on role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = String(req.user?.role || '').toLowerCase();
        const allowed = roles.map((r) => String(r).toLowerCase());
        if (!userRole || !allowed.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

// Routes — Google OAuth (lazy client so Railway env is always read correctly; trim avoids copy/paste whitespace)
const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const googleClientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
        if (!googleClientId) {
            return res.status(500).json({ message: 'Google OAuth is not configured on the server.' });
        }

        const client = new OAuth2Client(googleClientId);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                password: '',
                isSubscribed: false,
                photo: picture || '',
                themeMode: 'dark',
            });
        } else if (!user.name && name) {
            user.name = name;
            await user.save();
        }

        const jwtToken = jwt.sign(
            { id: user._id, role: 'user' },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token: jwtToken,
            id: user._id,
            role: 'user',
            isSubscribed: user.isSubscribed,
            email,
            name,
            picture,
            photo: user.photo || picture || '',
            themeMode: user.themeMode || 'dark',
        });
    } catch (error) {
        console.error('Error in Google Authentication:', error.message);
        res.status(401).json({
            message: 'Invalid Google credential',
            detail: error.message,
        });
    }
};


const uploadMovieCoverPhoto = async (req, res) => {
    try {
        console.log(req.file)
        if (!req.file) {
            return res.status(400).json({ message: 'Photo is required.' });
        }

        const movieId = req.params.id;
        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }

        // Store the file buffer in the `movieCoverPhoto` field
        console.log("The buffer: ", req.file.buffer)
        movie.movieCoverPhoto = req.file.buffer;

        // Save the updated movie document
        const updatedMovie = await movie.save();
        console.log(updatedMovie.movieCoverPhoto)
        res.status(200).json({
            data: updatedMovie
        });
    } catch (error) {
        console.error('Error uploading cover photo:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports = {
    loginUserSellerAdmin,
    authenticateToken,
    googleAuth,
    authorizeRoles
}