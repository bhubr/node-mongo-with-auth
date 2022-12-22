const mongoose = require("mongoose");
const express = require("express");
// const { probe } = require("tcp-ping-sync");

const { mongoHost, port } = require("./settings");
const connectToMongo = require("./connect-to-mongo");

// Initialize a mongo model
const Cat = mongoose.model("Cat", { name: String });

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  const cats = await Cat.find();
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
  console.log("\n\n>>>> APP STARTUP\n\n");

  // had problems with reaching the mongo container from the app container
  // console.log("pinging", mongoHost);
  // const isGoogleReachable = probe(mongoHost, 27017);
  // console.log(isGoogleReachable);

  await connectToMongo();

  app.listen(port, () => console.log(`listening on ${port}`));

  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
