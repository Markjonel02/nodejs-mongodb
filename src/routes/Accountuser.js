const express = require("express");
const router = express.Router();

/* Services */
const CreateServices = require("../services/Creates");
const RetrieveServices = require("../services/Retrieve");
const UpdateServices = require("../services/Update");
const DeleteServices = require("../services/Delete");

/* Create */
router.post("/create", async (req, res) => {
  try {
    const { name, address, age, eyecolor } = req.body;
    const result = await CreateServices(name, address, age, eyecolor);

    res.status(result ? 200 : 500).send({
      success: result,
      message: result ? "Successfully created!" : "Creation failed!",
    });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

/* Retrieve (Changed to GET) */
router.get("/retrieve", async (req, res) => {
  try {
    const result = await RetrieveServices();

    res.status(result ? 200 : 500).send({
      success: !!result,
      data: result || null,
      message: result ? "Successfully retrieved!" : "Retrieval failed!",
    });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

/* Update */
router.put("/update", async (req, res) => {
  try {
    const { _id, obj } = req.body;
    const result = await UpdateServices(_id, obj);

    res.status(result ? 200 : 500).send({
      success: result,
      message: result ? "Successfully updated!" : "Update failed!",
    });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

/* Delete */
router.delete("/delete", async (req, res) => {
  try {
    const { _id } = req.body;
    const result = await DeleteServices(_id);

    res.status(result ? 200 : 500).send({
      success: result,
      message: result ? "Successfully deleted!" : "Deletion failed!",
    });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

module.exports = router;
