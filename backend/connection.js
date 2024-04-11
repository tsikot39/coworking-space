require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
    return client;
  } catch (e) {
    console.error("Connection to MongoDB failed", e);
  }
}

module.exports = { client, run };
