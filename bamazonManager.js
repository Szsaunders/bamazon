require('dotenv').config()
var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    
    // Your port; if not 3306
    port: 3306,
    
    // Your username
    user: "root",
    
    // Your password
    password: process.env.password,
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
});

function start () {
    inquirer.prompt([
        {  
            type: "list",
            name:"option",
            message: "Start Menu:",
            choices: [
                `View Products for Sale`,
                `View Low Inventory`,
                `Add to Inventory`,
                `Add New Product`,
                'Exit'
            ],
        }]).then(function(answers) {
            switch (answers.option) {
                case `View Products for Sale`:
                view();
                break;
                case `View Low Inventory`:
                low();
                break;
                case `Add to Inventory`:
                addQuantity();
                break;
                case `Add New Product`:
                addItem();
                break;
                case 'Exit':
                connection.end();
                break;
                
            }
        })
    }
    
    function view() {
        connection.query("SELECT * FROM Products", function (err, res) {
            if (err) throw err;
            var itemArray = [];
            for (i=0;i<res.length ; i++) {
                itemArray.push(res[i].item_id + " | " + res[i].product_name + " | "  + res[i].price + " | " + res[i].stock_quantity);
            }
            console.log(itemArray)
            start()
            
        })
    }
    
    function low() {
        connection.query("SELECT * FROM Products WHERE stock_quantity<5", function (err, res) {
            if (err) throw err;
            var itemArray = [];
            for (i=0;i<res.length ; i++) {
                itemArray.push(res[i].item_id + " | " + res[i].product_name + " | "  + res[i].price + " | " + res[i].stock_quantity);
            }
            console.log(itemArray)
            start()
            
        })
    }
    
    function addQuantity() {
        connection.query("SELECT * FROM Products", function (err, res) {
            if (err) throw err;
            var itemArray =  [];
            for (i=0;i<res.length ; i++) {
                itemArray.push(res[i].product_name)
            }
            inquirer.prompt([
                {  
                    type: "list",
                    name:"item",
                    message: "Which item would you like to add to?",
                    choices: itemArray,
                }, 
                {
                    type: "input",
                    name: "amount",
                    message: "How much would you like to add?",
                }
            ]).then(function(answers) {
                var chosenItem;
                for (var i = 0; i < res.length; i++) {
                    if (res[i].product_name === answers.item) {
                        chosenItem = res[i];
                    }
                }
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: chosenItem.stock_quantity + answers.amount
                        },
                        {
                            item_id: chosenItem.item_id
                        }
                    ],
                    function(error) {
                        if (error) throw error;
                        console.log("Item updated!");
                        start()
                    })
                })
            })
        }
        
        function addItem() {
            connection.query("SELECT * FROM Products", function (err, res) {
                if (err) throw err;
                var itemArray =  [];
                for (i=0;i<res.length ; i++) {
                    itemArray.push(res[i].product_name)
                }
                inquirer.prompt([
                    {  
                        type: "input",
                        name:"product_name",
                        message: "New product name?",
                    }, 
                    {  
                        type: "input",
                        name:"department_name",
                        message: "Department?",
                    }, 
                    {  
                        type: "input",
                        name:"price",
                        message: "Price?",
                    },
                    {
                        type: "input",
                        name:"stock_quantity",
                        message: "Stock quantity?",
                    }
                ]).then(function(answers) {
                    connection.query(
                        "INSERT INTO products SET ?",
                        {
                            product_name: answers.product_name,
                            department_name: answers.department_name,
                            price: answers.price,
                            stock_quantity: answers.stock_quantity
                            
                        }
                        ,
                        function(error) {
                            if (error) throw error;
                            console.log("Item added!");
                            start()
                        })
                    })
                })
            }