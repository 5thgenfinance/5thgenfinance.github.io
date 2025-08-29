const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://svc_ro:ZxmatkWiJyXa0YVU@5gfdatapipe.be8riki.mongodb.net/';
const DB_NAME = 'DEV';
const COLLECTION_NAME = 'colRickRube';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB client
let db;
let collection;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        db = client.db(DB_NAME);
        collection = db.collection(COLLECTION_NAME);
        
        return client;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Aggregation pipeline for company summary
const getCompanySummaryPipeline = (matchStage = {}) => [
    { $unwind: "$data.company_info" },
    { $match: { 
        "data.company_info.ticker": { $ne: null },
        ...matchStage
    }},
    { $sort: { "data.interview_metadata.asofdate": -1 } },
    {
        $group: {
            _id: "$data.company_info.ticker",
            company_name: { $first: "$data.company_info.company_name" },
            most_recent_rating: { $first: "$data.company_info.company_rating" },
            ownership: { $first: "$data.company_info.ownership" },
            pos_comments: { $first: "$data.company_info.pos_comments" },
            neg_comments: { $first: "$data.company_info.neg_comments" },
            asofdate: { $first: "$data.interview_metadata.asofdate" },
            source: { $first: "$data.interview_metadata.source" },
            publication: { $first: "$data.interview_metadata.publication" },
            timestamp: { $first: "$data.company_info.timestamp" }
        }
    },
    {
        $project: {
            _id: 0,
            ticker: "$_id",
            company_name: 1,
            most_recent_rating: 1,
            ownership: 1,
            pos_comments: 1,
            neg_comments: 1,
            asofdate: 1,
            source: 1,
            publication: 1,
            timestamp: 1
        }
    },
    { $sort: { ticker: 1 } }
];

// Routes
app.get('/api/companies', async (req, res) => {
    try {
        const pipeline = getCompanySummaryPipeline();
        const companies = await collection.aggregate(pipeline).toArray();
        res.json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        database: db ? 'connected' : 'disconnected'
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
    try {
        await connectToMongoDB();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 Open http://localhost:${PORT} to view the application`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server (for local development only)
if (require.main === module) {
    startServer();
}

module.exports = app;