const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = 8080;

// Mongo connection string
const MONGO_USER = "root";
const MONGO_PASSWORD = "root_password";
const MONGO_EVENTS_DB = "react-query-test-db";
const MONGO_URI = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.wo7vs.mongodb.net/${MONGO_EVENTS_DB}?retryWrites=true&w=majority`

const app = express();

// middlewares
app.use(express.json());
app.use(cors());

// index route
app.get("/", function (req, res, next) {
  res.status(200).json({
    type: "success",
    message: "Server is up and running!",
    data: null,
  });
});

// page not found error handling middleware
app.use("*", (req, res, next) => {
  const error = {
    status: 404,
    message: "Api endpoint not found!",
  };
  next(error);
});

// global error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const { status = 500, message = "Server Error!", data = null } = err;
  res.status(status).json({
    type: "error",
    message,
    data,
  });
});

// async mongo connection
const main = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connection established!");
    app.listen(PORT, function () {
      console.log(`Web server listening on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
main();
