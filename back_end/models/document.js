import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  title: String,
  project: String,
  application: String,
  artifactType: String,
  owner: String,
  version: String,
  content: String,
  sourceSystem: String,
  originalPath: String,
  metadata: Object,
  traceability: Object
}, { timestamps: true });

export default mongoose.model("Document", DocumentSchema);