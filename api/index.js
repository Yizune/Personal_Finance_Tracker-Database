const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv');
const PORT = process.env.PORT || 5002;

const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'Script' directory
app.use('/Script', express.static(path.join(__dirname, 'Script')));

app.use(cors());
app.use(express.json());

const connectDB = require('./config/connection.js');

// Connect to database
connectDB();

// Getting access to the routes (which then gets access to the controller)
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/transactions', transactionRoutes);

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/settings', settingsRoutes);

const categoriesRoutes = require('./routes/categoriesRoutes');
app.use('/categories', categoriesRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Legacy server listening on port ${PORT}`);
    });
}

console.log('The script is running successfully');

// Export for Vercel serverless
module.exports = app;

