const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const { runFeedProductDaily } = require("./controllers/brandgatecontroller");
const brandgaterouter = require("./routes/brandgaterouter");
const productsRoutes = require("./routes/ProductRoutes");
const { runPrintifyDaily } = require("./controllers/PrintifyController");
const orderProduct = require("./controllers/orderProduct");
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

runFeedProductDaily()
runPrintifyDaily()

app.get("/", (req, res) => {
    console.log("Hello MEVN Soldier");
    res.status(201).json({ message: "working" });
});

app.use("/api/brandgate", brandgaterouter)
app.use("/api/printify", productsRoutes);
app.post("/api/webhook", orderProduct)

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
});
