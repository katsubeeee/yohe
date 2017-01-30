// 検索条件の取得
var q1 = parseInt($.url().param('q1') || '0');
$('select[name="q1"]').val(q1);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// SQLの生成
var sql = 'SELECT * \
	FROM whousing \
	JOIN whousing_detail ON whousing_detail.order_id = whousing.order_id \
	JOIN item ON item.id = whousing_detail.item \
	JOIN kind ON kind.id = item.kind \
	WHERE whousing.order_id LIKE ? ';

sql += q1 ? 'AND whousing.whouse = ' + q1 + ' ' : '';
//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var whousings = alasql(sql, [ q3 ]);
//console.log(JSON.stringify(whousings));

// HTML作成
var tbody = $('#tbody-whousings');
for (var i = 0; i < whousings.length; i++) {
	var whousing = whousings[i];
	var tr = $('<tr item_id="'+ whousing.item.id +'"></tr>');
	tr.append('<td>' + whousing.kind.text + '</td>');
	tr.append('<td>' + whousing.item.code + '</td>');
	tr.append('<td>' + whousing.item.maker + '</td>');
	tr.append('<td>' + whousing.item.detail + '</td>');
	tr.append('<td><input type="text" name="qty" value="'+ whousing.whousing_detail.amount +'" class="hidden">' + whousing.whousing_detail.amount + '</td>');
	tr.append('<td>' + numberWithCommas(whousing.whousing_detail.price) + '</td>');
	tr.appendTo(tbody);
}

// 入庫処理
$('#update').on('click', function() {
	var whousingSql = alasql('SELECT * FROM whousing \
			JOIN customer ON customer.id = whousing.customer \
			WHERE whousing.order_id LIKE ?',[ q3 ])[0];
//	console.log(JSON.stringify(whousingSql));
	var tr_length = $('#tbody-whousings tr').length;
	for(var i = 0; i < tr_length; i++){
		var item_id = parseInt($('#tbody-whousings tr').eq(i).attr('item_id'));
		var date = whousingSql.whousing.del_date;
		var qty = parseInt($('input[name="qty"]').eq(i).val());
		var memo = whousingSql.customer.name + 'から仕入';
		var stock_id = alasql('SELECT id FROM stock WHERE item = ? AND whouse = ?',[ item_id, whousingSql.whousing.whouse ])[0].id;
		// 在庫量に反映
		var balance = alasql('SELECT balance FROM stock WHERE id = ?',[stock_id])[0].balance;
		alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, stock_id ]);
		// トランジションに保存
		var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
		alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, date, qty, balance + qty, memo ]);
	}
	// 入庫したデータのwhousedに入庫済みを意味する「1」を保存する。
	alasql('UPDATE whousing SET whoused = ? WHERE order_id LIKE ?', [ 1, q3 ])
	var test = alasql('SELECT * FROM whousing WHERE whoused = 1');
	console.log(JSON.stringify(test))
	
	
	// データ削除を行うことにより、IDが消滅するので、別の運用を考える。
/*	// 入庫済みデータに保存
	var whoused_id = alasql('SELECT MAX(id) + 1 as id FROM whoused')[0].id
	if(!whoused_id){
		whoused_id = 1;
	}
//	console.log(JSON.stringify(whoused_id));
	alasql('INSERT INTO whoused VALUES(?,?,?,?,?,?)', [ whoused_id, whousingSql.whousing.order_id, whousingSql.whousing.customer, whousingSql.whousing.whouse, whousingSql.whousing.price, whousingSql.whousing.del_date ])
	var test = alasql('SELECT * FROM whoused');
//	console.log(JSON.stringify(test));
	// 入庫済み詳細データに保存
	var whoused_details = alasql('SELECT * FROM whousing_detail WHERE order_id = ?', [ whousingSql.whousing.order_id ]);
//	console.log(JSON.stringify(whoused_details))
//	console.log(JSON.stringify(whoused_details[0].whousing_detail))
	for(i = 0; i < whoused_details.length; i++){
		var whoused_detail = whoused_details[i].whousing_detail;
		var whoused_detail_id = alasql('SELECT MAX(id) + 1 as id FROM whoused_detail')[0].id;
		if(!whoused_detail_id){
			whoused_detail_id = 1;
		}
		alasql('INSERT INTO whoused_detail VALUES(?,?,?,?,?)', [ whoused_detail_id, whoused_detail.order_id, whoused_detail.item, whoused_detail.amount, whoused_detail.price ]);
	}
	var test = alasql('SELECT * FROM whoused_detail');
//	console.log(JSON.stringify(test));
	// 入庫予定データからデータを削除
	alasql('DELETE FROM whousing WHERE order_id LIKE ?', [ q3 ])
	var test = alasql('SELECT * FROM whousing')
	console.log(JSON.stringify(test));
	// 発注詳細からデータを削除
	alasql('DELETE FROM whousing_detail WHERE order_id LIKE ?', [ q3 ])
	var test = alasql('SELECT * FROM whousing_detail')
	console.log(JSON.stringify(test));*/
	
//	var test = alasql('SELECT * FROM trans')
//	console.log(JSON.stringify(test));
//	window.location.assign('whousing.html');
});

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
