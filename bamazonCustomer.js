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
    repeater();
});



function start () {
    connection.query("SELECT * FROM Products", function (err, res) {
        if (err) throw err;
        var itemArray =  [];
        var nameArray = [];
        for (i=0;i<res.length ; i++) {
            itemArray.push(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name
            + " | " + res[i].price + " | " + res[i].stock_quantity);
            nameArray.push(res[i].product_name)
        }
        inquirer.prompt([
            {  
                type: "list",
                name:"purchase",
                message: "Which item would you like to buy?",
                choices: itemArray,
            }]).then(function(answers) {
               var purchase;
               for (var i = 0; i < res.length; i++) {
                   if (answers.purchase === itemArray[i]) {
                       purchase = nameArray[i]
                   }
               }
                inquirer.prompt([
                    {  
                        type: "input",
                        name:"amount",
                        //Note to self: Add validation function here
                        default: 1,
                        message: "How much of that item would you like to buy?",
                        // validate: function (amount) {
                        //     if (typeof parseInt(amount) !== 'number') {
                        //         // Pass the return value in the done callback
                        //         console.log('You need to provide a number');
                        //       }
                        // }
                    }]).then(function(answers2) {
                        var chosenItem;
                        for (var i = 0; i < res.length; i++) {
                            if (res[i].product_name === purchase) {
                                chosenItem = res[i];
                            }
                        }
                        console.log(chosenItem)
                        if (chosenItem.stock_quantity < answers2.amount) {
                            console.log("Insufficient stock for purchase.")
                        }
                        else {
                            var stockLoss = chosenItem.stock_quantity - answers2.amount
                            var profit = answers2.amount * chosenItem.price;
                            connection.query(
                                "UPDATE products SET ? WHERE ?",
                                [
                                    {
                                        stock_quantity: stockLoss
                                    },
                                    {
                                        item_id: chosenItem.item_id
                                    }
                                ],
                                function(error) {
                                    if (error) throw error;
                                    console.log("Item purchased! You've spent " + profit + " dollars!");
                                    repeater()
                                }
                            )
                        }
                        
                    }
                )})
                
            })}

function repeater() {
    inquirer.prompt([
        {  
            type: "confirm",
            name:"redo",
            message: "\nWould you like to make a purchase?",
        }]).then(function(answers) {
            if (answers.redo) {
                start()
            }
            else {
                connection.end()
            }
})}