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
		}
		$('select[name="q1"]').append(option);
	}
	
	// クリック動作 // リンク設定
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
	
}