const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// Root Route 
app.get('/', (req, res) => {
  res.send('API Page');
});

app.get("/test-token", async (req, res) => {
  await ensureToken();
  res.json({ token: accessToken });
});


const { ensureToken } = require('./services/spotify');

app.get("/test-token", async (req, res) => {
  await ensureToken();
  res.json({ message: "Token refreshed successfully" });
});


// Routes

const trackRoutes = require('./routes/track');
app.use('/api/track', trackRoutes);


const port = process.env.PORT || 5000 

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

});