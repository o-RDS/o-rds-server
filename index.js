const express = require("express");
const cors = require('cors');
const { response } = require("express");
const tremendousRoutes = require("./routes/Tremendous.routes"),
    twilioRoutes = require("./routes/Twilio.routes"),
    userRoutes = require("./routes/user");



const app = express()

app.set('x-powered-by' , 'Express.js');
app.use(cors());
app.use(express.json());

app.use(tremendousRoutes);

app.use(twilioRoutes);

// app.use(userRoutes);

// default route
app.use((req, res) => {
    response.send("Error: not allowed.");
});

//Start the server
app.listen(process.env.PORT || 8080, () => {
    console.log(`Server is listening on port 8080.`);
});
