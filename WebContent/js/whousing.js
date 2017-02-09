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
	
	//トップページのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);

	// SQLの生成
	var sql = 'SELECT * \
		FROM whousing \
		JOIN supplier ON supplier.id = whousing.supplier \
		WHERE whousing.whoused = 0 AND whousing.numb LIKE ? ';

	sql += q1 ? 'AND whousing.whouse = ' + q1 + ' ' : '';
	//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

	// SQL実行
	var whousings = alasql(sql, [ q3 + '%' ]);
	
	// 並び替え（日付順）
	whousings.sort(function( x, y ){
		var x1 = x.whousing.esdate.split('-')
		var y1 = y.whousing.esdate.split('-')
		var xdat = new Date(parseInt(x1[0]),parseInt(x1[1]),parseInt(x1[2]));
		var ydat = new Date(parseInt(y1[0]),parseInt(x1[1]),parseInt(y1[2]));
		return xdat - ydat;
	})

	// HTML作成
	var q1 = parseInt($.url().param('q1') || '0');
	var tbody = $('#tbody-whousings');
	for (var i = 0; i < whousings.length; i++) {
		var whousing = whousings[i];
		var tr = $('<tr data-href="whousing-form.html?q1='+ q1 +'&q3='+ whousing.whousing.numb +'&q4='+ q4 +'"></tr>');
		tr.append('<td>' + whousing.whousing.numb + '</td>');
		tr.append('<td>' + whousing.supplier.name + '</td>');
		tr.append('<td>' + numberWithCommas(whousing.whousing.price) + '</td>');
		tr.append('<td>' + whousing.whousing.esdate + '</td>');
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
	
	// クリック動作
	$('tbody > tr').css('cursor', 'pointer').on('click', function() {
		window.location = $(this).attr('data-href');
	});
}