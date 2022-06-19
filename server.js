const express = require('express');
const http = require('http')
const socket = require('socket.io')
const mongoose = require('mongoose')
const passport = require('passport')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv');
dotenv.config()

//Bootstrap
const { addRootAdmin } = require('./controller/bootsrap')

//DB Connection
const { connectDb } = require('./db')


//MIDDILWARES
const app = express();
let server = http.createServer(app);
let io = socket(server);
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors())


const adminRoutes = require('./routes/adminRoutes')
const facultyRoutes = require('./routes/facultyRoutes')
const studentRoutes = require('./routes/studentRoutes')

//Passport Middleware
app.use(passport.initialize());

//Passport Config.
require('./config/passport')(passport)

app.use(morgan('dev'))

io.on('connection', (socket) => {
    socket.on('join room', ({ room1, room2 }) => {
        socket.join(room1)
        socket.join(room2)
    })
    socket.on("private message", (message) => {
        io.to(message.room).emit('new Message', {
            message: message.message,
            sender: message.sender
        });
    })
    socket.on('disconnect', function () {
        console.log('Socket disconnected');
    })
})


//ROUTES
app.use('/api/admin', adminRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/student', studentRoutes)


//Catching 404 Error
app.use((req, res, next) => {
    const error = new Error('INVALID ROUTE')
    error.status = 404
    next(error);
})

//Error handler function
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

const PORT = process.env.PORT || 5000;


server.listen(PORT, async () => {
    try {
        await connectDb()
        const res = await addRootAdmin()
        if (res.success) {
            console.log({
                "instance": true,
                "database": true,
                "port": 5000
            })
        }
        else {
            console.log("====ERROR====")
            console.log(res.message)
        }
    }
    catch (error) {
        console.log("SERVER IS NOT UP")
        console.log({
            "error": error.message
        })
    }

})

// process.env.MONGO_URL.replace("<password>", process.env.MONGO_PASSWORD
// "mongodb://127.0.0.1:27017/frontEndProject"

