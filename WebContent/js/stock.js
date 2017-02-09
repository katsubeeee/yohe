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
	
	//トップページのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	$('.reference a').attr('href','reference.html?q1='+ q1 +'&q4='+ q4);

	// ID取得
	var id = parseInt($.url().param('id'));
	$("input[name=id]").val(id);

	// 商品情報読み込み
	var sql = 'SELECT * \
		FROM stock \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		JOIN kind ON kind.id = item.kind \
		WHERE stock.id = ?';
	var row = alasql(sql, [ id ])[0];
	$('#image').attr('src', 'img/' + row.item.id + '.jpg');
	$('#whouse').text(row.whouse.name);
	$('#code').text(row.item.code);
	$('#maker').text(row.item.maker);
	$('#detail').text(row.item.detail);
	$('#price').text(numberWithCommas(row.item.price));
	var balance = row.stock.balance; // 入出庫で利用
	$('#balance').text(balance);

	// トランザクション読み込み
	var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
	var tbody = $('#tbody-transs');
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var tr = $('<tr>').appendTo(tbody);
		tr.append('<td>' + row.trans.date + '</td>');
		tr.append('<td>' + row.trans.qty + '</td>');
		tr.append('<td>' + row.trans.balance + '</td>');
		tr.append('<td>' + row.trans.esdate + '</td>');
		tr.append('<td>' + row.trans.memo + '</td>');
	}
	
	$('input[name="date"]').change(function(){
		var date = $('input[name="date"]').val();
		var dat = date.split('-');
		if(!parseInt(dat[0]) || !parseInt(dat[1]) || !parseInt(dat[2])){
			$('p#errorDate').removeClass('hidden');
			return window.alert('エラー：日付を正しく選択してください。');
		} else{
			return $('p#errorDate').addClass('hidden');
		}
	})
	
	$('select#treat').change(function(){
		var treat = parseInt($('select#treat').val());
		if(!treat){
			$('p#errorTreat').removeClass('hidden');
			return window.alert('エラー：入庫か出庫のどちらかを選択してください。');
		} else{
			return $('p#errorTreat').addClass('hidden');
		}
	})
	$('input[name="qty"]').change(function(){
		var qty = parseInt($('input[name="qty"]').val());
		if(!parseInt(qty)){
			$('p#errorQty').removeClass('hidden');
			return window.alert('エラー：数量を正しく入力してください。');
		} else{
			return $('p#errorQty').addClass('hidden');
		}
	})
	
	$('textarea[name="memo"]').change(function(){
		var memo = $('textarea[name="memo"]').val();
		if(!memo){
			$('p#errorMemo').removeClass('hidden');
			return window.alert('エラー：コメントを必ず入力してください。');
		} else{
			return $('p#errorMemo').addClass('hidden');
		}
	})
	

	// 入庫・出庫処理
	$('#update').on('click', function() {
		var date = $('input[name="date"]').val();
		var dat1 = date.split('-');
		var treat = parseInt($('select#treat').val());
		if(treat == 1){ treat = "入庫"} else if(treat == 2){ treat = "出庫"} else{ treat = ""}
		var qty = parseInt($('input[name="qty"]').val());
		// 現在時刻の取得
		var now_time = Date.now();
		var dat = new Date();
		dat.setTime(now_time);
		var year = dat.getFullYear();
		var month = dat.getMonth() + 1;
		var da = dat.getDate();
		// 取得した年月日をSQLのdate形式に直す。
		var predate = year + '-' + month + '-' + da; 
		var memo = $('textarea[name="memo"]').val();
		if(!parseInt(dat1[0]) || !parseInt(dat1[1]) || !parseInt(dat1[2])){
			$('p#errorDate').removeClass('hidden');
			return window.alert('エラー：日付を正しく選択してください。');
		} else if(treat == "入庫" && qty <= 0){
			$('p#errorQty').removeClass('hidden');
			return window.alert('エラー：数量をプラスにしてください。');
		} else if(treat == "出庫" && qty >= 0){
			$('p#errorQty').removeClass('hidden');
			return window.alert('エラー：数量をマイナスにしてください。');
		} else if(date && treat && qty && memo){
			alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, id ]);
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?)', [ trans_id, id, date, predate, qty, balance + qty, '', treat, memo ]);
			window.location.assign('stock.html?q1='+ q1 +'&q4='+ q4 +'&id=' + id);
		} else if(!treat){
			$('p#errorTreat').removeClass('hidden');
			return window.alert('エラー：入庫か出庫のどちらかを選択してください。');
		} else if(!parseInt(qty)){
			$('p#errorQty').removeClass('hidden');
			return window.alert('エラー：数量を正しく入力してください。');
		} else if(!memo){
			$('p#errorMemo').removeClass('hidden');
			return window.alert('エラー：コメントを必ず入力してください。');
		}
	});
}