const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require("path");
const methodOverride = require("method-override");


app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "/views"));
// Create a MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'delta_app',
});
let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

app.get("/",(req,res) =>{
    let q = "Select count(*) from user";

    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs",{count});
        });
    }
    catch (err){
        console.log(err);
        res.send("Error in database");
    }
});
//SHow user
app.get("/user",(req,res) =>{
    let q1 = "select count(*) as count from user";
    let q2 = "select * from user";
    connection.query(q1,(err,result) =>{
        if(err){
            console.log(err);
            return res.send("Error in database");
        }
        let count = result[0].count;

        connection.query(q2,(err,users)=>{
            if (err){
                console.log(err);
                return res.send("error in database");
            }
            res.render("user.ejs",{users,count});
        });
    });
});


//edit route
app.get("/user/:id/edit",(req,res) =>{
    let {id} = req.params;
    let q = `Select * from user where id = '${id}'`;
    try{
        connection.query(q,(err,result) =>{
            if (err) throw err;
            let user = result[0];
            console.log(result[0]);
            res.render("edit.ejs",{user});
        })
    } catch (err){
        console.log("Error in database");
    }
});
//update route
    app.patch("/user/:id",(req,res) =>{
    let {id} = req.params;
    let {password: formPass, username: newUsername} = req.body;
    let q = `select * from user where id = '${id}'`;
    try{
        connection.query(q,(err,result) =>{
            if (err) throw err;
            let user = result[0];
            if(formPass === user.password){
                let q2 = `update user set username  = '${newUsername}' where id = '${id}'`;
                connection.query(q2,(err,result) =>{
                    try{
                        if (err) throw err;
                        res.redirect("/user");
                    }
                    catch (err){
                        console.log(err);
                        res.send("Error in database")
                    }
                })
            }
            else {
                res.send("Wrong password");
            }
        })
    }
    catch (err){
        console.log(err);
        res.send("Error in database");
    }
    });

app.get("/add",(req,res) =>{

    res.render("add.ejs");
});

app.post("/user/add", (req, res) => {
    const { id, username, email, password } = req.body;
    const q = "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";
    const values = [id, username, email, password];

    connection.query(q, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error inserting user into database.");
        }
        res.redirect("/"); // Redirect back to homepage after adding
    });
});
app.get("/delete",(req,res) =>{

    res.render("delete.ejs");
});


app.post("/user/delete", (req, res) => {
    let { email, password } = req.body;
    let q = `DELETE FROM user WHERE email = ? AND password = ?`;

    connection.query(q, [email, password], (err, result) => {
        if (err) throw err;

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            // If no rows were affected, user was not found
            return res.status(404).json({ message: 'User not found in the database.' });
        }

        // If deletion was successful, redirect to user list
        res.redirect("/user");
    });
});

 app.listen("8080",() => {
     console.log("Listening on port 8080");
 });



// let query = "insert into user (id, username, email, password) values ?";
// let data = [];
// for (let i=1; i<=100; i++) {
//     data.push(getRandomUser());
// }
// let users = [["1234","Utkarsh1","Utkarsh1@gmail.com","12345678"],
//     ["12345","Utkarsh2","Utkarsh2@gmail.com","12345678"]];
// try {
//     // Query to show tables
//     connection.query(query, [data],(err, result) => {
//         if (err) throw err;
//         console.log(result);
//     });
// } catch (err) {
//     console.log(err);
// }

// connection.end();




