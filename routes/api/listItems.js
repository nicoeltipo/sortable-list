const express = require("express");
const router = express.Router();

// Get Models
var ListItem = require("../../models/ListItem");

// GET api/listitems
// Get all list items
router.get("/", (req, res) => {
  ListItem.find({}, { image: 0 })
    .sort({ displayOrder: 1 })
    .then(items => {
      res.json(items);
    })
    .catch(err => res.status(404).json({ itemnotfound: "No items found" }));
});

// GET api/listitems/count
// Get count of list items
router.get("/count", (req, res) => {
  ListItem.countDocuments()
    .then(count => {
      res.json(count);
    })
    .catch(err => res.status(404).json({ itemnotfound: "No items found" }));
});

// POST api/listitems
// Create list item
router.post("/", (req, res) => {
  const split = req.body.imgFile.split(",");
  const base64string = split[1];
  const buffer = new Buffer(base64string, "base64");
  const newItem = new ListItem({
    description: req.body.description,
    displayOrder: req.body.displayOrder,
    image: {
      data: buffer,
      fileName: req.body.fileName,
      contentType: req.body.contentType
    }
  });
  newItem
    .save()
    .then(item => {
      const resObj = {
        _id: item._id,
        description: item.description,
        displayOrder: item.displayOrder
      };
      res.json(resObj);
    })
    .catch(err => {
      res.status(404).json({ inserterror: "Error inserting item" });
    });
});

// GET api/listitems/img/:imageId
// Get item image
router.get("/img/:id", (req, res) => {
  ListItem.findById(req.params.id)
    .then(img => {
      res.contentType(img.image.contentType);
      res.s;
      res.end(img.image.data);
    })
    .catch(err => {
      res.status(404).json({ itemnotfound: "No items found" });
    });
});

// DELETE api/listitems/:id
// Delete item
router.delete("/:id", (req, res) => {
  ListItem.findById(req.params.id)
    .then(item => {
      item.remove().then(() => res.json({ success: true }));
    })
    .catch(err => res.status(404).json({ itemnotfound: "No items found" }));
});

// PUT api/listitems/:id
// Update image
router.put("/:id", (req, res) => {
  var listItem = new ListItem({
    _id: req.params.id,
    description: req.body.description
  });
  if (req.body.updateImg) {
    const split = req.body.imgFile.split(",");
    const base64string = split[1];
    const buffer = new Buffer(base64string, "base64");
    listItem = {
      _id: req.params.id,
      description: req.body.description,
      image: {
        data: buffer,
        fileName: req.body.fileName,
        contentType: req.body.contentType
      }
    };
  }
  ListItem.findOneAndUpdate(
    { _id: req.params.id },
    { $set: listItem },
    { new: true }
  )
    .then(item => {
      const resObj = {
        _id: item._id,
        description: item.description
      };
      res.json(resObj);
    })
    .catch(err => res.status(404).json({ itemnotfound: "No items found" }));
});

// PATCH api/listitems/
// Update several items
router.patch("/", (req, res) => {
  const items = req.body;

  var allUpdates = [];
  items.forEach(function(item) {
    var updatePromise = ListItem.update(
      { _id: item._id },
      { $set: { displayOrder: item.displayOrder } }
    );
    allUpdates.push(updatePromise);
  });
  Promise.all(allUpdates)
    .then(item => {
      res.json(item);
    })
    .catch(err =>
      res.status(404).json({ updateerror: "Error updating items" })
    );
});
module.exports = router;
