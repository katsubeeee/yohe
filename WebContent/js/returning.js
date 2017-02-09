// ログインユーザーの判別 // ※1~6行目と37,38行目,最後の括弧はどのページにも必要。
// ※①HTML側にinput[name="q4"]を作ること、②navbarにcss.クラス="toppage"をつけることを忘れずに。
var q4 = parseInt($.url().param('q4') || '0');
$('input[name="q4"]').val(q4);
if(q4 === 0){
	window.location.replace('index.html');
} else{
	
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
	
	// 検索条件の取得
	var q1 = parseInt($.url().param('q1') || '0');
	$('select[name="q1"]').val(q1);
	var q3 = $.url().param('q3') || '';
	$('input[name="q3"]').val(q3);
	
	// パンくずリストのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	
	// SQLの生成
	var sql = 'SELECT * \
		FROM returning \
		JOIN supplier ON supplier.id = returning.supplier \
		WHERE returning.shipped = 0 AND returning.numb LIKE ? ';

	sql += q1 ? 'AND returning.whouse = ' + q1 + ' ' : '';
	//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';
	
	// SQL実行
	var returnings = alasql(sql, [ q3 + '%' ]);
	
	// 並び替え（日付順）
	returnings.sort(function( x, y ){
		var x1 = x.returning.esdate.split('-')
		var y1 = y.returning.esdate.split('-')
		var xdat = new Date(parseInt(x1[0]),parseInt(x1[1]),parseInt(x1[2]));
		var ydat = new Date(parseInt(y1[0]),parseInt(x1[1]),parseInt(y1[2]));
		return xdat - ydat;
	})
//	console.log(JSON.stringify(returnings));	
	// 並び替えの実験 // order by が使えないので、JSのsortオブジェクトを使用
	/*// test
	var test = alasql('SELECT * FROM returning');
	var test2 = test[0].returning.esdate.split('-');
	var dat = new Date(parseInt(test2[0]),parseInt(test2[1]),parseInt(test2[2]))
	console.log(dat);*/

	// HTML作成
	var q1 = parseInt($.url().param('q1') || '0');
	var tbody = $('#tbody-returnings');
	for (var i = 0; i < returnings.length; i++) {
		var returning = returnings[i];
		var tr = $('<tr data-href="returning-eform.html?q1='+ q1 +'&q3='+ returning.returning.numb +'&q4='+ q4 +'"></tr>');
		tr.append('<td>' + returning.returning.numb + '</td>');
		tr.append('<td>' + returning.supplier.name + '</td>');
		tr.append('<td>' + numberWithCommas(returning.returning.price) + '</td>');
		tr.append('<td>' + returning.returning.esdate + '</td>');
		tr.append('<td>' + returning.returning.memo + '</td>');
		tr.append('<td>' + returning.returning.predate + '</td>');
		tr.appendTo(tbody);
	}

	// クリック動作
	$('tbody > tr').css('cursor', 'pointer').on('click', function() {
		window.location = $(this).attr('data-href');
	});
	
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
}