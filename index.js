const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const morgan = require("morgan");
const cors = require("cors");
const brandGateRouter = require("./routes/brandgateroute")
const app = express();


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // configire morgan

app.get("/", (req, res) => {
    console.log("Hello MEVN Soldier");
    res.status(201).json({ message: "working" });
});

app.use("/api/brandgate", brandGateRouter)


app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
});
