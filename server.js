const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const listItems = require("./routes/api/listItems");


const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Use Routes
app.use("/api/listitems", listItems);

// Set static folder
app.use(express.static("client"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "index.html"));
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
