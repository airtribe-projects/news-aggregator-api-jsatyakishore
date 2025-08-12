const axios = require('axios');
const { users } = require('./userController');

const NEWS_API_KEY = process.env.NEWS_API_KEY || 'YOUR_NEWSAPI_KEY';
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

// In-memory cache and user article state
let newsCache = { articles: [], timestamp: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const userRead = {};
const userFavorites = {};

// Helper: fetch and update cache
async function updateNewsCache(preferences) {
    if (!process.env.NEWS_API_KEY || NEWS_API_KEY === 'YOUR_NEWSAPI_KEY') {
        // Dummy data for tests
        newsCache.articles = [
            { id: '1', title: 'Test News 1', category: preferences[0] || 'general', description: 'desc1' },
            { id: '2', title: 'Test News 2', category: preferences[1] || 'general', description: 'desc2' }
        ];
        newsCache.timestamp = Date.now();
        return newsCache.articles;
    }
    try {
        const requests = preferences.map(category =>
            axios.get(NEWS_API_URL, {
                params: {
                    apiKey: NEWS_API_KEY,
                    category,
                    country: 'us',
                    pageSize: 5
                }
            })
        );
        const responses = await Promise.allSettled(requests);
        let articles = [];
        responses.forEach(r => {
            if (r.status === 'fulfilled' && r.value.data && Array.isArray(r.value.data.articles)) {
                articles = articles.concat(r.value.data.articles);
            }
        });
        // Assign unique IDs to articles
        articles = articles.map((a, i) => ({ ...a, id: a.url || String(i) }));
        newsCache.articles = articles;
        newsCache.timestamp = Date.now();
        return articles;
    } catch (err) {
        return [];
    }
}

// Periodic cache update
setInterval(async () => {
    // For demo, update cache for last used preferences or default
    const prefs = newsCache.articles.length && newsCache.articles[0].category ? [newsCache.articles[0].category] : ['general'];
    await updateNewsCache(prefs);
}, CACHE_TTL);

exports.getNews = async (req, res) => {
    const user = users[req.user.email];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const preferences = user.preferences || [];
    if (!Array.isArray(preferences) || preferences.length === 0) {
        return res.status(400).json({ error: 'No preferences set' });
    }
    // Check cache
    if (Date.now() - newsCache.timestamp > CACHE_TTL || !newsCache.articles.length) {
        await updateNewsCache(preferences);
    }
    // Filter articles by user preferences
    const filtered = newsCache.articles.filter(a => preferences.includes(a.category));
    res.status(200).json({ news: filtered });
};

// Mark as read
exports.markRead = async (req, res) => {
    const user = users[req.user.email];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    if (!userRead[req.user.email]) userRead[req.user.email] = new Set();
    userRead[req.user.email].add(id);
    res.status(200).json({ message: 'Article marked as read' });
};

// Mark as favorite
exports.markFavorite = async (req, res) => {
    const user = users[req.user.email];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    if (!userFavorites[req.user.email]) userFavorites[req.user.email] = new Set();
    userFavorites[req.user.email].add(id);
    res.status(200).json({ message: 'Article marked as favorite' });
};

// Get all read articles
exports.getRead = async (req, res) => {
    const user = users[req.user.email];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const ids = Array.from(userRead[req.user.email] || []);
    const articles = newsCache.articles.filter(a => ids.includes(a.id));
    res.status(200).json({ news: articles });
};

// Get all favorite articles
exports.getFavorites = async (req, res) => {
    const user = users[req.user.email];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const ids = Array.from(userFavorites[req.user.email] || []);
    const articles = newsCache.articles.filter(a => ids.includes(a.id));
    res.status(200).json({ news: articles });
};

// Search news articles by keyword
exports.searchNews = async (req, res) => {
    const user = users[req.user.email];
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { keyword } = req.params;
    if (!keyword) return res.status(400).json({ error: 'Keyword required' });
    // Ensure cache is up to date
    if (Date.now() - newsCache.timestamp > CACHE_TTL || !newsCache.articles.length) {
        await updateNewsCache(user.preferences || ['general']);
    }
    const results = newsCache.articles.filter(a =>
        (a.title && a.title.toLowerCase().includes(keyword.toLowerCase())) ||
        (a.description && a.description.toLowerCase().includes(keyword.toLowerCase()))
    );
    res.status(200).json({ news: results });
};
