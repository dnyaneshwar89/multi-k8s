const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
  url: "redis://redis:6379",
});

const sub = redisClient.duplicate();

const fib = (index) => {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
};

// * on every insert
sub.on("message", (channel, message) => {
  redisClient.hSet("values", message, fib(parseInt(message)));
});

// * subscribe to insert event
sub.subscribe("insert");
