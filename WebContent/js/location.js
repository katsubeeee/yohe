// ログインユーザーの判別 // ※1~6行目と37,38行目,最後の括弧はどのページにも必要。
// ※①HTML側にinput[name="q4"]を作ること、②navbarにcss.クラス="toppage"をつけることを忘れずに。
/*var q4 = parseInt($.url().param('q4') || '0');
$('input[name="q4"]').val(q4);
if(q4 === 0){
	window.location.replace('index.html');
} else{*/var q4 = 0;

	//検索条件の取得
	var q1 = parseInt($.url().param('q1') || '0');
	$('select[name="q1"]').val(q1);
	var q2 = parseInt($.url().param('q2') || '0');
	$('select[name="q2"]').val(q2);
	var q5 = parseInt($.url().param('q5') || '0');
	$('select[name="q5"]').val(q5);
	var q3 = $.url().param('q3') || '';
	$('input[name="q3"]').val(q3);
	
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

	var rows = alasql('SELECT * FROM kind;');
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var option = $('<option>');
		option.attr('value', row.kind.id);
		option.text(row.kind.text);
		if(row.kind.id == q2){
			option.attr('selected','selected')
		}
		$('select[name="q2"]').append(option);
	}
	
	var rows = alasql('SELECT * FROM shelf;');
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var option = $('<option>');
		option.attr('value', row.shelf.id);
		option.text(row.shelf.dist + '-' + row.shelf.numb);
		if(row.shelf.id == q5){
			option.attr('selected','selected')
		}
		$('select[name="q5"]').append(option);
	}
	
	// パンくずリストのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	// 棚番号登録ボタンのリンク設定
	$('#newLoc').attr('href','location-form.html?q1='+ q1 +'&q4='+ q4);

	// 商品コード入力補助
	var datalist = $('<datalist id="inputCodeList"></datalist>')
	var items = alasql('SELECT code, detail, maker FROM item');
	for(var i = 0; i < items.length; i++ ){
		var item = items[i]
		var option = $('<option></option>');
		option.val(item.code);
		option.text(item.maker + '   ' + item.detail);
		datalist.append(option);
	}
	var inputQ3 = $('input[name="q3"]');
	inputQ3.attr("list","inputCodeList");
	inputQ3.append(datalist);

	// SQLの生成
	var sql = 'SELECT * \
		FROM stock \
		JOIN location ON location.stock = stock.id \
		JOIN shelf ON shelf.id = location.shelf \
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		JOIN kind ON kind.id = item.kind \
		WHERE item.code LIKE ? ';

	sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
	sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';
	sql += q5 ? 'AND shelf.id = ' + q5 + ' ' : '';

	// SQL実行
	var stocks = alasql(sql, [ q3 + '%' ]);
	
	var test = stocks;
	console.log(JSON.stringify(test));
	
/*	// 棚番号ごとテーブル作成 // 商品ごともあると良い？
	// 並び替え：item.id
	returnings.sort(function( x, y ){
		var x1 = x.returning.esdate.split('-')
		var y1 = y.returning.esdate.split('-')
		var xdat = new Date(parseInt(x1[0]),parseInt(x1[1]),parseInt(x1[2]));
		var ydat = new Date(parseInt(y1[0]),parseInt(x1[1]),parseInt(y1[2]));
		return xdat - ydat;
	})
	// 並び替え：shelf(dist + numb)
	returnings.sort(function( x, y ){
		var x1 = x.returning.esdate.split('-')
		var y1 = y.returning.esdate.split('-')
		var xdat = new Date(parseInt(x1[0]),parseInt(x1[1]),parseInt(x1[2]));
		var ydat = new Date(parseInt(y1[0]),parseInt(x1[1]),parseInt(y1[2]));
		return xdat - ydat;
	})
	// 並び替え：倉庫
	returnings.sort(function( x, y ){
		var x1 = x.returning.esdate.split('-')
		var y1 = y.returning.esdate.split('-')
		var xdat = new Date(parseInt(x1[0]),parseInt(x1[1]),parseInt(x1[2]));
		var ydat = new Date(parseInt(y1[0]),parseInt(x1[1]),parseInt(y1[2]));
		return xdat - ydat;
	})*/
	// HTML作成
	var tbody = $('#tbody-shelfs');
	for (var i = 0; i < stocks.length; i++) {
		var stock = stocks[i];
		var tr = $('<tr data-href="location-eform.html?q1='+ q1 +'&id='+ stock.stock.id +'&q4='+ q4 +'"></tr>');
		tr.append('<td>' + stock.whouse.name + '</td>');
		tr.append('<td>' + stock.shelf.dist + '-' + stock.shelf.numb + '</td>');
		tr.append('<td>' + stock.kind.text + '</td>');
		tr.append('<td>' + stock.item.code + '</td>');
		tr.append('<td>' + stock.item.maker + '</td>');
		tr.append('<td>' + stock.item.detail + '</td>');
		tr.append('<td style="text-align: right;">' + stock.location.amount + stock.item.unit + '</td>');
		tr.appendTo(tbody);
	}
	//
	$('.sideMenuOpen').click(function(){
		$(this).toggleClass('open');
		if($(this).hasClass('open')){
			$('.sideMenu').animate({'left': '0px'})
		}else{
			$('.sideMenu').animate({'left': '-250px'})
		}
	})

	//クリック動作
	$('div.sideMenu > tr').css('cursor', 'pointer');
	$('div.sideMenu > tr').hover(function(){
		$(this).css('color','gray')
	});
	$('div.sideMenu > td').hover(function(){
		$(this).css('color','grey')
	});
	$('div.sideMenu > tr').on('click', function() {
		window.location = $(this).attr('data-href');
	});
//}