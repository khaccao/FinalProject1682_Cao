const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

router.post("/createTask", taskController.createTask);
router.put("/updateTask/:id", taskController.updateTask);
router.delete("/deleteTask/:id", taskController.deleteTask);
router.put("/updateStatus/:id/status", taskController.updateStatus);
router.get("/getTasksByUserId/:userId", taskController.getTasksByUserId);
router.get("/getHistoryTaskCompletedByUserId/:userId", taskController.getHistoryTaskCompletedByUserId)

module.exports = router;
