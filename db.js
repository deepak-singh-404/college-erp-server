const mongoose = require('mongoose')

const connectDb = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(process.env.MONGO_URL.replace("<password>", process.env.MONGO_PASSWORD)
                , { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
            resolve(true)
        }
        catch (error) {
            reject(error)
        }
    })
}

module.exports = {connectDb}