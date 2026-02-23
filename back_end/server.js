import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Client } from "@elastic/elasticsearch";

mongoose.connect("mongodb://localhost:27017/requirements")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

const esClient = new Client({ node: "http://localhost:9200" });

const app = express();
app.use(cors());
app.use(express.json());

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
    console.error("Search failed:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});
