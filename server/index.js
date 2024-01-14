const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");

const { connectToMongoDB } = require("./config/MongoConnection");
const routes = require("./routes");

const app = express();

// Bodyparser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// Connect to MongoDB
connectToMongoDB();

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// API Routes
app.use("/", routes);

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));
