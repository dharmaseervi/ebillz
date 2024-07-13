import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI, {

});

const clientPromise = client.connect().then(client => {
    return client;
}).catch(err => {
    console.error("MongoDB connection error", err);
    throw err;
});

export default clientPromise;
