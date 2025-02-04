var express = require("express");
var router = express.Router();

router.get("/", (req, res, next) => {
    return res.send(`
        <html>
            <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
                <h1 style="font-size: 100px; font-weight: bold;">Welcome to Cloud Box Backend</h1>
            </body>
        </html>
    `);
});

module.exports = router;
