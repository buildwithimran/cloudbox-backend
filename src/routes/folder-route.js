const express = require('express');
const { createFolder, editFolder, getFolders, getFolderById, deleteFolder } = require('../controllers/folder-controller');

const router = express.Router();

router.post('/', createFolder);
router.get('/', getFolders);
router.get('/:id', getFolderById);
router.delete("/:id", deleteFolder);
router.put('/:id', editFolder);

module.exports = router;
