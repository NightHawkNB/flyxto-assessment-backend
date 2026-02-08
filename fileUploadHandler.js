import { UTApi } from "uploadthing/server";
import path from "path";

const utapi = new UTApi();

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const ALLOWED_EXTENSIONS = new Set([ ".jpg", ".jpeg", ".png", ".pdf"]);

export async function handleFileUpload(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type" });
    }

    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return res.status(400).json({ message: "Invalid file extension" });
    }

    // UploadThing server API upload
    const uploadResponse = await utapi.uploadFiles(
      new File([req.file.buffer], req.file.originalname, {
        type: req.file.mimetype,
      }),
    );

    // metadata about uploaded files
    console.log("Upload response:", uploadResponse);

    return res.json({
      success: true,
      file: uploadResponse.data,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
