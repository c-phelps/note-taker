const notes = require("express").Router();
const fs = require("fs");
const util = require("util");

const readFromFile = util.promisify(fs.readFile);

const readAndAppend = (content, file) => {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      fs.writeFile(file, JSON.stringify(parsedData, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData updated in ${file}`)
      );
    }
  });
};

const uuid = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

notes.post("/", (req, res) => {
  console.info(`${req.method} request received to add a review.`);
  const { title, text } = req.body;
  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    readAndAppend(newNote, "./db/db.json");

    const response = {
      status: "success",
      body: newNote,
    };
    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note.");
  }
});

notes.get("/", (req, res) => {
  console.info(`${req.method} request received for notes.`);
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)));
});

notes.delete("/:id", (req, res) => {
  console.info(`${req.method} request received to delete a note.`);
  const noteId = req.params.id;
  const file = "./db/db.json";
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      const newData = parsedData.filter((obj) => obj.id !== noteId);

      fs.writeFile(file, JSON.stringify(newData, null, 4), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Failed to write data to file." });
        }

        const responseMessage = `Note with ID ${noteId} has been deleted.`;
        console.info(responseMessage);
        res.status(200).json({ message: `Note with ID ${noteId} has been deleted.` });
      });
    }
  });
});

module.exports = notes;
