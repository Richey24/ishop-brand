const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 6000;
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const { runFeedProductDaily } = require("./controllers/brandgatecontroller");
const productsRoutes = require("./routes/ProductRoutes");
const dropShipRoutes = require("./routes/dropShipRoutes");
const { runPrintifyDaily } = require("./controllers/PrintifyController");
const orderProduct = require("./controllers/orderProduct");
const runAliExpressDaily = require("./controllers/aliexpress");
const runVisionDaily = require("./controllers/visionController");
const runSdDaily = require("./controllers/sdController");
const runFlDaily = require("./controllers/flController");
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(
    express.json({
        limit: "5mb",
        verify: (req, res, buf) => {
            req.rawBody = buf.toString();
        },
    }),
);
app.use(morgan("dev")); // configire morgan


mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => {
        console.log("Database is connected");
    })
    .catch((err) => {
        console.log({ database_error: err });
    });

// runFeedProductDaily()
// runPrintifyDaily()
// runAliExpressDaily()
// runVisionDaily()
runSdDaily()
// runFlDaily()

app.get("/", (req, res) => {
    console.log("Hello MEVN Soldier");
    res.status(201).json({ message: "working" });
});

app.use("/api/printify", productsRoutes);
app.use("/api/dropship", dropShipRoutes);
app.post("/api/webhook", orderProduct)

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
});
