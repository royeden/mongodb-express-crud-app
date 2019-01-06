const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const port = 3000;
const path = require('path');

const db = require('./db');
const collection = 'todo';

app.use(express.static('public'));

// read
app.get('/todos', (req, res) => {
  db.getDB()
    .collection(collection)
    .find({})
    .toArray((error, documents) => {
      if (error) {
        console.error(error);
      } else {
        console.info(documents);
        res.json(documents);
      }
    });
});

// edit
app.put('/:id', (req, res) => {
  const todoID = db.getPrimaryKey(req.params.id);
  const userInput = req.body;

  db.getDB()
    .collection(collection)
    .findOneAndUpdate(
      { _id: todoID },
      { $set: { todo: userInput.todo } },
      { returnOriginal: false },
      (error, result) => {
        if (error) {
          console.error(error);
        } else {
          res.json(result);
        }
      }
    );
});

// add
app.post('/', (req, res) => {
  const userInput = req.body;

  db.getDB()
    .collection(collection)
    .insertOne(userInput, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log(
          successMessages.added(result.ops[0]._id, 'todo', result.ops[0].todo)
        );
        res.json({ result, document: result.ops[0] });
      }
    });
});

// delete
app.delete('/:id', (req, res) => {
  const todoID = db.getPrimaryKey(req.params.id);

  db.getDB()
    .collection(collection)
    .findOneAndDelete({ _id: todoID }, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        res.json(result);
      }
    });
});

const messages = require('./messages');
const errorMessages = messages.errorMessages;
const successMessages = messages.successMessages;

db.connect(error => {
  if (error) {
    console.error(errorMessages.unableToConnect);
    process.exit(1);
  } else {
    app.listen(port, () => console.info(successMessages.connected(port)));
  }
});
