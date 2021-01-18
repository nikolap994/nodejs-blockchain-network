const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

const port = process.argv[2];

require("./routes/index")(app);

app.listen(port, function () {
    console.log(`> listening on port ${port}...`);
});
