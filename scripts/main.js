// Player's game data
var game = {
	currentTime: 'morning',
	day: 1
};
var player = {
	money: 100,
	items: {},
	upgrades: []
}

// Add functionality
$(function() {
	$('.visit-shop').on('click', function() { viewNPCShop($(this).data('shop')) });
	$('.shop').on('click', viewYourShop);
	$('.npc-shop-item-container').on('change', '.purchase-item', calculateCost);
	$('.upgrade-shop-item-container').on('click', '.buy-upgrade', function() { buyUpgrade($(this)) });
	$('.buy-upgrades').on('click', viewUpgrades);
	$('#purchaseItems').on('click', purchaseItems);
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
	calculateCost();
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
						$('<input type="number" value="0">')
							.addClass("form-control")
							.addClass("purchase-item")
							.data('id', item.id)
							.data('price', item.purchaseCost)
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

function calculateCost() {
	var total = 0;
	$('.purchase-item').each(function(i, element) {
		total += $(element).val() * $(element).data('price');
	});
	$('#totalCost').html(total);
	// Display warning if they don't have enough money
	return total;
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

function purchaseItems() {
	var cost = calculateCost();
	if (cost > player.money) {
		return;
	} else {
		player.money -= cost;
	}
	$('.purchase-item').each(function(i, element) {
		if ($(element).val() <= 0) {
			return;
		}
		if (player.items[$(element).data('id')] == undefined) {
			player.items[$(element).data('id')] = 0;
		}
		player.items[$(element).data('id')] += parseInt($(element).val());
		$(element).val(0);
	});
	calculateCost();
	refreshView();
}

function sellItems() {
	var upgradeMultiplier = 1;
	player.upgrades.forEach(function(element) {
		var upgrade = upgrades[element];
		if (upgrade.type == "multiplier") {
			upgradeMultiplier += upgrade.value;
		}
	});
	console.log(upgradeMultiplier);
	Object.keys(player.items).forEach(element => {
		var item = products[element];
		var quantity = player.items[element];
		player.money += Math.floor(item.sellPrice * quantity * upgradeMultiplier);
		delete player.items[element];
	});
	refreshView();
}

function refreshView() {
	$('#money').text(player.money);
}

function buyUpgrade(upgrade) {
	var price = parseInt(upgrade.data('price'))
	if (player.money >= price) {
		player.money -= price;
		player.upgrades.push(upgrade.data('id'));
		upgrades[upgrade.data('id')].purchased = true;
	}
}
