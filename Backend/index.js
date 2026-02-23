const express = require("express");
const app = express();
const path = require('path');
const movieRoutes = require('./routes/movieRoutes')
const authRoutes = require('./routes/authRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const PORT = 9000
const cors = require("cors");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hello");
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize());


app.use('/api/movies', movieRoutes);
app.use('/api/reviews',reviewRoutes)
app.use('/api/auth',authRoutes);



app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});