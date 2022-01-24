const keys = require("./keys");

// * Express setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// * Postgress client setup

const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

// * Redis Client setup
const redis = require("redis");

// const redisClient = redis.createClient({
//   host: "redis",
//   port: keys.redisPort,
//   retry_strategy: () => 1000,
// });

const redisClient = redis.createClient({
  url: "redis://redis:6379",
});
redisClient.on("error", function (error) {
  console.log(`Error in redis connection: ${error}`);
});

const redisPublisher = redisClient.duplicate();

// * Routes
app.get("/", (req, res) => res.send("Express server working."));

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("select * from values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hGetAll("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) return res.status(422).send("Index too high.");

  redisClient.hSet("values", index, "Nothing Yet!");

  redisPublisher.publish("insert", index);

  pgClient.query("insert into values(number) values($1)", [index]);

  res.send({ working: true });
});

app.listen(5000, async (err) => {
  console.log("Listening");
  console.log("Connecting to redis...");
  await redisClient.connect();
  console.log("Connected to redis.");
  console.log("Connecting to redis publisher...");
  await redisPublisher.connect();
  console.log("Connected to redis publisher.");
});
