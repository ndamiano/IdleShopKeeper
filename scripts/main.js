// Player's game data
var player = {
	money: 100,
	items: {},
	upgrades: [],
	sellQuantity: 1,
}

// Global game data
var game = {
	viewingShop: false,
	tickInterval: null,
	saleProgress: 0,
	saleProgressRequired: 25,
}

// Add functionality
$(function() {
	$('.visit-shop').on('click', function() { viewNPCShop($(this).data('shop')) });
	$('.shop').on('click', viewYourShop);
	$('.upgrade-shop-item-container').on('click', '.buy-upgrade', function() { buyUpgrade($(this)) });
	$('.npc-shop-item-container').on('click', '.buy-one', function() { buyItem($(this), 1) });
	$('.npc-shop-item-container').on('click', '.buy-ten', function() { buyItem($(this), 10) });
	$('.npc-shop-item-container').on('click', '.buy-max', function() { buyItem($(this), -1) });
	$('.buy-upgrades').on('click', viewUpgrades);
	game.tickInterval = setInterval(tick, 200);
});

// Game Functions
function viewNPCShop(shopType) {
	// Display strings
	var shopStrings = strings.npcShops[shopType];
	$('#npcShopTitle').text(shopStrings.name);
	$('#npcShopMessage').text(shopStrings.message);
	
	// Display items
	productsForShop = getProductsForShop(shopType);
	$('.npc-shop-item-container').html("");
	productsForShop.forEach(element => {
		var card = createCardForItem(element, false);
		$('.npc-shop-item-container').append(card);
	});
	
	// Hide other top level content
	$('.top-level-content').each(function(i, element) {
		$(element).hide();
	});
	
	// Display Shop
	$('.npcShopView').show();
}

function viewYourShop() {
	// Display items
	$('.your-shop-item-container').html("");
	Object.keys(player.items).forEach(element => {
		var item = products[element];
		item.quantity = player.items[element];
		var card = createCardForItem(item, true);
		$('.your-shop-item-container').append(card);
	});
	
	// Hide other top level content
	$('.top-level-content').each(function(i, element) {
		$(element).hide();
	});
	
	// Display Shop
	$('.playerShopView').show();
}

function viewUpgrades() {
	// Display items
	$('.upgrade-shop-item-container').html("");
	Object.keys(upgrades).forEach(element => {
		var upgrade = upgrades[element];
		if (upgrade.purchased) {
			return;
		}
		var card = createCardForUpgrade(upgrade);
		$('.upgrade-shop-item-container').append(card);
	});
	
	// Hide other top level content
	$('.top-level-content').each(function(i, element) {
		$(element).hide();
	});
	
	// Display Shop
	$('.upgradeView').show();
}

function createCardForItem(item, isYourShop) {
	return $('<div></div>').addClass('col-sm-2').append(
		$('<div></div>')
		.addClass('card')
		.append(
			$('<div></div>')
				.addClass('card-body')
				.append(
					$('<h5></h5>')
						.addClass('card-title')
						.append(strings.itemDetails[item.id].name)
				)
				.append(
					$('<p></p>')
						.addClass('card-text')
						.append(strings.itemDetails[item.id].description)
				)
				.append(
					isYourShop ?
						$('<p></p>')
							.addClass('card-text')
							.append($('<b></b>').append("Sell Price: "))
							.append(item.sellPrice)
					:
						$('<p></p>')
							.addClass('card-text')
							.append($('<b></b>').append("Purchase Price: "))
							.append(item.purchaseCost)
				)
				.append(
					isYourShop ?
						$('<p></p>')
							.addClass('card-text')
							.append($('<b></b>').append("Number Owned: "))
							.append(item.quantity)
					:
						$('<div></div>').append(
							$('<button>Buy One</button>')
								.addClass("btn btn-secondary")
								.addClass("buy-one")
								.data('id', item.id)
								.data('price', item.purchaseCost)
								.css('margin-right', '10px')
						).append(
							$('<button>Buy Ten</button>')
								.addClass("btn btn-secondary")
								.addClass("buy-ten")
								.data('id', item.id)
								.data('price', item.purchaseCost)
								.css('margin-right', '10px')
						).append(
							$('<button>Buy Max</button>')
								.addClass("btn btn-secondary")
								.addClass("buy-max")
								.data('id', item.id)
								.data('price', item.purchaseCost)
						)
				)
		)
		.css("margin-bottom", "15px")
	)
}

function createCardForUpgrade(upgrade) {
	return $('<div></div>').addClass('col-sm-2').append(
		$('<div></div>')
		.addClass('card')
		.append(
			$('<div></div>')
				.addClass('card-body')
				.append(
					$('<h5></h5>')
						.addClass('card-title')
						.append(strings.upgradeDetails[upgrade.id].name)
				)
				.append(
					$('<p></p>')
						.addClass('card-text')
						.append(strings.upgradeDetails[upgrade.id].description)
				)
				.append(
					$('<p></p>')
						.addClass('card-text')
						.append($('<b></b>').append("Cost: "))
						.append(upgrade.cost)
				)
				.append(
					$('<button value="purchase">Purchase</button>')
						.addClass("btn")
						.addClass("form-control")
						.addClass("btn-secondary")
						.addClass("buy-upgrade")
						.data('id', upgrade.id)
						.data('price', upgrade.cost)
				)
		)
		.css("margin-bottom", "15px")
	)
}

function getProductsForShop(shopType) {
	productsForShop = [];
	Object.keys(products).forEach(element => {
		product = products[element];
		if (product.availableIn.includes(shopType)) {
			productsForShop.push(product);
		}
	});
	return productsForShop;
}

function sellItems() {
	var upgradeMultiplier = 1;
	player.upgrades.forEach(function(element) {
		var upgrade = upgrades[element];
		if (upgrade.type == "multiplier") {
			upgradeMultiplier += upgrade.value;
		}
	});
	Object.keys(player.items).forEach(element => {
		var item = products[element];
		var quantity = Math.min(player.items[element], player.sellQuantity);
		var roll = Math.floor(Math.random() * 100);
		if (roll <= item.chanceOfSale) {
			console.log("SoldItem");
			player.money += Math.floor(item.sellPrice * quantity * upgradeMultiplier);
			if (player.items[element] == quantity) {
				delete player.items[element];
			} else {
				player.items[element] -= quantity;
			}
		}
	});
	refreshView();
}

function refreshView() {
	$('#money').text(player.money);
	if ($('.playerShopView').is(":visible")) {
		viewYourShop();
	}
}

function buyUpgrade(upgrade) {
	var price = parseInt(upgrade.data('price'))
	if (player.money >= price) {
		player.money -= price;
		player.upgrades.push(upgrade.data('id'));
		upgrades[upgrade.data('id')].purchased = true;
	}
}

function buyItem(item, quantity) {
	var price = parseInt(item.data('price'))
	if (price > player.money) {
		return;
	}
	var id = item.data('id');
	if (quantity == -1) {
		quantity = Math.floor(player.money / price);
	}
	price = price * quantity;
	if (player.money >= price) {
		player.money -= price;
		if (player.items[id] == undefined) {
			player.items[id] = 0;
		}
		player.items[id] += quantity;
	}
	refreshView();
}

function tick() {
	game.saleProgress++;
	if (game.saleProgress >= game.saleProgressRequired) {
		sellItems();
		game.saleProgress = 0;
	}
	var percentage = game.saleProgress / game.saleProgressRequired;
	percentage *= 100;
	percentage = Math.floor(percentage);
	$('#sale-progress-bar').css("width", percentage + "%");
}
