const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

// Workaround for some DNS environments where SRV resolution fails with default servers
if (process.env.MONGO_URI && process.env.MONGO_URI.startsWith('mongodb+srv')) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/debts', require('./routes/debts'));
app.use('/api/investments', require('./routes/investments'));

app.get("/", (req, res) => {
    res.send("Finance Tracker API Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});