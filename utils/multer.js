const multer = require("multer");
const path = require("path");
const fs = require('fs');


const storage = multer.diskStorage({
  // Set the destination for the uploaded file
  /**
   * Sets the destination folder for the uploaded file.
   * @author f-br-10
   * @param {Object} req - The request object.
   * @param {Object} file - The uploaded file object.
   * @param {function} cb - The callback function.
   * @returns {void}
   */
  destination: function (req, file, cb) {
    // Use the Node.js path module to join the current directory with the uploads folder
    cb(null, path.join(__dirname, "../uploads"));
  },
  /**
   * Generates a unique filename for a given file based on its original name and the current time.
   * @author f-br-10
   * @param {Object} req - The request object.
   * @param {Object} file - The file object.
   * @param {function} cb - The callback function.
   */
  filename: function (req, file, cb) {
    // Generate a unique suffix based on the current time and a random number.
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9); // 1e9 = 1_000_000_000
    // Get the original name of the file.
    const originalName = file.originalname;
    // Get the file extension of the original file.
    const fileExtension = path.extname(originalName);
    // Get the base name of the original file without its extension.
    const filename = path.basename(originalName, fileExtension);
    // Call the callback function with the generated filename.
    cb(null, filename + "-" + uniqueSuffix + fileExtension);
  },
});
/**
 * Filters the uploaded file to only accept image and video types
 * @author f-br-10
 * @param {Object} req - The request object
 * @param {Object} file - The uploaded file object
 * @param {function} cb - The callback function
 */
const fileFilter = (req, file, cb) => { console.log("multer middleware file filter -----------------------------------", file.mimetype);
  // Accept only image and video file types
  if (
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type " + file.mimetype), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });
