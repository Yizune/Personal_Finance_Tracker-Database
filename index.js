const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 5002;
require('dotenv').config();

const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the 'Script' directory
app.use('/Script', express.static(path.join(__dirname, 'Script')));

app.use(cors());
app.use(express.json());

const connectDB = require('./config/connection.js');
connectDB();

// Getting access to the routes (which then gets access to the controller)
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/transactions', transactionRoutes);

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/settings', settingsRoutes);

const categoriesRoutes = require('./routes/categoriesRoutes');
app.use('/categories', categoriesRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

console.log('The script is running successfully');

