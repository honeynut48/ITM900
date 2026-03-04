import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { Client } from "@elastic/elasticsearch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ---- Static File Serving ----
// This makes http://localhost:3001/login.html work
app.use(express.static(path.join(__dirname, "../front_end")));

// ---- Connections ----
// Using 127.0.0.1 fixes the ENOTFOUND error for local development
mongoose.connect("mongodb://127.0.0.1:27017/requirements")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const esClient = new Client({ node: "http://127.0.0.1:9200" });

// ---- Auth Route ----
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  // Test User
  if (email === "admin@company.com" && password === "password123") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// ---- Search Route ----
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const results = await esClient.search({
      index: "documents",
      query: {
        multi_match: {
          query: q,
          fields: ["title^2", "content", "project", "artifactType"],
          fuzziness: "AUTO"
        }
      }
    });
    res.json(results.hits.hits.map(h => h._source));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("🚀 Server running at http://localhost:3001");
});