require('dotenv').config();
require('../src/googleAuth');
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
// console.log("Jay shree ram");
const passport = require('passport');
const express = require("express");
const session = require('express-session');
const app = express();
const empCollection=require("../src/model/model");
const authorization = require('./middleware/authorization');
const path = require("path");
const template_path = path.join(__dirname, '../template/views');
app.set('view engine', 'hbs');
app.set('views', template_path);
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
require('./db/db');
const port = process.env.PORT || 3000;
function IsloggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

console.log(process.env.SECRET_KEY);
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/service', authorization,(req, res) => {
    console.log(`the cookie part :${req.cookies.usertoken}`);
    res.render('service');
})
app.post('/empdata',async (req, res) => {
    try {
        
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if (password === cpassword) {
            const empData = new empCollection({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                cpassword: req.body.cpassword,
            });

            console.log("the success part" + empData);
            const token = await empData.generateAuthToken();
            console.log("The token part " + token);

            //stroring jwt token into cookie
            res.cookie('usertoken', token, {
                expires: new Date(Date.now() + 6000000),
                httpOnly:true
            });

            const postData = await empData.save();
            // console.log("The page part " + postData);
            // res.send(postData);
            res.render('login');
        }
        else {
            res.send("password not matched");
        }
    }
    catch (error) {
        console.log(error);
    }
});
app.post('/logindata', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.loginpassword;
        const getEmail = await empCollection.findOne({ email: email });
        const isMatch = await bcrypt.compare(password, getEmail.password);
        const token = await getEmail.generateAuthToken();
        console.log("The token part is " + token);
        res.cookie('usertoken', token, {
            expires: new Date(Date.now() + 6000000),
            httpOnly:true
        });
        
        if (isMatch) {
            res.send(`login SuccessFull for ${req.body.email}`);
            // res.render('suc');
        } else {
            res.send("password are not matching");
     }
    } catch (error) {
        console.log(error);
    }
});

/*
const securePassword = async (password) => {
    const passwordHash = await bcrypt.hash(password, 10);
    // console.log(passwordHash);
    const passwordmatch = await bcrypt.compare("123", passwordHash);
    console.log(passwordmatch);
}
securePassword("thapa@123");*/
/*
 jwebtoken concepts->
const jwt = require("jsonwebtoken");
const createToken = async () => {
    const tokenData=await jwt.sign({ _id: "63e10df1e778dcd9f0eb507d" }, "rethdhbcgdyjjghnvchukjsuhfnchjd",{expiresIn:"2 seconds"});
    console.log(`The jwebtoken is ${tokenData}`);
    const userVar = await jwt.verify(tokenData, "rethdhbcgdyjjghnvchukjsuhfnchjd");
    console.log(userVar);

}
createToken();
*/

//comparing cookie
//x1GKnGhTRjoPq5jkH0Vh8_kTYEM5uxlz3GMnEXAOAlk eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2U0YzE3ODJjODJiNGEwOGI0NjQ3NDEiLCJpYXQiOjE2NzU5MzYxMjB9.x1GKnGhTRjoPq5jkH0Vh8_kTYEM5uxlz3GMnEXAOAlk

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
}));
app.get('/auth/google/failure', (req, res) => {
    res.send("something went wrong");
})
app.get('/auth/google/success',IsloggedIn, (req, res) => {
    let name = req.user.displayName;
    res.send(`Hello ${name}`);
})
// app.use('/auth/logout', (req, res) => {
//     req.session.destroy();
//     res.send('see you again!');
// })
app.listen(port, () => {
    console.log(`Connect at port : ${port}`);
})
