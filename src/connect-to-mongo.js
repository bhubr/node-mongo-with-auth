const { connect, connection } = require("mongoose");

const { mongoUrl } = require("./settings");

let attemptsCount = 1;
const retryInterval = 30000;

async function connectToMongo() {
  console.log(`attempt #${attemptsCount} to connect to mongo at ${mongoUrl}`);
  try {
    await connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    attemptsCount = 1;
  } catch (err) {
    // Note: this is where you would send errors to your error tracker
    console.error("failed to connect to mongo", err);
    const timeUntilRetrying = Math.min(
      retryInterval,
      2 ** attemptsCount * 1000
    );
    console.error(
      `will try reconnecting in ${timeUntilRetrying / 1000} seconds`
    );

    setTimeout(() => {
      attemptsCount += 1;
      connectToMongo();
    }, timeUntilRetrying);
  }
}

const mongooseEvents = [
  "close",
  "connected",
  "disconnected",
  "disconnecting",
  "error",
  "fullsetup",
  "all",
  "reconnected",
  "reconnectFailed",
];

mongooseEvents.forEach((mongooseEvent) => {
  connection.on(mongooseEvent, (err) => {
    console.debug(
      `mongoose client event: ${mongooseEvent}. ${err ? `${err}` : ""}`
    );
  });
});

module.exports = connectToMongo;
