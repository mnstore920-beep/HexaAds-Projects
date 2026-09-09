import { MongoClient } from "mongodb";

const uri =
  process.env.MONGODB_DIRECT_URI?.trim() ||
  process.env.MONGODB_URI?.trim();

if (!uri) {
  throw new Error(
    "Please define MONGODB_DIRECT_URI or MONGODB_URI in .env.local"
  );
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }

  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDatabase(dbName?: string) {
  const client = await clientPromise;
  return client.db(dbName || process.env.MONGODB_DB || "hexaads");
}

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "hexaads");
  return { client, db };
}

export default clientPromise;