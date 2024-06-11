const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const { runFeedProductDaily } = require("./controllers/brandgatecontroller");
const productsRoutes = require("./routes/ProductRoutes");
const { runPrintifyDaily } = require("./controllers/PrintifyController");
const orderProduct = require("./controllers/orderProduct");
const runAliExpressDaily = require("./controllers/aliexpress");
const Noti = require("./model/noti");
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
runAliExpressDaily()

app.get("/", (req, res) => {
    console.log("Hello MEVN Soldier");
    res.status(201).json({ message: "working" });
});

app.use("/api/printify", productsRoutes);
app.post("/api/webhook", orderProduct)

app.post("/api/noti", async (req, res) => {
    try {
        const body = req.body
        if (!body) {
            return res.status(400).json({ message: "send endpoint object" })
        }
        await Noti.create(body)
        res.status(200).json({ message: "created" })
    } catch (error) {
        res.status(500).json({ message: "error occured" })
    }
})

app.post("/api/noti/:id", async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({ message: "send endpoint object" })
        }
        await Noti.findByIdAndDelete(id)
        res.status(200).json({ message: "deleted" })
    } catch (error) {
        res.status(500).json({ message: "error occured" })
    }
})

app.get("/api/noti", async (req, res) => {
    try {
        const noti = await Noti.find({})
        res.status(200).json(noti)
    } catch (error) {
        res.status(500).json({ message: "error occured" })
    }
})

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
});
