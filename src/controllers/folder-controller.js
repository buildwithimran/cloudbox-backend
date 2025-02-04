const Folder = require('../models/folder-model');
const File = require('../models/file-model');
const path = require('path');
const fs = require('fs');

// 1. Create a Folder
const createFolder = async (req, res) => {
    const { name } = req.body;

    try {
        // 1. Check if name is provided
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Folder name is required' });
        }

        // 2. Trim name and prevent excessive length
        const folderName = name.trim();
        if (folderName.length < 3 || folderName.length > 50) {
            return res.status(400).json({ message: 'Folder name must be between 3 and 50 characters' });
        }

        // 3. Prevent special characters (only allow letters, numbers, spaces, underscores, and dashes)
        const validNameRegex = /^[a-zA-Z0-9 _-]+$/;
        if (!validNameRegex.test(folderName)) {
            return res.status(400).json({ message: 'Folder name contains invalid characters' });
        }

        // 4. Check for reserved folder names
        const reservedNames = ['admin', 'system', 'root', 'null', 'undefined'];
        if (reservedNames.includes(folderName.toLowerCase())) {
            return res.status(400).json({ message: 'This folder name is reserved and cannot be used' });
        }

        // 5. Check if folder name already exists (to enforce uniqueness)
        const existingFolder = await Folder.findOne({ name: folderName });
        if (existingFolder) {
            return res.status(400).json({ message: 'A folder with this name already exists' });
        }

        // 6. Create and save folder
        const folder = new Folder({ name: folderName });
        await folder.save();

        res.status(201).json(folder);
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. Get All Folders
const getFolders = async (req, res) => {
    try {
        const folders = await Folder.find();
        res.status(200).json(folders);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching folders' });
    }
};

// 3. Get Folder by ID
const getFolderById = async (req, res) => {
    try {
        // Extract folder ID from URL parameters
        const { id } = req.params;

        // Find folder by ID
        const folder = await Folder.findById(id);

        // If folder is not found, send 404
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Send the found folder
        res.status(200).json(folder);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching folder by ID', error: error.message });
    }
};

// 4. Delete Folder
const deleteFolder = async (req, res) => {
    const { id } = req.params;

    try {
        const folder = await Folder.findById(id);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }

        // Optional: Check if folder contains files before deleting
        const files = await File.find({ folderId: id });

        // Wait for all files to be deleted before deleting the folder
        for (let i = 0; i < files.length; i++) {
            const filePath = path.resolve(__dirname, '..', '..', files[i].path);

            // Delete the file from the filesystem
            await new Promise((resolve, reject) => {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        reject(new Error("Error deleting file from filesystem"));
                    } else {
                        resolve();
                    }
                });
            });

            // Delete the file record from the database
            await File.findByIdAndDelete(files[i]._id);
        }

        // Delete the folder from the database
        await Folder.findByIdAndDelete(id);

        // Send the final response after folder and files are deleted
        res.status(200).json({ message: "Folder deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error deleting folder or files" });
    }
};

// 5. Edit Folder
const editFolder = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        // 1. Check if name is provided
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Folder name is required' });
        }

        // 2. Trim name and prevent excessive length
        const folderName = name.trim();
        if (folderName.length < 3 || folderName.length > 50) {
            return res.status(400).json({ message: 'Folder name must be between 3 and 50 characters' });
        }

        // 3. Prevent special characters (only allow letters, numbers, spaces, underscores, and dashes)
        const validNameRegex = /^[a-zA-Z0-9 _-]+$/;
        if (!validNameRegex.test(folderName)) {
            return res.status(400).json({ message: 'Folder name contains invalid characters' });
        }

        // 4. Check for reserved folder names
        const reservedNames = ['admin', 'system', 'root', 'null', 'undefined'];
        if (reservedNames.includes(folderName.toLowerCase())) {
            return res.status(400).json({ message: 'This folder name is reserved and cannot be used' });
        }

        // 5. Check if folder with the new name already exists (to enforce uniqueness)
        const existingFolder = await Folder.findOne({ name: folderName });
        if (existingFolder && existingFolder._id.toString() !== id) {
            return res.status(400).json({ message: 'A folder with this name already exists' });
        }

        // 6. Update folder name
        const folder = await Folder.findById(id);
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Update folder name
        folder.name = folderName;
        await folder.save();

        res.status(200).json(folder);
    } catch (error) {
        console.error('Error editing folder:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { createFolder, editFolder, getFolders, getFolderById, deleteFolder };
