
// file upload
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads'); // specify the destination folder
  },
  filename: function (req, file, cb) {
    // generate a unique filename, you can customize this logic
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

module.exports = upload;