const multer = require('multer');
const fs = require('fs');
const path = require('path');
const File = require('../models/file-model');
const Folder = require('../models/folder-model');

// Set up Multer for file storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the folder where files will be uploaded
        cb(null, 'src/uploads/');  // Make sure 'uploads' folder exists
    },
    filename: (req, file, cb) => {
        // Use timestamp and original file name for the filename
        const timestamp = Date.now();
        cb(null, `${timestamp}-${file.originalname}`);
    },
});

// Initialize multer with storage settings
const upload = multer({ storage: storage });

// Function to get files in a specific folder
const getFilesInFolder = async (req, res) => {
    const { folderId } = req.params;
    try {
        const files = await File.find({ folderId });
        res.status(200).json(files);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching files' });
    }
};

// Function to delete a file
const deleteFile = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the file by its ID
        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }

        const filePath = path.resolve(__dirname, '..', '..', file.path);

        // Delete the file from the filesystem
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ error: "Error deleting file from filesystem" });
            }

            // Delete the file record from the database
            File.findByIdAndDelete(id)
                .then(() => {
                    res.status(200).json({ message: "File deleted successfully" });
                })
                .catch((error) => {
                    res.status(500).json({ error: "Error deleting file record from database" });
                });
        });
    } catch (error) {
        res.status(500).json({ error: "Error deleting file" });
    }
};

// Function to upload a file
const uploadFile = async (req, res) => {
    let { folderId } = req.body; // Extract folderId from request

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        // If no folderId is provided, check if "Home" folder exists
        if (!folderId) {
            let homeFolder = await Folder.findOne({ name: "Home" });

            if (!homeFolder) {
                // If "Home" folder does not exist, create one
                homeFolder = new Folder({
                    name: "Home", 
                    createdAt: new Date(),
                });
                homeFolder = await homeFolder.save(); // Save to DB
            }

            folderId = homeFolder._id; // Use the "Home" folder ID
        }

        // File details after being uploaded by Multer
        const filePath = req.file.path;
        const filename = req.file.filename.split('-')[0]; // Extract timestamp part

        // Save file metadata in the database
        const newFile = new File({
            name: req.file.originalname,  // Original file name
            folderId: folderId,           // Folder ID (existing or new)
            filename: filename,           // Store filename without timestamp
            path: filePath,               // Full file path
        });

        await newFile.save();
        res.status(201).json({ message: "File uploaded successfully", file: newFile });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Error uploading file" });
    }
};

// Download File
const downloadFile = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Find file by ID
        const file = await File.findById(id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // 2. Construct the file path (assuming the file path is stored in the DB)
        const filePath = path.resolve(__dirname, '..', '..', file.path); // Adjust according to where your files are stored        
        // 3. Check if the file exists on the server
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File does not exist on server' });
        }

        // 4. Set response headers to indicate file download
        res.download(filePath, file.name, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Export the controller functions
module.exports = { upload, uploadFile, getFilesInFolder, deleteFile, downloadFile };
