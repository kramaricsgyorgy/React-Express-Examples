const express = require("express");
const app = express();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
require("dotenv").config();
const port = process.env.PORT;
const mongoDB = process.env.MONGODB;

const todoSchema = mongoose.Schema({
  _id: String,
  task: String,
  done: { type: Boolean, required: true },
  created: Date
});
const Todo = mongoose.model("Todo", todoSchema);

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/todo", async (req, res, next) => {
  try {
    const todos = await Todo.find().sort({ created: -1 });
    res.json(todos);
  } catch (e) {
    next(e);
  }
});

app.post("/add", async (req, res, next) => {
  try {
    const newTodo = new Todo(req.body);
    await newTodo.save();
    res.json("saved!");
  } catch (e) {
    next(e);
  }
});

app.post("/toggle", async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.body._id });
    todo.done = !todo.done;
    await todo.save();
    res.json("toggled!");
  } catch (e) {
    next(e);
  }
});

app.post("/delete", async (req, res, next) => {
  try {
    await Todo.findByIdAndRemove(req.body._id);
    res.json("deleted!");
  } catch (e) {
    next(e);
  }
});

app.use((err, request, response, next) => {
  console.log(err);
  response.status(500).send(err);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
  mongoose.connect(mongoDB);
});
