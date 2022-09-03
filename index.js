const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const errorHandler = require("./middleware/errorHandler");
const fs = require("fs");
const path = require("path");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server is running");
});

// get random user data from json file and solve no such file or directory, path not found error
app.get("/user/random", (req, res) => {
  const filePath = path.join(__dirname, "data", "users.json");
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } else {
      const users = JSON.parse(data);
      const randomUser = users[Math.floor(Math.random() * users.length)];
      res.status(200).json({
        success: true,
        data: randomUser,
      });
    }
  });
});







// get all users  Limit the number of users using query parameter
app.get("/user/all", (req, res) => {
  const users = fs.readFileSync("./data/users.json", "utf-8");
  const user = JSON.parse(users);
  const limit = req.query.limit;
  if (limit) {
    res.send(user.slice(0, limit));
  } else {
    res.send(user);
  }
}),
// Save a user in the .json file validate the body and check if all the required properties are present in the body.
app.post("/user/save", (req, res) => {
  const users = fs.readFileSync("./users.json", "utf-8");
  const user = JSON.parse(users);
  const newUser = req.body;
  if (newUser.id && newUser.name && newUser.contact && newUser.address && newUser.photoUrl && newUser.gender) {
    user.push(newUser);
    fs.writeFileSync("./data/users.json", JSON.stringify(user));
    res.send(user);
  } else {
    res.status(400).send("Bad Request - Missing required properties");
  }
}),

//Update a exist user  information in the json file and its id validate the user id by patch request.
app.patch("/user/update/:id", (req, res) => {
  const users = fs.readFileSync("./data/users.json", "utf-8");
  const user = JSON.parse(users);
  const id = Number(req.params.id);
  const updatedData = req.body;
    const index = user.findIndex(user => user.id === id);
  if(!index) {
  if (index !== -1) {
    const result = user[index] = { ...user[index], ...updatedData };
    fs.writeFileSync("./data/users.json", JSON.stringify(user));
    res.status(200).send(result);
  }
  }
  else {
    res.status(404).send("User not found");
  }
});

// Update multiple users information in the .json file Take an array of user ids body. and validate the body
app.patch("/user/bulk-update", (req, res) => {
  const users = fs.readFileSync("./data/users.json", "utf-8");
  const user = JSON.parse(users);
  const ids = req.body.ids;
  const updatedData = req.body.data;
 if(ids && updatedData){
  const updatedUser = user.map(user => {
    if (ids.includes(user.id)) {
      return { ...user, ...updatedData };
    } else {
      return user;
    }
  })
  fs.writeFileSync("./data/users.json", JSON.stringify(updatedUser));
  res.status(200).send(updatedUser)
 }else{
    res.status(400).send("Bad Request - Missing required properties");
 }
});

// Delete a user from the .json file and its id validate the user id by delete request.
app.delete("/user/delete", (req, res) => {
  const users = fs.readFileSync("./data/users.json", "utf-8");
  const user = JSON.parse(users);
  const id = Number(req.body.id);
  const index = user.findIndex(user => user.id === id);
  if(!index){
    if (index !== -1) {
      user.splice(index, 1);
      fs.writeFileSync("./data/users.json", JSON.stringify(user));
      res.status(200).send(user);
    }
  }else{
    res.status(404).send("User not found");
  }
});
















app.all("*", (req, res) => {
  res.send("NO route found.");
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

process.on("unhandledRejection", (error) => {
  console.log(error.name, error.message);
  app.close(() => {
    process.exit(1);
  });
});