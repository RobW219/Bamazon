var mysql = require("mysql");
var prompt = require("prompt");
var Table = require("cli-table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "password",
	database: "Bamazon_db"
});

var productPurchased = [];

connection.connect();

connection.query('SELECT ItemID, ModelName, ManufacturerName, Price FROM Products', function(err, result){
	if(err) console.log(err);
	var table = new Table({
		head: ['Item Id#', 'ManufacturerName', 'ModelName', 'Price'],
		style: {
			head: ['cyan'],
			compact: false,
			colAligns: ['center'],
		}
	});

	for(var i = 0; i < result.length; i++){
		table.push([result[i].ItemID, result[i].ManufacturerName, result[i].ModelName, result[i].Price]);
	}
	console.log(table.toString());

	purchase();
});

var purchase = function(){

	var productInfo = {
		properties: {
			itemID:{description: ('Please enter the ID # of the awesome racecar you wish to purchase!')},
			Quantity:{description: ('How many racecars would you like to purchase?')}
		},
	};

	prompt.start();

	prompt.get(productInfo, function(err, res){

		var custPurchase = {
			itemID: res.itemID,
			Quantity: res.Quantity
		};
		
		
		productPurchased.push(custPurchase);

		connection.query('SELECT * FROM Products WHERE ItemID=?', productPurchased[0].itemID, function(err, res){
				if(err) console.log(err, 'That item ID doesn\'t exist');
				
				
				if(res[0].StockQuantity < productPurchased[0].Quantity){
					console.log('We do not have that many to sell you!');
					connection.end();

				
				} else if(res[0].StockQuantity >= productPurchased[0].Quantity){

					console.log('');

					console.log(productPurchased[0].Quantity + ' racecars purchased');

					console.log(res[0].ModelName + ' ' + res[0].Price);
					
					var saleTotal = res[0].Price * productPurchased[0].Quantity;

					console.log('Total: ' + saleTotal);

					newQuantity = res[0].StockQuantity - productPurchased[0].Quantity;

					connection.query("UPDATE Products SET StockQuantity = " + newQuantity +" WHERE ItemID = " + productPurchased[0].itemID, function(err, res){
						console.log('');
						console.log(('Your order has been processed.  Thank you for shopping with us!'));
						console.log('');

						connection.end();
					})

				};
		})
	})

};