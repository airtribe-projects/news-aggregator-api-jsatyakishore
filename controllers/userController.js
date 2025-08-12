const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const users = {};
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.signup = async (req, res) => {
    const { name, email, password, preferences } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (users[email]) {
        return res.status(400).json({ error: 'User already exists' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users[email] = {
            name,
            email,
            password: hashedPassword,
            preferences: Array.isArray(preferences) ? preferences : ['movies', 'comics']
        };
        return res.status(200).json({ message: 'User created' });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Missing email or password' });
    }
    const user = users[email];
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    try {
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ email: user.email }, JWT_SECRET);
        return res.status(200).json({ token });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPreferences = (req, res) => {
    const user = users[req.user.email];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.status(200).json({ preferences: user.preferences });
};

exports.updatePreferences = (req, res) => {
    const user = users[req.user.email];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { preferences } = req.body;
    if (!Array.isArray(preferences)) {
        return res.status(400).json({ error: 'Preferences must be an array' });
    }
    user.preferences = preferences;
    res.status(200).json({ message: 'Preferences updated' });
};

exports.users = users;
