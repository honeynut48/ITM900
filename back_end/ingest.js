import fs from "fs-extra";
import path from "path";
import mammoth from "mammoth";
import mongoose from "mongoose";
import Document from "./models/Document.js";
import { esClient } from "./elastic.js";

mongoose.connect("mongodb://localhost:27017/requirements");

const BASE_DIR = "../mock_data";

async function ingest(dir) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await ingest(fullPath);
    } else if (file.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: fullPath });

      const parts = fullPath.split(path.sep);
      const project = parts[1];
      const artifactType = parts[2];

      const doc = await Document.create({
        title: file,
        project,
        application: "Insurance Platform",
        artifactType,
        owner: "Mock Import",
        version: (file.match(/v\d+/i) || ["v1"])[0],
        content: result.value,
        sourceSystem: "Local Mock Data",
        originalPath: fullPath,
        metadata: { tags: [project, artifactType] }
      });

      await esClient.index({
        index: "documents",
        id: doc._id.toString(),
        document: {
          title: doc.title,
          content: doc.content,
          project,
          artifactType
        }
      });

      console.log("Ingested:", file);
    }
  }
}

ingest(BASE_DIR);