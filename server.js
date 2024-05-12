if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require("express")
const path = require("path")
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require("bcrypt")
const passport = require("passport");
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require("method-override")

// const initializePassport = require("./passport-config");

// initializePassport( 
//     passport,
//     email => users.find(user => user.email === email),
//     id => users.find(user => user.id === id)
// )

const users = []
const products = [
{
    id: 0,
    price: 250,
    name: "Shirt"
},
{
    id: 1,
    price: 500,
    name: "Pants"
},
{
    id: 2,
    price: 550,
    name: "Oxygn Pants"
},
{
    id: 3,
    price: 1000,
    name: "Bag"
},
{
    id: 4,
    price: 1500,
    name: "Shoes"
},
]
// MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

// ROUTES
app.get("/", (req, res) => {
    console.log("REQ USER ", req.user)
    res.status(200).json({ message: "Success!" });
})

app.get("/login", (req, res) => {
    res.status(200).json({ message: "Success asdasd!" });
})

app.get("/register", (req, res) => {
    res.status(400).json({ error: "Bad Request" });
})

app.get("/products/:id", (req,res) => {
    const productId = req.params.id;
    const product = products.find(product => product.id == productId);
    console.log("PROD ID" + productId)
    console.log("FOUND PRODUCT " + product)
    if (product) {
        res.status(200).json({ product });
    } else {
        res.status(404).json({ message: "Product not found" });
    }
})

app.get("/products", (req, res) => {
    res.status(200).json({ products })
})
// app.post("/login",  passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }))

app.post("/login", async (req, res) => {
    console.log(req.body)
    try {
        const {email, password} = req.body
        const user = users.find(user => user.email == email)
        console.log("user " + user)
        if (!user) {
            res.status(404).json({message: "User is not found"})
        }

        if (await bcrypt.compare(password, user.password)) {
            console.log("SUCCES :", user)
            res.status(200).json({ message: "Successful Login!",userId: user.id})
        } else {
            console.log("FAILURE :", user)
            res.status(400).json({message: "Wrong password!"})
        }
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post("/register", async (req, res) => {
    try {

        console.log("REQ BODY", req.body)
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const existingUser = users.find(user => user.email === req.body.email);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        console.log("REGISTER USER ", users)
        res.status(200).json({ message: "Success" });
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) {
            return res.status(500).json({ error: "Error logging out" });
        }
        res.status(200).json({ message: "Logout successful" });
    });
});


function checkAuthenticated(req, res, next) {
    console.log(req.user)
    if (req.isAuthenticated()) {
        return next()
    }
    return res.status(401).json({ message: "Not authenticated" });
}


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.status(403).json({ message: "Forbidden - You are already authenticated" });
    }
    next()
}


app.listen(3000)