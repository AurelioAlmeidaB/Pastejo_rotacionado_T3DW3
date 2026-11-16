const express = require("express");
require("dotenv").config({ quiet: true });

const router = require("./routes/router");

const app = express();
const port = process.env.PORT || 43000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(router);

app.listen(port, () => {
  console.log("Executando a aplicação:", process.env.APP_NAME);
  console.log(`App listening at port ${port}`);
});
