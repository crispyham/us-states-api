require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/dbConn');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Serve a simple landing page at the root
app.get('/', (req, res) => {
  res.send('<h1>US States API</h1><p>Welcome to the US States API. Visit <a href="/states">/states</a> for API access.</p>');
});

// States API routes
const statesRouter = require('./routes/states');
app.use('/states', statesRouter);

// 404 catch-all
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).send('<h1>404 Not Found</h1>');
  } else if (req.accepts('json')) {
    res.status(404).json({ error: '404 Not Found' });
  } else {
    res.status(404).type('txt').send('404 Not Found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});