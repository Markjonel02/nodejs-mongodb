const express = require("express");
const router = express.Router();

/* services */
const CreateServices = require("../services/Creates");
const RetrieveServices = require("../services/Retrieve");
const UpdateServices = require("../services/Update");
const DeleteServices = require("../services/Delete");

router.post("/create", async (req, res) => {
  const { name, address, age, eyecolor } = req.body;

  const result = await CreateServices(name, address, age, eyecolor);

  if (result) {
    res.status(200).send({
      status: result,
      message: "successfully created!",
    });
  } else {
    res.status(500).send({
      status: result,
      message: "not created",
    });
  }
});

router.post("/retrieve", async (req, res) => {
  const result = await RetrieveServices();

  if (result) {
    res.status(200).send(results);
  } else {
    res.status(500).send({
      status: result,
      message: "not Retrieve!",
    });
  }
});

router.post("/update", async (req, res) => {
  const { _id, obj } = req.body;

  const result = await UpdateServices(_id, obj);

  if (result) {
    res.status(200).send({
      status: result,
      message: "successfully Updated!",
    });
  } else {
    res.status(500).send({
      status: result,
      message: "not Updated!",
    });
  }
});

router.post("/delete", async (req, res) => {
  const { _id } = req.body;

  const result = await DeleteServices(_id);

  if (result) {
    res.status(200).send({
      status: result,
      message: "successfully Deleted!",
    });
  } else {
    res.status(500).send({
      status: result,
      message: "not Deleted",
    });
  }
});

module.exports = router;
