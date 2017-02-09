// ログインユーザーの判別 // ※1~6行目と37,38行目,最後の括弧はどのページにも必要。
// ※①HTML側にinput[name="q4"]を作ること、②navbarにcss.クラス="toppage"をつけることを忘れずに。
var q4 = parseInt($.url().param('q4') || '0');
$('input[name="q4"]').val(q4);
if(q4 === 0){
	window.location.replace('index.html');
} else{
/*	// navbarのサイドメニュースライドイン
	$('.navbar .container-fluid .navbar-toggle').css('float','left !important');
	$(document).ready(function(){
		$('.navbar .container .btn .btn-navbar')
		.attr('data-toggle',"")
		.attr('data-target',"")
		.sidr({
			source:'navbar .container-fluid .nav-collapse.collapse'
		});
	})*/
	
	/*// input要素で選択したCSVから情報を読み取る
	 *HTMLに配置するinput要素
	 * <input id="readFile" type="file" onchange="loadFile(event)">
	 * 
	function loadFile(event){
		alasql('SELECT * FROM FILE(?,{headers:true})',[event],function(data){
			print(data)
			console.log(JSON.stringify(event))
		})
	}
	function print(x){
		console.log(document.getElementById('readFile').textContent +=
			JSON.stringify(x, null,'\t')+"\n");
	}*/

	/*// ドロップダウンのマウスオーバー
	$('.dropdown > .dropdown-menu').hover(
		function(){
			$(this).css('display','block')
		},
		function(){
			$(this).css('display','none')
		}
		);
	*/
	//検索条件の取得
	var q1 = parseInt($.url().param('q1') || '0');
	$('select[name="q1"]').val(q1);
	var q2 = parseInt($.url().param('q2') || '0');
	$('select[name="q2"]').val(q2);
	var q3 = $.url().param('q3') || '';
	$('input[name="q3"]').val(q3);
	
	//トップページのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	

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
	
	// パンくずリストのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	// 新規ボタンのリンク設定
	$('.stock-form').attr('href','stock-form.html?q1='+ q1 +'&q4='+ q4);

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
		JOIN whouse ON whouse.id = stock.whouse \
		JOIN item ON item.id = stock.item \
		JOIN kind ON kind.id = item.kind \
		WHERE item.code LIKE ? ';

	sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
	sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

	// SQL実行
	var stocks = alasql(sql, [ q3 + '%' ]);

	// HTML作成
	var tbody = $('#tbody-stocks');
	for (var i = 0; i < stocks.length; i++) {
		var stock = stocks[i];
		var tr = $('<tr data-href="stock.html?q1='+ q1 +'&id='+ stock.stock.id +'&q4='+ q4 +'"></tr>');
		tr.append('<td>' + stock.whouse.name + '</td>');
		tr.append('<td>' + stock.kind.text + '</td>');
		tr.append('<td>' + stock.item.code + '</td>');
		tr.append('<td>' + stock.item.maker + '</td>');
		tr.append('<td>' + stock.item.detail + '</td>');
		tr.append('<td style="text-align: right;">' + numberWithCommas(stock.item.price) + '</td>');
		tr.append('<td style="text-align: right;">' + stock.stock.balance + stock.item.unit + '</td>');
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
	
	
	/*
	// テキストボックスの変更を検地
	$('#テキストボックスのID').keyup(checkChange(this));

	function checkChange(e){
		var old = v=$('e').find('#テキストボックスのID').val();
		return function(){
			v=$('e').find('#テキストボックスのID').val()
			if(old != v){
				old = v;
				isChange = true;
				delSuccessMSG();
			}
		}
	}
	// テキストボックスの変更を検地（半角英数のみ）
	$('#テキストボックスのID').keyup(function(){
		isChange = true;
		delSuccessMSG();
	});
	// deleteキーとbackspaceキーの入力を検地
	$('テキストボックスのID').keyup(function(e){
		if(e.keyCode == 46 || e.keyCode == 8){
			isChange = true;
			delSuccessMSG();
		}
	})*/
}