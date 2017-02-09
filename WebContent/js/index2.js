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
	
	// お知らせ作成
	// バッヂに値を入力
	// 現在時間の取得
	var now_time = Date.now();
	var dat = new Date();
	dat.setTime(now_time);
	var year = dat.getFullYear();
	var month = dat.getMonth() + 1;
	var date = dat.getDate();
	// 取得した年月日をSQLのdate形式に直す。
	var todat = year + '-' + month + '-' + date;
	// 入庫
	var whousing_cnt = alasql('SELECT * FROM whousing WHERE esdate = ? AND whouse = ?', [ todat, q1 ]);
	$('span.whousing-badge').text(whousing_cnt.length);
	// 出庫
	var shipping_cnt = alasql('SELECT * FROM shipping WHERE esdate = ? AND whouse = ?', [ todat, q1 ]);
	var returning_cnt = alasql('SELECT * FROM returning WHERE esdate = ? AND whouse = ?', [ todat, q1 ]);
	$('span.shipping-badge').text(shipping_cnt.length + returning_cnt.length);
	// プログレスバーの値入力
	// 入庫
	var whoused_cnt = alasql('SELECT * FROM whousing WHERE whoused = 1 AND esdate = ? AND whouse = ?', [ todat, q1 ]);
	var progress_whousing = whoused_cnt.length / whousing_cnt.length
	$('div.progress.whousing > div').css('width', progress_whousing * 100 + '%');
	$('div.progress.whousing > div').text(progress_whousing * 100 + '%');
	// 出庫
	var shipped_cnt = alasql('SELECT * FROM shipping WHERE shipped = 1 AND esdate = ? AND whouse = ?', [ todat, q1 ]);
	var returned_cnt = alasql('SELECT * FROM returning WHERE shipped = 1 AND esdate = ? AND whouse = ?', [ todat, q1 ]);
	var progress_shipping = (shipped_cnt.length + returned_cnt.length) / (shipping_cnt.length + returning_cnt.length)
	$('div.progress.shipping > div').css('width', progress_shipping * 100 + '%');
	$('div.progress.shipping > div').text( progress_shipping * 100 + '%');
	// リンク設定
	$('a#whousing').attr('href','whousing.html?q1='+ q1 +'&q4='+ q4);
	$('a#checking').attr('href','checking.html?q1='+ q1 +'&q4='+ q4);
	$('a#shipping').attr('href','shipping.html?q1='+ q1 +'&q4='+ q4);
	$('a#picking').attr('href','picking.html?q1='+ q1 +'&q4='+ q4);
	
	// メニュークリック動作 // リンク設定	
	$('tr.reference').css('cursor', 'pointer').on('click', function() {
		window.location = 'reference.html?q1='+ q1 +'&q4='+ q4;
	});
	$('tr.whousing').css('cursor', 'pointer').on('click', function() {
		window.location = 'whousing.html?q1='+ q1 +'&q4='+ q4;
	});
	$('tr.shipping').css('cursor', 'pointer').on('click', function() {
		window.location = 'shipping.html?q1='+ q1 +'&q4='+ q4;
	});
	$('tr.returning-form').css('cursor', 'pointer').on('click', function() {
		window.location = 'returning-form.html?q1='+ q1 +'&q4='+ q4;
	});
	$('tr.returning').css('cursor', 'pointer').on('click', function() {
		window.location = 'returning.html?q1='+ q1 +'&q4='+ q4;
	});
	
//	$('.reference').attr('href','reference.html');
//	$('.whousing').attr('href','whousing.html');
//	$('.shipping').attr('href','shipping.html');
//	$('.returning-form').attr('href','returning-form.html');
//	$('.returning').attr('href','returning.html');
	
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