//*** Luke McGinley & Ladi Bamgbose
//*** Database Managnment Systems
//*** 12/10/23
//*** Final Project - Recipe Project - Server
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const mysql = require('mysql');
const fs = require("fs");

const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

app.listen(port, function () {
    console.log("NodeJS app listening on port " + port);
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "nascar620",
    database: "recipe_project"
});

con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected to MySQL");
});

function readAndServe(path, res) {
    fs.readFile(path, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    });
}

// Main Menu
app.get("/", function (req, res) {
    readAndServe("./register.html", res);
});

app.get("/registerConf", function (req, res) {
    readAndServe("./registerConf.html", res);
});

app.get("/login", function (req, res) {
    readAndServe("./login.html", res);
});

app.get("/addRecipe", function (req, res) {
    readAndServe("./addRecipe.html", res);
});

app.get("/search", function (req, res) {
    readAndServe("./search.html", res);
});

app.post("/register", function (req, res) {
    const { username, password, action } = req.body;

    if (action === 'register') {
        const sql_query = "INSERT INTO users (username, password) VALUES (?, ?)";
        con.query(sql_query, [username, password], function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Redirect to the userRecipes page after successful registration
            res.redirect("/registerConf");
        });
    } else if (action === 'login') {
        // Redirect to the login page
        res.redirect("/login");
    } else {
        // Handle other cases
        res.status(400).send('Bad Request');
    }
});

app.post("/login", function (req, res) {
    const { username, password } = req.body;

    // Check if the user exists in the 'users' table
    const sql_query = "SELECT * FROM users WHERE username = ? AND password = ?";
    con.query(sql_query, [username, password], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        let loginSuccessful = false;

        if (result.length > 0) {
            loginSuccessful = true;
            console.log("Login successful:", username);

            // Set the username in the session
            req.session.username = username;

            // Redirect to the search page after successful login
            res.redirect("/userRecipes");
        } else {
            console.log("Login failed:", username);
            // Redirect to the login page without an error message
            res.redirect("/login");
        }

        // If login was not successful
        if (!loginSuccessful) {
            console.log("User does not exist:", username);
        }
    });
});

app.get("/userRecipes", function (req, res) {
    const sql_query = "SELECT users.username, recipes.food_item, recipes.recipe_description FROM users JOIN recipes ON users.id = recipes.user_id";
    con.query(sql_query, function (err, result, fields) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Process the result and generate HTML response
        let html_body = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>User Recipes</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f8f8f8;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        color: #333;
                        background: url('food.jpg') center/cover no-repeat;
                        background-size: 800px 600px;
                    }

                    h1 {
                        color: #2196F3;
                        text-align: center;
                        margin-bottom: 30px;
                    }

                    .recipe-container {
                        position: relative; /* Add position relative to use as reference for absolute positioning */
                        width: 80%;
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        box-sizing: border-box; /* Include padding and border in the element's total width and height */
                        position: relative;
                    }

                    .recipe {
                        margin-bottom: 20px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        background-color: #f9f9f9;
                    }

                    .recipe h2 {
                        color: #333;
                        margin-bottom: 10px;
                    }

                    .recipe p {
                        color: #555;
                        margin: 0;
                    }

                    .recipe .username {
                        font-weight: bold;
                        color: #2196F3;
                    }

                    .add-recipe-btn {
                        text-align: left;
                        margin-bottom: 30px;
                    }

                    .add-recipe-btn a {
                        text-decoration: none;
                        color: #fff;
                        background-color: #2196F3;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    
                    .search-form {
                        position: absolute;
                        top: 10px;
                        right: 0; /* Adjusted right value */
                        display: flex;
                        align-items: center;
                    }
                    .search-form label,
                    .search-form input,
                    .search-form button {
                        margin-right: 5px;
                    }
                    
                    .search-form label {
                        color: #333;
                    }
                    
                    .search-form input {
                        flex-grow: 1; /* Use flex-grow to allow the input to grow and take available space */
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 3px;
                        margin-right: 5px;
                    }
                    
                    .search-form button {
                        background-color: #2196F3;
                        color: #fff;
                        border: none;
                        border-radius: 3px;
                        padding: 8px 10px;
                        cursor: pointer;
                    }
                    .my-recipes-btn {
                        margin-bottom: 30px;
                        margin-top: 10px;
                        text-align: center;
                    }
                    
                    .my-recipes-btn a {
                        text-decoration: none;
                        color: #fff;
                        background-color: #2196F3;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        display: inline-block;
                        text-align: center;
                        transition: background-color 0.3s ease;
                    }
                
                </style>
            </head>
            <body>
         
                <div class="recipe-container">
                <div class="search-form">
            <form action="/search" method="POST">
                <label for="searchTerm">Search Recipes:</label>
                <input type="text" id="searchTerm" name="searchTerm" required>
                <button type="submit">Search</button>
            </form>
        </div>
                    <div class="add-recipe-btn">
                        <a href="/addRecipe">Add Recipe</a>
                    </div>
                    <h1>User Recipes</h1>
                    <div class="my-recipes-btn">
                    <a href="/myRecipes">My Recipes</a>
                </div>
                    `;

        html_body += `
                    <div class="update-username-form">
                        <h2>Update Username</h2>
                        <form action="/updateUsername" method="post">
                            <label for="newUsername">New Username:</label>
                            <input type="text" id="newUsername" name="newUsername" required>
                            <button type="submit">Update Username</button>
                        </form>
                    </div>`;


        // Loop through the result and add each recipe to the HTML
        for (const recipe of result) {
            html_body += `
                    <div class="recipe">
                        <p class="username">${recipe.username}</p>
                        <h2>${recipe.food_item}</h2>
                        <p>${recipe.recipe_description}</p>
                    </div>`;
        }

        html_body += `
                </div>
            </body>
            </html>`;

        html_body += `
            </div>
            <div class="sign-out-btn">
                <a href="/signOut">Sign Out</a>
            </div>
        </body>
        </html>`;

        res.send(html_body);
    });
});

app.post("/updateUsername", function (req, res) {
    const { newUsername } = req.body;

    // Retrieve the current username from the session
    const currentUsername = req.session.username;

    // Check if the new username is different from the current one
    if (newUsername !== currentUsername) {
        // Update the username in the 'users' table
        const updateUsernameQuery = "UPDATE users SET username = ? WHERE username = ?";
        con.query(updateUsernameQuery, [newUsername, currentUsername], function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Update the username in the session
            req.session.username = newUsername;

            // Redirect to the usernameChanged page after successful username update
            res.redirect("/login");
        });
    } else {
        // Redirect to the userRecipes page if the new username is the same as the current one
        res.redirect("/userRecipes");
    }
});

// Add a new route for the usernameChanged page
app.get("/usernameChanged", function (req, res) {
    readAndServe("./usernameChanged.html", res);
});



app.post("/deleteRecipe", function (req, res) {
    console.log("Delete Recipe Route Triggered");
    const username = req.session.username;
    const foodItemToDelete = req.body.foodItem;
    console.log("Username:", username);
    console.log("Food Item to Delete:", foodItemToDelete);

    // Log the SQL query with parameter values
    const deleteRecipeQuery = "DELETE FROM recipes WHERE user_id = (SELECT id FROM users WHERE username = ?) AND food_item = ?";
    console.log("Delete Recipe SQL Query:", deleteRecipeQuery, [username, foodItemToDelete]);

    // Delete the recipe from the recipes table
    con.query(deleteRecipeQuery, [username, foodItemToDelete], function (err, result) {
        if (err) {
            console.error("Error executing DELETE query:", err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Log the result of the DELETE query
        console.log("Delete Recipe Result:", result);

        // Redirect to myRecipes page after successful recipe deletion
        res.redirect("/myRecipes");
    });
});




app.get("/myRecipes", function (req, res) {
    // Check if the user is logged in
    if (!req.session.username) {
        // Redirect to the login page if not logged in
        res.redirect("/login");
        return;
    }

    // Retrieve the username from the session
    const username = req.session.username;

    // Query the database for recipes belonging to the logged-in user
    const sql_query = "SELECT food_item, recipe_description FROM recipes WHERE user_id = (SELECT id FROM users WHERE username = ?)";
    con.query(sql_query, [username], function (err, result, fields) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Process the result and generate HTML response
        let html_body = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #333;
        }

        h1 {
            color: #2196F3;
            text-align: center;
            margin-bottom: 30px;
        }

        .recipe-container {
            width: 80%;
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .recipe {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
        }

        .recipe h2 {
            color: #333;
            margin-bottom: 10px;
        }

        .recipe p {
            color: #555;
            margin: 0;
        }

        .recipe .username {
            font-weight: bold;
            color: #2196F3;
        }

        .back-btn {
            margin-top: 20px;
            text-align: center;
        }

        .back-btn a {
            text-decoration: none;
            color: #fff;
            background-color: #2196F3;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>My Recipes</title>
                <link rel="stylesheet" href="myRecipes.css">
            </head>
            <body>
                <div class="recipe-container">
                    <h1>My Recipes</h1>`;



        // Loop through the result and add each recipe to the HTML
        for (const recipe of result) {
            html_body += `
            <div class="recipe">
                <h2>${recipe.food_item}</h2>
                <p>${recipe.recipe_description}</p>
                <!-- Add delete button with a link to the delete route -->
                <form action="/deleteRecipe" method="POST">
                    <input type="hidden" name="foodItem" value="${recipe.food_item}">
                    <button type="submit">Delete Recipe</button>
                </form>
            </div>`;
        }

        // Add back button
        html_body += `
                    <div class="back-btn">
                        <a href="/userRecipes">Back to User Recipes</a>
                    </div>
                </div>
            </body>
            </html>`;




        // Send the generated HTML to the client
        res.send(html_body);
    });
});



// Server code
app.post("/search", function (req, res) {
    const { searchTerm } = req.body;

    // Query the database for recipes containing the search term
    const sql_query = "SELECT users.username, recipes.food_item, recipes.recipe_description FROM users JOIN recipes ON users.id = recipes.user_id WHERE recipes.food_item or recipe_description LIKE ?";

    con.query(sql_query, ['%' + searchTerm + '%'], function (err, result, fields) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Process the result and generate HTML response
        let html_body = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Search Results</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f8f8f8;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        color: #333;
                    }

                    h2 {
                        color: #2196F3;
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    .recipe-container {
                        width: 80%;
                        max-width: 800px;
                        margin: 0 auto;
                    }

                    .recipe {
                        margin-bottom: 20px;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        background-color: #f9f9f9;
                    }

                    .recipe h2 {
                        color: #333;
                        margin-bottom: 10px;
                    }

                    .recipe p {
                        color: #555;
                        margin: 0;
                    }

                    .recipe .username {
                        font-weight: bold;
                        color: #2196F3;
                    }

                    .back-btn {
                        margin-top: 20px;
                        text-align: center;
                    }

                    .back-btn a {
                        text-decoration: none;
                        color: #fff;
                        background-color: #2196F3;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <div class="recipe-container">
                    <h2>Search Results for "${searchTerm}"</h2>`;

        // Loop through the result and add each recipe to the HTML
        for (const recipe of result) {
            html_body += `
                    <div class="recipe">
                        <p class="username">${recipe.username}</p>
                        <h2>${recipe.food_item}</h2>
                        <p>${recipe.recipe_description}</p>
                    </div>`;
        }

        //back button
        html_body += `
                    <div class="back-btn">
                        <a href="/userRecipes">Back to User Recipes</a>
                    </div>
                </div>
            </body>
            </html>`;

        res.send(html_body);
    });
});




app.post("/addRecipe", function (req, res) {
    console.log("Received a request to add a recipe.");
    const { foodItem, recipeDescription, imageUrl } = req.body;

    // Retrieve the username 
    const username = req.session.username;

    // Insert the recipe into the recipes table
    const insertRecipeQuery = "INSERT INTO recipes (user_id, food_item, recipe_description, image_url) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?, ?)";
    con.query(insertRecipeQuery, [username, foodItem, recipeDescription, imageUrl], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Redirect to userRecipes page 
        res.redirect("/userRecipes");
    });
});


app.get("/signOut", function (req, res) {
    // Destroy the session to log the user out
    req.session.destroy(function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        // Redirect to the registration page after signing out
        res.redirect("/");
    });
});
