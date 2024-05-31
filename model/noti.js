const mongoose = require("mongoose");

const notiSchema = mongoose.Schema({
    noti: {
        type: Object,
        required: true
    }
})

const Noti = mongoose.model("noti", notiSchema)

module.exports = Noti