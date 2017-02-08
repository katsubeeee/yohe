// ログインユーザーの判別 // ※1~6行目と37,38行目,最後の括弧はどのページにも必要。
// ※①HTML側にinput[name="q4"]を作ること、②navbarにcss.クラス="toppage"をつけることを忘れずに。
var q4 = parseInt($.url().param('q4') || '0');
$('input[name="q4"]').val(q4);
if(q4 === 0){
	window.location.replace('index.html');
} else{
	
	//検索条件の取得
	var q1 = parseInt($.url().param('q1') || '0');
	$('select[name="q1"]').val(q1);
	var q3 = $.url().param('q3') || '';
	$('input[name="q3"]').val(q3);
	
	//トップページのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	$('.whousing a').attr('href','whousing.html?q1='+ q1 +'&q4='+ q4);

	// SQLの生成
	var sql = 'SELECT * \
		FROM whousing \
		JOIN whousing_detail ON whousing_detail.numb = whousing.numb \
		JOIN item ON item.id = whousing_detail.item \
		JOIN kind ON kind.id = item.kind \
		WHERE whousing.numb LIKE ? ';

	//sql += q1 ? 'AND whousing.whouse = ' + q1 + ' ' : '';
	//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

	// SQL実行
	var whousings = alasql(sql, [ q3 ]);
	//console.log(JSON.stringify(whousings));

	//メディア作成
	var mediaText = alasql('SELECT * \
			FROM whousing \
			JOIN supplier ON supplier.id = whousing.supplier \
			JOIN whouse ON whouse.id = whousing.whouse \
			WHERE whousing.numb LIKE ?', [ q3 ])[0];
	//console.log(JSON.stringify(mediaText));
	$('#span-numb').text(''+ mediaText.whousing.numb +'');
	$('#span-supplier_name').text(mediaText.supplier.name);
	$('#span-whouse').text(mediaText.whouse.name);
	var dat = [];
	dat = mediaText.whousing.esdate.split('-');
	$('#span-del_date').text(dat[0] +'年'+ dat[1] +'月'+ dat[2] +'日');
	// コメント自動入力
	$('textarea#memo').val(mediaText.supplier.name +'から入庫');
	
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

	// 入庫処理
	$('#update').on('click', function() {
		var memo = $('textarea#memo').val();
		if(!memo){
			$('p#errorMemo').removeClass('hiddden');
			return console.log(memo),window.alert('エラー：コメントを必ず入力してください。');
		}
		var whousingSql = alasql('SELECT * FROM whousing \
				JOIN supplier ON supplier.id = whousing.supplier \
				WHERE whousing.numb LIKE ?',[ q3 ])[0];
//		console.log(JSON.stringify(whousingSql));
		var tr_length = $('#tbody-whousings tr').length;
		for(var i = 0; i < tr_length; i++){
			var item_id = parseInt($('#tbody-whousings tr').eq(i).attr('item_id'));
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
			var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whousingSql.whousing.whouse, item_id ])[0];
			var stock_id, balance = 0;
			if (rows) {
				stock_id = rows.id;
				balance = rows.balance;
				alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, stock_id ]);
			} else {
				stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
				alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item_id, whousingSql.whousing.whouse, balance + qty ]);
			}
			// transレコード追加
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?)', [ trans_id, stock_id, '', predate, qty, balance + qty, q3, "入庫", memo ]);
		}
		// 入庫したデータのwhousedに入庫済みを意味する「1」を保存する。
		alasql('UPDATE whousing SET whoused = ?, date = ?, memo = ? WHERE numb LIKE ?', [ 1, predate, memo, q3 ])
		var test = alasql('SELECT * FROM whousing WHERE whoused = 1');
		console.log(JSON.stringify(test))
		
		
		// データ削除を行うことにより、IDが消滅するので、別の運用を考える。
	/*	// 入庫済みデータに保存
		var whoused_id = alasql('SELECT MAX(id) + 1 as id FROM whoused')[0].id
		if(!whoused_id){
			whoused_id = 1;
		}
//		console.log(JSON.stringify(whoused_id));
		alasql('INSERT INTO whoused VALUES(?,?,?,?,?,?)', [ whoused_id, whousingSql.whousing.order_id, whousingSql.whousing.customer, whousingSql.whousing.whouse, whousingSql.whousing.price, whousingSql.whousing.del_date ])
		var test = alasql('SELECT * FROM whoused');
//		console.log(JSON.stringify(test));
		// 入庫済み詳細データに保存
		var whoused_details = alasql('SELECT * FROM whousing_detail WHERE order_id = ?', [ whousingSql.whousing.order_id ]);
//		console.log(JSON.stringify(whoused_details))
//		console.log(JSON.stringify(whoused_details[0].whousing_detail))
		for(i = 0; i < whoused_details.length; i++){
			var whoused_detail = whoused_details[i].whousing_detail;
			var whoused_detail_id = alasql('SELECT MAX(id) + 1 as id FROM whoused_detail')[0].id;
			if(!whoused_detail_id){
				whoused_detail_id = 1;
			}
			alasql('INSERT INTO whoused_detail VALUES(?,?,?,?,?)', [ whoused_detail_id, whoused_detail.order_id, whoused_detail.item, whoused_detail.amount, whoused_detail.price ]);
		}
		var test = alasql('SELECT * FROM whoused_detail');
//		console.log(JSON.stringify(test));
		// 入庫予定データからデータを削除
		alasql('DELETE FROM whousing WHERE order_id LIKE ?', [ q3 ])
		var test = alasql('SELECT * FROM whousing')
		console.log(JSON.stringify(test));
		// 発注詳細からデータを削除
		alasql('DELETE FROM whousing_detail WHERE order_id LIKE ?', [ q3 ])
		var test = alasql('SELECT * FROM whousing_detail')
		console.log(JSON.stringify(test));*/
		
//		var test = alasql('SELECT * FROM trans')
//		console.log(JSON.stringify(test));
		window.location.assign('whousing.html?q1='+ q1 +'&q4='+ q4);
	});

/*	// クリック動作
	$('tbody > tr').css('cursor', 'pointer').on('click', function() {
		window.location = $(this).attr('data-href');
	});*/
}