const express = require("express");
const cors = require('cors');
const helmet = require("helmet");
const tremendousRoutes = require("./routes/Tremendous.routes"),
    twilioRoutes = require("./routes/Twilio.routes"),
    userRoutes = require("./routes/user.routes");
require("dotenv").config();

const app = express()

app.enable('trust proxy')
app.set('x-powered-by' , 'Express.js');
app.use(cors());
app.use(express.json());

// https://www.npmjs.com/package/helmet
app.use(helmet());

app.use(tremendousRoutes);
app.use(twilioRoutes);
app.use(userRoutes);

// default if error
app.use((err, req, res, next) => {
    console.log(req.body); 
    console.log(err);
});

// default if no error, but no endpoint
app.use((req, res) => {
    console.log(req.url);
    res.status(400).send({
        message: "Error: not allowed."
    });
});

//Start the server
app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is listening on port ${process.env.PORT}.`);
});
