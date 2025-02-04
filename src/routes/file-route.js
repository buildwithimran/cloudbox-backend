const router = require('express').Router();
const { upload, uploadFile, getFilesInFolder, deleteFile, downloadFile } = require('../controllers/file-controller');

router.get('/:folderId', getFilesInFolder);
router.delete("/:id", deleteFile);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:id', downloadFile);

module.exports = router;
