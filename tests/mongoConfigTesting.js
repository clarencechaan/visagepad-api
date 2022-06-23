const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

async function initializeMongoServer() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  mongoose.connect(mongoUri);

  mongoose.connection.on("error", (e) => {
    if (e.message.code === "ETIMEDOUT") {
      console.log(e);
      mongoose.connect(mongoUri);
    }
    console.log(e);
  });

  mongoose.connection.once("open", () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });

  mongoose.connection.once("close", () => {
    console.log(`MongoDB successfully closed`);
    mongoServer.stop();
  });
}

async function closeMongoServer() {
  await mongoose.connection.close();
}

module.exports = { initializeMongoServer, closeMongoServer };
