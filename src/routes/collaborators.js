const express = require("express");
const router = express.Router();
const collaboratorController = require("../controllers/collaboratorController");
const validation = require("./validation");

router.get("/wikis/:wikiId/collaborators", collaboratorController.edit);
router.post("/wikis/:wikiId/collaborators/add", collaboratorController.add);
router.post("/wikis/:wikiId/collaborators/remove", collaboratorController.remove);

module.exports = router;
