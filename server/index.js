const express = require('express')
const path = require("path");

const app = express()

const options = {
  maxAge: 0
};

app.use(express.static(path.join(__dirname, "/../client")))

app.use('/js', express.static('../public/js', options))
app.use('/css', express.static('../public/js', options))

app.listen(3000, () => console.log('Example app listening on port 3000!'))