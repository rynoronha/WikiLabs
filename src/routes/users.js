const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/users/sign_up", userController.signUp);

module.exports = router;
