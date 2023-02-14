const express = require("express");
const cors = require('cors');
// const { response } = require("express");
const tremendousRoutes = require("./routes/Tremendous.routes"),
    twilioRoutes = require("./routes/Twilio.routes"),
    userRoutes = require("./routes/user");
require("dotenv").config();

const app = express()

app.set('x-powered-by' , 'Express.js');
app.use(cors());
app.use(express.json());

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
    console.log(req.body);
    res.send("Error: not allowed.");
});

//Start the server
app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is listeining on port ${process.env.PORT}.`);
});
