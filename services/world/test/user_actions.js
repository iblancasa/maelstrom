/*
Name: User  Actions - Test
Project: Maelström - World
Author: demiurgosoft <demiurgosoft@hotmail.com>
Description: Unit test for actions
*/

var assert = require('chai').assert;
var async = require('async');

var auxFunc = require('./config/functions.js');
var data = require('./config/data.js');

var Actions = require('../app/user_actions.js');
var Get = require('../app/get_actions.js');
var dbHandler = require('../app/dbhandler.js');
var tables = dbHandler.tables;


describe('User Actions', function() {
	this.timeout(4000);
	before(function(done) {
		this.timeout(20000);
		dbHandler.dropTables(function(err, res) {
			assert.notOk(err);
			dbHandler.createTables(function(err, res) {
				assert.notOk(err);
				done();
			});
		});
	});
	beforeEach(function(done) {
		dbHandler.clearTables(function(err) {
			assert.notOk(err);
			auxFunc.populate(done);
		});
	});
	after(function(done) {
		dbHandler.clearTables(function(err) {
			assert.notOk(err);
			done();
		});
	});

	it.skip("Move Ship", function(done) {
		done(new Error('Not implemented'));
		//TODO
	});
	it("Buy Product", function(done) {
		var userId = data.users.arthur.id;
		dbHandler.get.user(userId, function(err, res) {
			assert.notOk(err);
			assert.ok(res[0]);
			var userMoney = res[0].money;
			dbHandler.get.all(tables.products, function(err, res) {
				assert.notOk(err);
				assert.ok(res[0]);
				var productId = res[0].id;
				var productPrice = res[0].basePrice;
				dbHandler.get.all(tables.cities, function(err, res) {
					assert.notOk(err);
					assert.ok(res[0]);
					var cityId = res[0].id;
					dbHandler.get.userShips(userId, function(err, res) {
						assert.notOk(err);
						assert.ok(res[0]);
						var shipId = res[0].id;
						dbHandler.get.shipProduct(shipId, productId, function(err, res) {
							assert.notOk(err);
							assert.ok(res[0]);
							var shipProd = res[0].quantity;
							assert.strictEqual(res[0].productId, productId);
							dbHandler.get.cityProduct(cityId, productId, function(err, res) {
								assert.notOk(err);
								assert.ok(res[0]);
								var cityProd = res[0].quantity;
								assert.strictEqual(res[0].productId, productId);
								Actions.buyProduct(userId, shipId, cityId, productId, 2, function(err, res) {
									assert.notOk(err);
									assert.ok(res);
									dbHandler.get.shipProduct(shipId, productId, function(err, res) {
										assert.notOk(err);
										assert.ok(res[0]);
										assert.strictEqual(res[0].quantity, shipProd + 2);
										dbHandler.get.cityProduct(cityId, productId, function(err, res) {
											assert.notOk(err);
											assert.ok(res[0]);
											assert.strictEqual(res[0].quantity, cityProd - 2);
											dbHandler.get.user(userId, function(err, res) {
												assert.notOk(err);
												assert.ok(res[0]);
												assert.strictEqual(res[0].money, userMoney - (productPrice * 2));
												done();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
	it("Sell Product", function(done) {
		var userId = data.users.arthur.id;
		dbHandler.get.user(userId, function(err, res) {
			assert.notOk(err);
			assert.ok(res[0]);
			var userMoney = res[0].money;
			dbHandler.get.all(tables.products, function(err, res) {
				assert.notOk(err);
				assert.ok(res[0]);
				var productId = res[0].id;
				var productPrice = res[0].basePrice;
				dbHandler.get.all(tables.cities, function(err, res) {
					assert.notOk(err);
					assert.ok(res[0]);
					var cityId = res[0].id;
					dbHandler.get.userShips(userId, function(err, res) {
						assert.notOk(err);
						assert.ok(res[0]);
						var shipId = res[0].id;
						dbHandler.get.shipProduct(shipId, productId, function(err, res) {
							assert.notOk(err);
							assert.ok(res[0]);
							var shipProd = res[0].quantity;
							assert.strictEqual(res[0].productId, productId);
							dbHandler.get.cityProduct(cityId, productId, function(err, res) {
								assert.notOk(err);
								assert.ok(res[0]);
								var cityProd = res[0].quantity;
								assert.strictEqual(res[0].productId, productId);
								Actions.sellProduct(userId, shipId, cityId, productId, 2, function(err, res) {
									assert.notOk(err);
									assert.ok(res);
									dbHandler.get.shipProduct(shipId, productId, function(err, res) {
										assert.notOk(err);
										assert.ok(res[0]);
										assert.strictEqual(res[0].quantity, shipProd - 2);
										dbHandler.get.cityProduct(cityId, productId, function(err, res) {
											assert.notOk(err);
											assert.ok(res[0]);
											assert.strictEqual(res[0].quantity, cityProd + 2);
											dbHandler.get.user(userId, function(err, res) {
												assert.notOk(err);
												assert.ok(res[0]);
												assert.strictEqual(res[0].money, userMoney + (productPrice * 2));
												done();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
	it("Build Ship", function(done) {
		var userId = data.users.arthur.id;
		var money = data.users.arthur.money;
		var shipName = "Golden Heart";
		Get.shipModels(function(err, res) {
			assert.notOk(err);
			assert.ok(res[0]);
			var shipModelId = res[0].id;
			var model = res[0];
			Get.map(function(err, res) {
				assert.notOk(err);
				assert.ok(res[0]);
				var cityId = res[0].id;
				Actions.buildShip(userId, shipModelId, cityId, shipName, function(err, res) {
					assert.notOk(err);
					assert.ok(res);
					var shipId = res;
					Get.ships(userId, function(err, res) {
						assert.notOk(err);
						assert.strictEqual(res.length, 2);
						Get.shipDetails(shipId, function(err, res) {
							assert.notOk(err);
							assert.ok(res);
							assert.strictEqual(res.id, shipId);
							assert.strictEqual(res.name, shipName);
							assert.strictEqual(res.status, "docked");
							assert.strictEqual(res.city, cityId);
							assert.strictEqual(res.model, shipModelId);
							assert.strictEqual(res.life, model.life);
							assert.ok(res.products);
							assert.strictEqual(res.products.length, 0);
							Get.userData(userId, function(err, res) {
								assert.notOk(err);
								assert.ok(res);
								assert.strictEqual(res.money, money - model.price);
								done();
							});
						});
					});
				});
			});
		});
	});
	it("Sell Ship", function(done) {
		var userId = data.users.arthur.id;
		var money = data.users.arthur.money;
		Get.ships(userId, function(err, res) {
			assert.notOk(err);
			assert.ok(res);

			var ships = res.length;
			var price = data.ships.galleon.price;
			var shipId = res[0].id;
			Actions.sellShip(shipId, userId, function(err, res) {
				assert.notOk(err);
				assert.ok(res);
				Get.ships(userId, function(err, res) {
					assert.notOk(err);
					assert.ok(res);
					assert.strictEqual(res.length, ships - 1);
					Get.userData(userId, function(err, res) {
						assert.notOk(err);
						assert.ok(res);
						assert.strictEqual(res.money, money + price);
						Actions.sellShip(shipId, userId, function(err, res) {
							assert.ok(err);
							assert.notOk(res);
							done();
						});
					});
				});
			});
		});
	});
	it.skip("Repair Ship", function(done) {
		done(new Error('Not implemented'));
		//TODO
	});
	it.skip("Return Ship", function(done) {
		done(new Error('Not implemented'));
		//TODO
	});
});