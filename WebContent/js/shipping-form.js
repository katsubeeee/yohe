// 検索条件の取得
var q1 = parseInt($.url().param('q1') || '0');
$('select[name="q1"]').val(q1);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// SQLの生成
var sql = 'SELECT * \
	FROM shipping \
	JOIN shipping_detail ON shipping_detail.order_id = shipping.order_id \
	JOIN item ON item.id = shipping_detail.item \
	JOIN kind ON kind.id = item.kind \
	WHERE shipping.order_id LIKE ? ';

sql += q1 ? 'AND shipping.whouse = ' + q1 + ' ' : '';
//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var shippings = alasql(sql, [ q3 ]);
//console.log(JSON.stringify(shippings));

//メディア作成
var mediaText = alasql('SELECT * \
		FROM shipping \
		JOIN customer ON customer.id = shipping.customer \
		WHERE shipping.order_id LIKE ?', [ q3 ])[0];
//console.log(JSON.stringify(mediaText));
$('#div-customer_name').text(mediaText.customer.name);
$('#div-order_id').text(''+ mediaText.shipping.order_id +'');
$('#div-price').text('￥'+ numberWithCommas(mediaText.shipping.price));
var dat = [];
dat = mediaText.shipping.del_date.split('-');
$('#div-del_date').text(dat[0] +'年'+ dat[1] +'月'+ dat[2] +'日');

// HTML作成
var tbody = $('#tbody-shippings');
for (var i = 0; i < shippings.length; i++) {
	var shipping = shippings[i];
	var tr = $('<tr item_id="'+ shipping.item.id +'"></tr>');
	tr.append('<td>' + shipping.kind.text + '</td>');
	tr.append('<td>' + shipping.item.code + '</td>');
	tr.append('<td>' + shipping.item.maker + '</td>');
	tr.append('<td>' + shipping.item.detail + '</td>');
	tr.append('<td><input type="text" name="qty" value="'+ shipping.shipping_detail.amount +'" class="hidden">' + shipping.shipping_detail.amount + '</td>');
	tr.append('<td>' + numberWithCommas(shipping.shipping_detail.price) + '</td>');
	tr.appendTo(tbody);
}

// 出庫処理
$('#update').on('click', function() {
	var shippingSql = alasql('SELECT * FROM shipping \
			JOIN customer ON customer.id = shipping.customer \
			WHERE shipping.order_id LIKE ?',[ q3 ])[0];
//	console.log(JSON.stringify(shippingSql));
	var tr_length = $('#tbody-shippings tr').length;
	for(var i = 0; i < tr_length; i++){
		var item_id = parseInt($('#tbody-shippings tr').eq(i).attr('item_id'));
		var date = shippingSql.shipping.del_date;
		var qty = parseInt($('input[name="qty"]').eq(i).val());
		var memo = shippingSql.customer.name + 'へ出庫';
		var stock_id = alasql('SELECT id FROM stock WHERE item = ? AND whouse = ?',[ item_id, shippingSql.shipping.whouse ])[0].id;
		// 在庫量に反映
		var balance = alasql('SELECT balance FROM stock WHERE id = ?',[stock_id])[0].balance;
		alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance - qty, stock_id ]);
		// トランジションに保存
		var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
		alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, date, - qty, balance - qty, memo ]);
	}
	// 出庫したデータのwhousedに出庫済みを意味する「1」を保存する。
	alasql('UPDATE shipping SET shipped = ? WHERE order_id LIKE ?', [ 1, q3 ])
	var test = alasql('SELECT * FROM shipping WHERE shipped = 1');
	console.log(JSON.stringify(test));
	
	// データ削除を行うことにより、IDが消滅するので、別の運用を考える。
/*	// 出庫済みデータに保存
	var shipped_id = alasql('SELECT MAX(id) + 1 as id FROM shipped')[0].id
	if(!shipped_id){
		shipped_id = 1;
	}
	alasql('INSERT INTO shipped VALUES(?,?,?,?,?,?)', [ shipped_id, shippingSql.shipping.order_id, shippingSql.shipping.customer, shippingSql.shipping.whouse, shippingSql.shipping.price, shippingSql.shipping.del_date ])
	var test = alasql('SELECT * FROM shipped');
//	console.log(JSON.stringify(test));
	// 出庫済み詳細データに保存
	var shipped_details = alasql('SELECT * FROM shipping_detail WHERE order_id = ?', [ shippingSql.shipping.order_id ]);
//	console.log(JSON.stringify(shipped_details))
//	console.log(JSON.stringify(shipped_details[0].shipped_detail))
	for(i = 0; i < shipped_details.length; i++){
		var shipped_detail = shipped_details[i].shipping_detail;
		var shipped_detail_id = alasql('SELECT MAX(id) + 1 as id FROM shipped_detail')[0].id;
		if(!shipped_detail_id){
			shipped_detail_id = 1;
		}
		alasql('INSERT INTO shipped_detail VALUES(?,?,?,?,?)', [ shipped_detail_id, shipped_detail.order_id, shipped_detail.item, shipped_detail.amount, shipped_detail.price ]);
	}
	var test = alasql('SELECT * FROM shipped_detail');
	console.log(JSON.stringify(test));
	// 出庫予定データからデータを削除
	alasql('DELETE FROM shipping WHERE order_id LIKE ?', [ q3 ])
	var test = alasql('SELECT * FROM shipping')
//	console.log(JSON.stringify(test));
	// 発注詳細からデータを削除
	alasql('DELETE FROM shipping_detail WHERE order_id LIKE ?', [ q3 ])
	var test = alasql('SELECT * FROM shipping_detail')
	console.log(JSON.stringify(test));*/
	
//	var test = alasql('SELECT * FROM trans')
//	console.log(JSON.stringify(test));
//	window.location.assign('shipping.html');
});

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
