const fs = require("fs");

// deleteFile: Helper function to delete a file
//
// filePath: string, the path of the file to be deleted
//
// Deletes a file at the given file path. If an error occurs, it is logged to the console.
exports.deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("Failed to delete file:", err);
    }
  });
};
