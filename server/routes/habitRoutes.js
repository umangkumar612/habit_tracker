const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  create,
  getAll,
  getOne,
  update,
  remove
} = require("../controllers/habitController");

const router = express.Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware, getAll);
router.get("/:id", authMiddleware, getOne);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, remove);

module.exports = router;