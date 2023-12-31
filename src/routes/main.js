const express = require("express");
const router = express.Router();

//importando controlador
const mainController = require("../controllers/mainController");

//llamando al controlador
router.get("/", mainController.home);
router.get("/admin", mainController.adminView);

module.exports = router;
