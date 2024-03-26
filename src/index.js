const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const collection=require("./config");
const app = express();
const session = require('express-session');


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));
app.use(express.static("public"));
app.use('/images',express.static('images'));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/login", (req, res) => {
    
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'))
});
app.get("/logout", (req, res) => {
    
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.send("Error occurred during logout.");
        }
        res.redirect("/index.html"); 
    });
});

app.post("/signup", async (req, res) => {
    const data = {
        name:req.body.username,
        password:req.body.password
    }
    //check if the user already exist
    const existingUser=await collection.findOne({name: data.name});
    if(existingUser){
        res.send("User already exists.");
    }else{
        //hash the password using bcrypt
        const saltrounds=10;
        const hashedPassword=await bcrypt.hash(data.password, saltrounds);

        data.password=hashedPassword;

        const userdata=await collection.insertMany(data);
        res.redirect("/index2.html");
        console.log(userdata);
    }

});

app.post("/login", async (req, res) => {
    try {
        const user = await collection.findOne({ name: req.body.username });
        if (!user) {
            return res.send("Username not found.");
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch) {
            res.redirect("/index2.html");
        } else {
            res.send("Wrong Password");
        }
    } catch (error) {
        console.error(error);
        res.send("An error occurred.");
    }
});

const port = 5040;
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
