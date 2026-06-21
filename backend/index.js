const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


const { ensureToken } = require("./services/spotify");

// Root route
app.get("/", (req, res) => {
  res.send("API Page");
});


app.get("/test-token", async (req, res) => {
  try {
    await ensureToken();
    res.json({ message: "Token refreshed successfully" });
  } 
  
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Token failed" });
  }
});


// Routes
const trackRoutes = require("./routes/track");
app.use("/api/track", trackRoutes);

// Server
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});