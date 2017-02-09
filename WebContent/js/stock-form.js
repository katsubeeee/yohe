// ログインユーザーの判別 // ※1~6行目と37,38行目,最後の括弧はどのページにも必要。
// ※①HTML側にinput[name="q4"]を作ること、②navbarにcss.クラス="toppage"をつけることを忘れずに。
var q4 = parseInt($.url().param('q4') || '0');
$('input[name="q4"]').val(q4);
if(q4 === 0){
	window.location.replace('index.html');
} else{
	
	// 選択ボックス作成
	var rows = alasql('SELECT * FROM whouse;');
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var option = $('<option>');
		option.attr('value', row.whouse.id);
		option.text(row.whouse.name);
		$('select[name="whouse"]').append(option);
	}

	// 検索ボックス作成
	var rows = alasql('SELECT * FROM whouse;');
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var option = $('<option>');
		option.attr('value', row.whouse.id);
		option.text(row.whouse.name);
		// 隠し選択ボックスの事前選択
		if(row.whouse.id == q1){
			option.attr('selected','selected')
			// ユーザー名の入力
			$('span#user strong').text(row.whouse.name);
		}
		$('select[name="q1"]').append(option);
	}
	
	//検索条件の取得
	var q1 = parseInt($.url().param('q1') || '0');
	$('select[name="q1"]').val(q1);
	
	// パンくずリストのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	$('.reference a').attr('href','reference.html?q1='+ q1 +'&q4='+ q4);
	
	// 追加処理
	$('#update').on('click', function() {
		var whouse = parseInt($('select[name="whouse"]').val());
		var item = parseInt($('select[name="item"]').val());
		var date = $('input[name="date"]').val();
		var qty = parseInt($('input[name="qty"]').val());
		var memo = $('textarea[name="memo"]').val();

		// stockレコード更新
		var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whouse, item ]);
		var stock_id, balance = 0;
		if (rows.length > 0) {
			stock_id = rows[0].id;
			balance = rows[0].balance;
			alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, stock_id ]);
		} else {
			stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
			alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item, whouse, balance + qty ]);
		}
		// transレコード追加
		var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
		alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, date, qty, balance + qty, memo ]);
		// リロード
		window.location.assign('stock.html?q1='+ q1 +'&q4='+ q4 +'&id=' + stock_id);
	});
}