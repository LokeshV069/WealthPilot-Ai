import mongoose from 'mongoose';

export const dbStatus = {
  connected: false,
  usingFallback: false,
  error: null,
};

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wealthpilot';

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // Quick timeout to failover gracefully if no local mongo
    });

    dbStatus.connected = true;
    dbStatus.usingFallback = false;
    dbStatus.error = null;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return true;
  } catch (err) {
    dbStatus.connected = false;
    dbStatus.usingFallback = true;
    dbStatus.error = err.message;

    console.warn(`[MongoDB Notice] Could not connect to MongoDB at "${uri}".`);
    console.warn(`[MongoDB Notice] ${err.message}`);
    console.log(`[MongoDB Notice] Activating resilient in-memory fallback store so your authentication and API work out-of-the-box!`);
    console.log(`[MongoDB Tip] To connect to MongoDB Cloud (free Atlas): set MONGODB_URI in server/.env`);
    return false;
  }
}
