const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");

// Get environment variables
dotenv.config();

// Build Mongo connection URL
const mongoUsername = process.env.MONGO_USERNAME || "nodeapp";
const mongoPassword = process.env.MONGO_PASSWORD || "passwd";
const mongoHost = process.env.MONGO_HOST || "mongo";
const mongoDbName = process.env.MONGO_DBNAME || "nodemongo";
const mongoUrl = `mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:27017/${mongoDbName}`;

console.log(">>", mongoUrl);

// port for app
const port = process.env.PORT || 5000;

// Initialize a mongo model
const Cat = mongoose.model("Cat", { name: String });

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const cats = await Cats.find();
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mongo/Node</title>
  </head>
  <body>
    <ul>
    ${cats.map((c) => `<li>${c.name}</li>`).join("")}
    </ul>
    <form enctype="application/x-www-form-urlencoded" method="POST" action="/cats">
      <input name="name" placeholder="Felix" />
      <button type="submit">Add</button>
    </form>
  </body>
  </html>`);
});

app.post("/cats", async (req, res) => {
  const { name } = req.body;
  const kitty = new Cat({ name });
  await kitty.save();
  res.redirect("/");
});

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoUrl);

  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
