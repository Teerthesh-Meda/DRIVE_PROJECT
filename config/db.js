const mongoose = require('mongoose');

function connectToDB() {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("Conntected to db");
    })
}



module.exports = connectToDB;