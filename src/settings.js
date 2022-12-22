const dotenv = require("dotenv");

// Get environment variables
dotenv.config();

// Build Mongo connection URL
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const authString =
  mongoUsername && mongoPassword ? `${mongoUsername}:${mongoPassword}@` : "";

const mongoHost = process.env.MONGO_HOST || "mongo";
const mongoDbName = process.env.MONGO_DBNAME || "nodemongo";
const mongoUrl = `mongodb://${authString}${mongoHost}:27017/${mongoDbName}?authSource=${mongoDbName}`;

// Port for app
const port = process.env.PORT || 5000;

module.exports = {
  mongoHost,
  mongoUrl,
  port,
};
