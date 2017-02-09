// ログインユーザーの判別 // ※1~6行目と37,38行目,最後の括弧はどのページにも必要。
// ※①HTML側にinput[name="q4"]を作ること、②navbarにcss.クラス="toppage"をつけることを忘れずに。
var q4 = parseInt($.url().param('q4') || '0');
$('input[name="q4"]').val(q4);
if(q4 === 0){
	window.location.replace('index.html');
} else{
	
	// 検索条件の取得
	var q1 = parseInt($.url().param('q1') || '0');
	$('select[name="q1"]').val(q1);
	var q3 = $.url().param('q3') || '';
	$('input#numb').val(q3);
	
	//トップページのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	$('.shipping a').attr('href','shipping.html?q1='+ q1 +'&q4='+ q4);

	// SQLの生成
	var sql = 'SELECT * \
		FROM shipping \
		JOIN shipping_detail ON shipping_detail.numb = shipping.numb \
		JOIN item ON item.id = shipping_detail.item \
		JOIN kind ON kind.id = item.kind \
		WHERE shipping.numb LIKE ? ';

	sql += q1 ? 'AND shipping.whouse = ' + q1 + ' ' : '';
	//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

	// SQL実行
	var shippings = alasql(sql, [ q3 ]);
	//console.log(JSON.stringify(shippings));

	//メディア作成
	var mediaText = alasql('SELECT * \
			FROM shipping \
			JOIN customer ON customer.id = shipping.customer \
			JOIN whouse ON whouse.id = shipping.whouse \
			WHERE shipping.numb LIKE ?', [ q3 ])[0];
	//console.log(JSON.stringify(mediaText));
	$('#span-numb').text(''+ mediaText.shipping.numb +'');
	$('#span-customer_name').text(mediaText.customer.name);
	$('#span-whouse').text(mediaText.whouse.name);
	// ユーザー名の入力
	$('span#user strong').text(mediaText.whouse.name);
	var dat = [];
	dat = mediaText.shipping.esdate.split('-');
	$('#span-del_date').text(dat[0] +'年'+ dat[1] +'月'+ dat[2] +'日');
	// コメント自動入力
	$('textarea#memo').val(mediaText.customer.name +'へ出庫');

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
	
	// コメントの有無確認function
	$('textarea#memo').change(function(){
		var memo = $('textarea#memo').val();
		if(!memo){
			$('p#errorMemo').removeClass('hidden');
			return window.alert('エラー：コメントを必ず入力してください。');
		} else{
			return $('p#errorMemo').addClass('hidden');
		}
	})

	// 出庫処理
	$('#update').on('click', function() {
		var memo = $('textarea#memo').val();
		if(!memo){
			$('p#errorMemo').removeClass('hiddden');
			return console.log(memo),window.alert('エラー：コメントを必ず入力してください。');
		}
		var shippingSql = alasql('SELECT * FROM shipping \
				JOIN customer ON customer.id = shipping.customer \
				WHERE shipping.numb LIKE ?',[ q3 ])[0];
//		console.log(JSON.stringify(shippingSql));
		var tr_length = $('#tbody-shippings tr').length;
		for(var i = 0; i < tr_length; i++){
			var item_id = parseInt($('#tbody-shippings tr').eq(i).attr('item_id'));
			// 現在時刻の取得
			var now_time = Date.now();
			var dat = new Date();
			dat.setTime(now_time);
			var year = dat.getFullYear();
			var month = dat.getMonth() + 1;
			var date = dat.getDate();
			// 取得した年月日をSQLのdate形式に直す。
			var predate = year + '-' + month + '-' + date; 
			var qty = parseInt($('input[name="qty"]').eq(i).val());
			// stockレコード更新
			var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ shippingSql.shipping.whouse, item_id ])[0];
			var stock_id, balance = 0;
			if (rows) {
				stock_id = rows.id;
				balance = rows.balance;
				alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance - qty, stock_id ]);
			} else {
				stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
				alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item_id, shippingSql.shipping.whouse, balance - qty ]);
			}
			// transレコード追加
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?)', [ trans_id, stock_id, '', predate, - qty, balance - qty, q3, "出庫", memo ]);
		}
		// 出庫したデータのwhousedに出庫済みを意味する「1」を保存する。
		alasql('UPDATE shipping SET shipped = ?, date = ?, memo = ? WHERE numb LIKE ?', [ 1, predate, memo, q3 ])
//		var test = alasql('SELECT * FROM shipping WHERE shipped = 1');
//		console.log(JSON.stringify(test));
		
		// データ削除を行うことにより、IDが消滅するので、別の運用を考える。
	/*	// 出庫済みデータに保存
		var shipped_id = alasql('SELECT MAX(id) + 1 as id FROM shipped')[0].id
		if(!shipped_id){
			shipped_id = 1;
		}
		alasql('INSERT INTO shipped VALUES(?,?,?,?,?,?)', [ shipped_id, shippingSql.shipping.order_id, shippingSql.shipping.customer, shippingSql.shipping.whouse, shippingSql.shipping.price, shippingSql.shipping.del_date ])
		var test = alasql('SELECT * FROM shipped');
//		console.log(JSON.stringify(test));
		// 出庫済み詳細データに保存
		var shipped_details = alasql('SELECT * FROM shipping_detail WHERE order_id = ?', [ shippingSql.shipping.order_id ]);
//		console.log(JSON.stringify(shipped_details))
//		console.log(JSON.stringify(shipped_details[0].shipped_detail))
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
//		console.log(JSON.stringify(test));
		// 発注詳細からデータを削除
		alasql('DELETE FROM shipping_detail WHERE order_id LIKE ?', [ q3 ])
		var test = alasql('SELECT * FROM shipping_detail')
		console.log(JSON.stringify(test));*/
		
//		var test = alasql('SELECT * FROM trans')
//		console.log(JSON.stringify(test));
		window.location.assign('shipping.html?q1='+ q1 +'&q4='+ q4);
	});

/*	// クリック動作
	$('tbody > tr').css('cursor', 'pointer').on('click', function() {
		window.location = $(this).attr('data-href');
	});*/	
}