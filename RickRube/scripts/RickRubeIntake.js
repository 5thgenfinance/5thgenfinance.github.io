// ==============================
// JSON Ingestion Script with QA Fixes
// ==============================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const chokidar = require('chokidar');

const INPUT_FOLDER = 'C:\\MongoApps\\DEV\\RickRube\\intake';
const ARCHIVE_FOLDER = 'C:\\MongoApps\\DEV\\RickRube\\archive';
const ERROR_FOLDER = 'C:\\MongoApps\\DEV\\RickRube\\error';
const MONGO_URI = 'mongodb+srv://svc_rw:KB54sRecaazYBSRS@5gfdatapipe.be8riki.mongodb.net/';
const DB_NAME = 'DEV';
const COLLECTION_NAME = 'colRickRube';

// ======== Helper Functions ========

// Compute file checksum for integrity tracking
async function computeChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

// Wait for file write to complete by checking stable size twice
async function waitForFileReady(filePath, retries = 5, delay = 1000) {
  let prevSize = -1;
  for (let i = 0; i < retries; i++) {
    const { size } = await fs.promises.stat(filePath);
    if (size === prevSize) return true;
    prevSize = size;
    await new Promise(res => setTimeout(res, delay));
  }
  throw new Error(`File did not stabilize in time: ${filePath}`);
}

async function moveFileSafe(src, destDir) {
  await fs.promises.mkdir(destDir, { recursive: true });
  const base = path.basename(src);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(destDir, `${timestamp}_${base}`);
  await fs.promises.rename(src, dest);
  return dest;
}

// ======== Core Processing ========
async function processFile(filePath, client) {
  const filename = path.basename(filePath);

  try {
    // Make sure file is fully written
    await waitForFileReady(filePath);

    // Read file safely
    let jsonDoc;
    try {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      jsonDoc = JSON.parse(data);
    } catch (err) {
      throw new Error(`Invalid JSON or read error: ${err.message}`);
    }

    // Metadata
    const fileChecksum = await computeChecksum(filePath);
    const intake_metadata = {
      originalFilename: filename,
      ingestionDate: new Date().toISOString(),
      sourceFolder: INPUT_FOLDER,
      processed: false,
      fileChecksum,
      appName: 'RickRube'
    };

    const enrichedDoc = { intake_metadata, data: jsonDoc };

    // Insert into MongoDB
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const insertResult = await collection.insertOne(enrichedDoc);
    console.log(`✅ Inserted document with _id: ${insertResult.insertedId}`);

    // Verify insertion
    const verifyDoc = await collection.findOne({ _id: insertResult.insertedId });
    if (!verifyDoc) throw new Error('Verification failed: Document not found.');

    // Move to archive
    const archiveDest = await moveFileSafe(filePath, ARCHIVE_FOLDER);
    console.log(`📦 Moved file to archive: ${archiveDest}`);

  } catch (error) {
    console.error(`❌ Error processing ${filename}: ${error.message}`);
    const errorDest = await moveFileSafe(filePath, ERROR_FOLDER);
    console.log(`🚨 Moved file to error folder: ${errorDest}`);
  }
}

// ======== Main Script ========
async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Watcher
    const watcher = chokidar.watch(INPUT_FOLDER, {
      ignored: /^\./,
      persistent: true,
      depth: 0
    });

    watcher.on('add', async filePath => {
      if (filePath.endsWith('.json')) {
        console.log(`📥 Detected new file: ${path.basename(filePath)}`);
        await processFile(filePath, client);
      }
    });

    console.log(`👀 Watching folder: ${INPUT_FOLDER} for new JSON files...`);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⚠️ Shutting down...');
      await client.close();
      process.exit(0);
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    await client.close();
  }
}

main();
