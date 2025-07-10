// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./src/confiq/dbConfiq');
const dotenv = require('dotenv');
const routes = require('./src/interfaces/routes/index');
const morgan = require('morgan');
dotenv.config({ path: './src/.env' });
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydb';
const listEndpoints = require('express-list-endpoints');
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.get('/', (req, res) => {
    res.send('Server is running!');
});
app.use('/', routes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const endpoints = listEndpoints(app);
console.log(JSON.stringify(endpoints, null, 2));
// Connect to the database (does not block server startup)
connectDB(MONGO_URI).catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
});