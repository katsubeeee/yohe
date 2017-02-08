var DB = {};

DB.init = function() {
	if (window.confirm('DBが初期化されます。よろしいですか？')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// 分類
	alasql('DROP TABLE IF EXISTS kind;');
	alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(function(kinds) {
		for (var i = 0; i < kinds.length; i++) {
			var kind = kinds[i];
			alasql('INSERT INTO kind VALUES(?,?);', kind);
		}
	});

	// アイテム
	alasql('DROP TABLE IF EXISTS item;');
	alasql('CREATE TABLE item(id INT IDENTITY, code STRING, kind INT, detail STRING, maker STRING, price INT, unit STRING);');
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/ITEM-ITEM.csv", {headers: true})').then(function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?);', item);
		}
	});

	// 倉庫
	alasql('DROP TABLE IF EXISTS whouse;');
	alasql('CREATE TABLE whouse(id INT IDENTITY, name STRING, addr STRING, tel STRING);');
	var pwhouse = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSE-WHOUSE.csv", {headers: true})').then(
			function(whouses) {
				for (var i = 0; i < whouses.length; i++) {
					var whouse = whouses[i];
					alasql('INSERT INTO whouse VALUES(?,?,?,?);', whouse);
				}
			});

	// 在庫
	alasql('DROP TABLE IF EXISTS stock;');
	alasql('CREATE TABLE stock(id INT IDENTITY, item INT, whouse INT, balance INT);');
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCK-STOCK.csv", {headers: true})').then(
			function(stocks) {
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?);', stock);
				}
			});

	// トランザクション
	alasql('DROP TABLE IF EXISTS trans;');
	alasql('CREATE TABLE trans(id INT IDENTITY, stock INT,esdate DATE, date DATE, qty INT, balance INT,numb INT, treat STRING, memo STRING);');
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/TRANS-TRANS.csv", {headers: true})').then(
			function(transs) {
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?);', trans);
				}
			});

	// 入庫関連DB
	//　発注データ
	alasql('DROP TABLE IF EXISTS whousing_order;');
	alasql('CREATE TABLE whousing_order(id INT IDENTITY, numb INT IDENTITY, customer INT, whouse INT, price INT, esdate DATE);');
	var pwhousing_order = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSING-ORDER.csv", {headers: true})').then(
			function(whousing_orders) {
				for (var i = 0; i < whousing_orders.length; i++) {
					var whousing_order = whousing_orders[i];
					alasql('INSERT INTO whousing_order VALUES(?,?,?,?,?,?);', whousing_order);
				}
			});
	// 発注詳細
	alasql('DROP TABLE IF EXISTS whousing_detail;');
	alasql('CREATE TABLE whousing_detail(id INT IDENTITY, numb INT IDENTITY, item INT, amount INT, price INT);');
	var pwhousing_detail = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSING-DETAIL.csv", {headers: true})').then(
			function(whousing_details) {
				for (var i = 0; i < whousing_details.length; i++) {
					var whousing_detail = whousing_details[i];
					alasql('INSERT INTO whousing_detail VALUES(?,?,?,?,?);', whousing_detail);
				}
			});
	// 入庫予定
	alasql('DROP TABLE IF EXISTS whousing;');
	alasql('CREATE TABLE whousing(id INT IDENTITY, numb INT IDENTITY, supplier INT, whouse INT, price INT, esdate DATE, date DATE, memo STRING, whoused INT);');
	var pwhousing = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSING.csv", {headers: true})').then(
			function(whousings) {
				for (var i = 0; i < whousings.length; i++) {
					var whousing = whousings[i];
					alasql('INSERT INTO whousing VALUES(?,?,?,?,?,?,?,?,?);', whousing);
				}
			});
/*	// 入庫済み
	alasql('DROP TABLE IF EXISTS whoused;');
	alasql('CREATE TABLE whoused(id INT IDENTITY, order_id INT IDENTITY, customer INT, whouse INT, price INT, del_date DATE);');
	var pwhoused = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSED.csv", {headers: true})').then(
			function(whouseds) {
				for (var i = 0; i < whouseds.length; i++) {
					var whoused = whouseds[i];
					alasql('INSERT INTO whoused VALUES(?,?,?,?,?,?);', whoused);
				}
			});*/
/*	// 入庫済み詳細
	alasql('DROP TABLE IF EXISTS whoused_detail;');
	alasql('CREATE TABLE whoused_detail(id INT IDENTITY, order_id INT IDENTITY, item INT, amount INT, price INT);');
	var pwhoused_detail = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSED-DETAIL.csv", {headers: true})').then(
			function(whoused_details) {
				for (var i = 0; i < whoused_details.length; i++) {
					var whoused_detail = whoused_details[i];
					alasql('INSERT INTO whoused_detail VALUES(?,?,?,?,?);', whoused_detail);
				}
			});*/

	// 取引先
	alasql('DROP TABLE IF EXISTS supplier;');
	alasql('CREATE TABLE supplier(id INT IDENTITY, name STRING, party STRING, addr STRING, tel STRING);');
	var psupplier = alasql.promise('SELECT MATRIX * FROM CSV("data/SUPPLIER-SUPPLIER.csv", {headers: true})').then(
			function(suppliers) {
				for (var i = 0; i < suppliers.length; i++) {
					var supplier = suppliers[i];
					alasql('INSERT INTO supplier VALUES(?,?,?,?,?);', supplier);
				}
			});
	
	// 出庫関連DB
	//　受注データ
	alasql('DROP TABLE IF EXISTS shipping_order;');
	alasql('CREATE TABLE shipping_order(id INT IDENTITY, numb INT IDENTITY, customer INT, whouse INT, price INT, esdate DATE);');
	var pshipping_order = alasql.promise('SELECT MATRIX * FROM CSV("data/SHIPPING-ORDER.csv", {headers: true})').then(
			function(shipping_orders) {
				for (var i = 0; i < shipping_orders.length; i++) {
					var shipping_order = shipping_orders[i];
					alasql('INSERT INTO shipping_order VALUES(?,?,?,?,?,?);', shipping_order);
				}
			});
	// 受注詳細
	alasql('DROP TABLE IF EXISTS shipping_detail;');
	alasql('CREATE TABLE shipping_detail(id INT IDENTITY, numb INT IDENTITY, item INT, amount INT, price INT);');
	var pshipping_detail = alasql.promise('SELECT MATRIX * FROM CSV("data/SHIPPING-DETAIL.csv", {headers: true})').then(
			function(shipping_details) {
				for (var i = 0; i < shipping_details.length; i++) {
					var shipping_detail = shipping_details[i];
					alasql('INSERT INTO shipping_detail VALUES(?,?,?,?,?);', shipping_detail);
				}
			});
	// 出庫予定
	alasql('DROP TABLE IF EXISTS shipping;');
	alasql('CREATE TABLE shipping(id INT IDENTITY, numb INT IDENTITY, customer INT, whouse INT, price INT, esdate DATE, date DATE, memo STRING, shipped INT);');
	var pshipping = alasql.promise('SELECT MATRIX * FROM CSV("data/SHIPPING.csv", {headers: true})').then(
			function(shippings) {
				for (var i = 0; i < shippings.length; i++) {
					var shipping = shippings[i];
					alasql('INSERT INTO shipping VALUES(?,?,?,?,?,?,?,?,?);', shipping);
				}
			});
/*	// 出庫済み
	alasql('DROP TABLE IF EXISTS shipped;');
	alasql('CREATE TABLE shipped(id INT IDENTITY, order_id INT IDENTITY, customer INT, whouse INT, price INT, del_date DATE);');
	var pshipped = alasql.promise('SELECT MATRIX * FROM CSV("data/SHIPPED.csv", {headers: true})').then(
			function(shippeds) {
				for (var i = 0; i < shippeds.length; i++) {
					var shipped = shippeds[i];
					alasql('INSERT INTO shipped VALUES(?,?,?,?,?,?);', shipped);
				}
			});*/
/*	// 出庫済み詳細
	alasql('DROP TABLE IF EXISTS shipped_detail;');
	alasql('CREATE TABLE shipped_detail(id INT IDENTITY, order_id INT IDENTITY, item INT, amount INT, price INT);');
	var pshipped_detail = alasql.promise('SELECT MATRIX * FROM CSV("data/SHIPPED-DETAIL.csv", {headers: true})').then(
			function(shipped_details) {
				for (var i = 0; i < shipped_details.length; i++) {
					var shipped_detail = shipped_details[i];
					alasql('INSERT INTO shipped_detail VALUES(?,?,?,?,?);', shipped_detail);
				}
			});*/

	// 得意先
	alasql('DROP TABLE IF EXISTS customer;');
	alasql('CREATE TABLE customer(id INT IDENTITY, name STRING, party STRING, addr STRING, tel STRING);');
	var pcustomer = alasql.promise('SELECT MATRIX * FROM CSV("data/CUSTOMER-CUSTOMER.csv", {headers: true})').then(
			function(customers) {
				for (var i = 0; i < customers.length; i++) {
					var customer = customers[i];
					alasql('INSERT INTO customer VALUES(?,?,?,?,?);', customer);
				}
			});
	
	// 返品関連
	// 返品データ
	alasql('DROP TABLE IF EXISTS returning;');
	alasql('CREATE TABLE returning(id INT IDENTITY, numb INT IDENTITY, supplier INT, whouse INT, price INT,predate DATE, esdate DATE, date DATE, memo STRING, shipped INT);');
	var preturning = alasql.promise('SELECT MATRIX * FROM CSV("data/RETURNING.csv", {headers: true})').then(
			function(returnings) {
				for (var i = 0; i < returnings.length; i++) {
					var returning = returnings[i];
					alasql('INSERT INTO returning VALUES(?,?,?,?,?,?,?,?,?,?);', returning);
				}
			});
	// 返品詳細
	alasql('DROP TABLE IF EXISTS returning_detail;');
	alasql('CREATE TABLE returning_detail(id INT IDENTITY, numb INT IDENTITY, item INT, amount INT, price INT);');
	var preturning_detail = alasql.promise('SELECT MATRIX * FROM CSV("data/RETURNING-DETAIL.csv", {headers: true})').then(
			function(returning_details) {
				for (var i = 0; i < returning_details.length; i++) {
					var returning_detail = returning_details[i];
					alasql('INSERT INTO returning_detail VALUES(?,?,?,?,?);', returning_detail);
				}
			});
	
	// ログインユーザー管理DB
	alasql('DROP TABLE IF EXISTS uim;');
	alasql('CREATE TABLE uim(id INT IDENTITY, user_id INT);');
	var puim = alasql.promise('SELECT MATRIX * FROM CSV("data/UIM.csv", {headers: true})').then(
			function(uims) {
				for (var i = 0; i < uims.length; i++) {
					var uim = uims[i];
					alasql('INSERT INTO uim VALUES(?,?);', uim);
				}
			});

	// リロード
	Promise.all([ pkind, pitem, pwhouse, pstock, ptrans, 
	              pshipping_order, pshipping_detail, pshipping, /*pshipped, pshipped_detail,*/ pcustomer,
	              pwhousing_order, pwhousing_detail, pwhousing, /*pwhoused, pwhoused_detail,*/ psupplier,
	              preturning, preturning_detail,
	              puim]).then(function() {
		window.location.reload(true);
	});
};

DB.remove = function() {
	if (window.confirm('DBが削除されます。よろしいですか？')) {
		alasql('DROP localStorage DATABASE STK')
	}
};

// 桁区切り
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// データベース接続
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	// MUST ADD LINE WHEN CREATING NEW TABLE!
	alasql.options.joinstar = 'json';
	alasql('SELECT * FROM kind WHERE id = 1;');
	alasql('SELECT * FROM item WHERE id = 1;');
	alasql('SELECT * FROM whouse WHERE id = 1;');
	alasql('SELECT * FROM stock WHERE id = 1;');
	alasql('SELECT * FROM trans WHERE id = 1;');
	
	alasql('SELECT * FROM whousing_order WHERE id = 1;');
	alasql('SELECT * FROM whousing_detail WHERE id = 1;');
	alasql('SELECT * FROM whousing WHERE id = 1;');
//	alasql('SELECT * FROM whoused WHERE id = 1;');
//	alasql('SELECT * FROM whoused_detail WHERE id = 1;');
	alasql('SELECT * FROM supplier WHERE id = 1;');
	
	alasql('SELECT * FROM shipping_order WHERE id = 1;');
	alasql('SELECT * FROM shipping_detail WHERE id = 1;');
	alasql('SELECT * FROM shipping WHERE id = 1;');
//	alasql('SELECT * FROM shipped WHERE id = 1;');
//	alasql('SELECT * FROM shipped_detail WHERE id = 1;');
	alasql('SELECT * FROM customer WHERE id = 1;');
	
	alasql('SELECT * FROM returning_detail WHERE id = 1;');
	alasql('SELECT * FROM returning WHERE id = 1;');
	
	alasql('SELECT * FROM uim WHERE id = 1;');
} catch (e) {
	alasql('CREATE localStorage DATABASE STK;');
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	DB.load();
}
// DB作成テスト
/*
//alasql.options.joinstar = 'overwrite';
alasql.options.joinstar = 'json';*/
/*// 出庫
var test = alasql('SELECT * FROM shipping_order')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM shipping_detail')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM shipping')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM shipped')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM shipped_detail')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM customer')
console.log(JSON.stringify(test));

// 入庫
var test = alasql('SELECT * FROM whousing_order')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM whousing_detail')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM whousing')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM whoused')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM whoused_detail')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM supplier')
console.log(JSON.stringify(test));

// 返品
var test = alasql('SELECT * FROM returning_detail')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM returning')
console.log(JSON.stringify(test));

var test = alasql('SELECT * FROM uim')
console.log(JSON.stringify(test));
*/