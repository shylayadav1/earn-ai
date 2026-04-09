const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");
require('dotenv').config();

// Initialize the File Manager with your API Key
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY);

async function uploadKnowledgeBase() {
  const files = [
    { name: "Tuition", path: "./data/Undergraduate Tuition and Fees — 2026-2027 - Finance.pdf" },
    { name: "Financial Aid", path: "./data/2026-27-fafsa-form.pdf" },
    { name: "Scholarships", path: "./data/Costs _ Purdue Polytechnic.pdf" }
  ];

  for (const file of files) {
    console.log(`Uploading ${file.name}...`);
    const uploadResult = await fileManager.uploadFile(file.path, {
      mimeType: "application/pdf",
      displayName: file.name,
    });

    let getFile = await fileManager.getFile(uploadResult.file.name);
    while (getFile.state === FileState.PROCESSING) {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      getFile = await fileManager.getFile(uploadResult.file.name);
    }

    console.log(`\nSuccess: ${file.name} is ready! URI: ${uploadResult.file.uri}`);
  }
}

uploadKnowledgeBase();