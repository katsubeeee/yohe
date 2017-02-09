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
	$('input[name="q3"]').val(q3);
	
	// パンくずリストのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	$('.returning a').attr('href','returning.html?q1='+ q1 +'&q4='+ q4);

	// メディア作成＆隠しinputテーブル作成
	var mediaText = alasql('SELECT * \
			FROM returning \
			JOIN supplier ON supplier.id = returning.supplier \
			JOIN whouse ON whouse.id = returning.whouse \
			WHERE returning.numb LIKE ?', [ q3 ])[0];
	//console.log(JSON.stringify(mediaText));
	$('#span-return_id').text(''+ mediaText.returning.numb +'');
	$('#span-supplier_name').text(mediaText.supplier.name);
	$('#span-whouse').text(mediaText.whouse.name);
	var dat = [];
	dat = mediaText.returning.esdate.split('-');
	$('#span-del_date').text(dat[0] +'年'+ dat[1] +'月'+ dat[2] +'日');
	$('#span-memo').text(mediaText.returning.memo);
	// 隠しinputの作成
	$('#return_id').val(mediaText.returning.numb);//現状使っていない。
	$('#supplier_name').val(mediaText.supplier.name);//現状使っていない。
	$('#del_date').val(mediaText.returning.esdate);
	$('#memo').val(mediaText.returning.memo);
	// 隠し選択ボックスの作成
	var rows = alasql('SELECT * FROM whouse;');
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		var option = $('<option>');
		option.attr('value', row.whouse.id);
		option.text(row.whouse.name);
		// 隠し選択ボックスの事前選択
		if(row.whouse.id == mediaText.whouse.id){
			option.attr('selected','selected')
			// ユーザー名の入力
			$('span#user strong').text(row.whouse.name);
		}
		$('select#whouse_id').append(option);
	}
	/*// 取引先名入力補助 //現状使っていない。
	var datalist = $('<datalist id="inputCodeList"></datalist>')
	var suppliers = alasql('SELECT name FROM supplier');
	for(var i = 0; i < suppliers.length; i++ ){
		var supplier = suppliers[i]
		var option = $('<option></option>');
		option.val(supplier.name);
		datalist.append(option);
	}
	var input = $('input#supplier_name');
	input.attr("list","inputCodeList");
	input.append(datalist);*/
	// 日付変更イベント // トランザクション側へ保存するか、、、
	function dateChange(){
		$('span#span-del_date, a#date-change, input#del_date, a#date-update').toggleClass('hidden');
	}
	function dateUpdate(){
		$('span#span-del_date, a#date-change, input#del_date, a#date-update').toggleClass('hidden');
		var dat = $('#del_date').val();
//		console.log(dat);
		// トランザクションを更新
		alasql('UPDATE trans SET esdate = ? WHERE numb LIKE ? AND treat = "返品"', [ dat, q3 ]);
		// returningを更新
		alasql('UPDATE returning SET esdate = ? WHERE numb LIKE ?', [ dat, q3 ]);
//		var test = alasql('SELECT * FROM returning WHERE return_id LIKE ?', [ q3 ]);
//		console.log(JSON.stringify(test));
		window.location.reload(true);
	}
	
	// コメント変更イベント // トランザクション側へ保存する。
	function memoChange(){
		$('span#span-memo, a#memo-change, textarea#memo, a#memo-update').toggleClass('hidden');
	}
	function memoUpdate(){
		$('span#span-memo, a#memo-change, textarea#memo, a#memo-update').toggleClass('hidden');
		var memo = $('textarea#memo').val();
//		console.log(dat);
		// トランザクションを更新
		alasql('UPDATE trans SET memo = ? WHERE numb LIKE ? AND treat = "返品"', [ memo, q3 ]);
		// returningを更新
		alasql('UPDATE returning SET memo = ? WHERE numb LIKE ?', [ memo, q3 ]);
//		var test = alasql('SELECT * FROM returning WHERE return_id LIKE ?', [ q3 ]);
//		console.log(JSON.stringify(test));
		window.location.reload(true);
	}
	var test = alasql('SELECT * FROM trans WHERE numb LIKE ? AND treat = "返品"', [ q3 ]);
	console.log(JSON.stringify(test));
	
	//SQLの生成
	var sql = 'SELECT * \
		FROM returning \
		JOIN returning_detail ON returning_detail.numb = returning.numb \
		JOIN item ON item.id = returning_detail.item \
		JOIN kind ON kind.id = item.kind \
		WHERE returning.numb LIKE ? ';

	//sql += q1 ? 'AND whousing.whouse = ' + q1 + ' ' : '';
	//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

	// SQL実行
	var returnings = alasql(sql, [ q3 ]);
	//console.log(JSON.stringify(returnings));

	// HTML作成
	var tbody = $('#tbody-returnings');
	for (var i = 0; i < returnings.length; i++) {
		var returning = returnings[i];
		var tr = $('<tr item_id="'+ returning.item.id +'" returning_detail_id="'+ returning.returning_detail.id +'"></tr>');
		tr.append('<td>' + returning.kind.text + '</td>');
		tr.append('<td>' + returning.item.code + '</td>');
		tr.append('<td>' + returning.item.maker + '</td>');
		tr.append('<td>' + returning.item.detail + '</td>');
		tr.append('<td><div id="qty"><label class="control-label hidden">エラー:正しい数量を入力してください。</label><input type="number" name="qty" size="5" min="1" value="'+ returning.returning_detail.amount +'" placeholder="数量を入力してください。" class="hidden"></div><span id="amount">' + returning.returning_detail.amount + '</span></td>');
		tr.append('<td><a href="#" class="btn btn-xs btn-default amountChange"> 数量を変更</a><a href="#" class="btn btn-xs btn-default hidden amountUpdate"> 変更を保存</a></td>');
		tr.append('<td>' + numberWithCommas(returning.returning_detail.price) + '</td>');
		tr.append('<td><a href="#" class="btn btn-xs btn-default rowDelete"> 削除</a></td>')
		tr.appendTo(tbody);
	}
	// 数量を変更ボタンのイベント
	$('.amountChange').on('click',function(){
		var this_tr = $(this).closest("tr");
		$(this).toggleClass('hidden');
		this_tr.find('span#amount').toggleClass('hidden');
		this_tr.find('input[name="qty"]').toggleClass('hidden');
		this_tr.find('.amountUpdate').toggleClass('hidden');
	})
	// 変更を保存ボタンのイベント
	$('.amountUpdate').on('click',function(){
		var this_tr = $(this).closest("tr");
		var returning_detail_id = parseInt(this_tr.attr('returning_detail_id'));
		var item_id = parseInt(this_tr.attr('item_id'));
		var amount = parseInt(this_tr.find('input[name="qty"]').val());
		var whouse_id = parseInt($('select#whouse_id').val());
		var del_date = $('input#del_date').val();
		var memo = $('textarea#memo').val();
		var supplier_name = $('input#supplier_name').val();
		var supplier_ids = alasql('SELECT id FROM supplier WHERE name = ?', [ supplier_name ])[0];
		var supplier_id;
		supplier_ids ? supplier_id = supplier_ids.id : supplier_id = '';
//		console.log(returning_detail_id);
//		console.log(item_id);
//		console.log(amount);
//		console.log(whouse_id);
//		console.log(del_date);
//		console.log(supplier_name);
//		console.log(supplier_ids);
//		console.log(supplier_id);
		var item = alasql('SELECT * \
				FROM item \
				WHERE id = ?', [ item_id ])[0];
		var old_amount = alasql('SELECT amount \
				FROM returning_detail \
				WHERE id = ?', [ returning_detail_id ])[0].amount;
		console.log(old_amount);
		var amount_difference ;
		// 入力されたamountが正しいかどうか。
		if(amount){
			amount_difference = amount - old_amount;
			this_tr.find('label').addClass('hidden');
			this_tr.find('div').removeClass('has-error');
			item ? this_tr.find('td').eq(6).text(numberWithCommas(amount * item.item.price)) : this_tr.find('td').eq(6).text('');
		} else{
			this_tr.find('label').removeClass('hidden');
			this_tr.find('div').addClass('has-error');
			this_tr.find('td').eq(6).text('');
			return ;
		}
//		console.log(JSON.stringify(amount_difference));
//		console.log(JSON.stringify(item));
//		console.log(amount * item.item.price);
		// DB更新
		if(item){
			// returning_detailの更新（商品の数と金額の変更）
			alasql('UPDATE returning_detail \
					SET amount = ?, price = ? \
					WHERE id = ?',
					[ amount, amount * item.item.price, returning_detail_id ]);
//			var test = alasql('SELECT * FROM returning_detail WHERE id = ?', [ returning_detail_id ]);
//			console.log('amonut = ' + amount);
//			console.log('price = ' + amount * updateSql.item.price);
//			console.log(JSON.stringify(test));
//			var test = alasql('SELECT * FROM returning_detail WHERE return_id LIKE ?', [ q3 ]);
//			console.log(JSON.stringify(test));
			// stockレコード更新
			var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whouse_id, item_id ])[0];
			var stock_id, balance = 0;
			if (rows) {
				stock_id = rows.id;
				balance = rows.balance;
				alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance - amount_difference, stock_id ]);
			} else {
				stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
				alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item_id, whouse_id, balance - amount ]);
			}
			// transレコード追加
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			if(amount_difference > 0){
				alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?)', [ trans_id, stock_id, del_date, '', - amount_difference, balance - amount_difference, q3, "返品", memo ]);
			} else if(amount_difference < 0){
				alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?)', [ trans_id, stock_id, del_date, '', - amount_difference, balance - amount_difference, q3, "返品", memo ]);
			}
			// returningの更新（総額の更新）
			var all_price = alasql('SELECT SUM(price) AS price FROM returning_detail WHERE numb LIKE ?', [ q3 ])[0];
//			console.log(all_price);
			alasql('UPDATE returning \
					SET price = ? \
					WHERE numb LIKE ?', [ all_price.price, q3 ]);
//			var test = alasql('SELECT * FROM returning WHERE return_id LIKE ?', [ q3 ]);
//			console.log(JSON.stringify(test));
			$(this).toggleClass('hidden');
			this_tr.find('span#amount').toggleClass('hidden');
			this_tr.find('input[name="qty"]').toggleClass('hidden');
			this_tr.find('.amountChange').toggleClass('hidden');
			window.location.reload(true);
		} else{
			this_tr.find('label').removeClass('hidden');
			this_tr.find('div').addClass('has-error');
		}
	})

	// 商品の削除
	$('.rowDelete').on('click',function(){
		var this_btn = $(this);
		this_btn.toggleClass('hidden');
		// ダイアログ作成
		var dialog = $('<div id="dialog" class="text-center"></div>');
		dialog.appendTo($('.table'));
		dialog.css("position","absolute");
		dialog.css("border","thin solid #999");
		dialog.css("border-radius","5px");
		dialog.css("background-color","#FFF");
		dialog.css("width","200px");
		dialog.css("height","150px");
		var w = (window.innerWidth / 2) - (dialog.width() / 2);
		var h = (window.innerHeight / 2) - (dialog.height() / 2);
		$('div#dialog').css("top",h);
		$('div#dialog').css("left",w);
		// ダイアログの内部作成
		dialog.append('<span style="padding:20px;">この商品を返品から削除しますか？</span>')
		var div_form = $('<div style="margin: 20px;"><form class="form-inline text-center"></form></div>');
		div_form.append('<a href="#" class="btn btn-sm btn-default" id="yes" style="margin: 10px"> はい</a>');
		div_form.append('<a href="#" class="btn btn-sm btn-default" id="no" style="margin: 10px" autofocus="autofocus"> いいえ</a>');
		dialog.append(div_form);
		// ダイアログ出現時のオーバーレイ作成
		var overlay = $('<div id="overlay"></div>');
		dialog.before(overlay);
		overlay.css("position","absolute");
		overlay.css("left","0");
		overlay.css("top","0");
		overlay.css("width","100%");
		overlay.css("height","100%");
		overlay.css("background-color","#666");
		overlay.css("opacity","0.5");
		// ダイアログ内のyesボタンのイベント
		$('#yes').on('click',function(){
			rowDelete(this_btn);
		})
		function rowDelete(e){
			var this_tr = $(e).closest("tr");
			var returning_detail_id = parseInt(this_tr.attr('returning_detail_id'));
			var item_id = parseInt(this_tr.attr('item_id'));
			var amount = parseInt(this_tr.find('input[name="qty"]').val());
			var whouse_id = parseInt($('select#whouse_id').val());
			var del_date = $('input#del_date').val();
			var memo = $('textarea#memo').val();
			var supplier_name = $('input#supplier_name').val();
			var supplier_ids = alasql('SELECT id FROM supplier WHERE name = ?', [ supplier_name ])[0];
			var supplier_id;
			supplier_ids ? supplier_id = supplier_ids.id : supplier_id = '';
			// returning_detailの該当するidの行を削除
			alasql('DELETE FROM returning_detail WHERE id = ?', [ returning_detail_id ]);
			// stockレコード更新
			var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whouse_id, item_id ])[0];
			var stock_id, balance = 0;
			if (rows) {
				stock_id = rows.id;
				balance = rows.balance;
				alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + amount, stock_id ]);
			} else {
				stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
				alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item_id, whouse_id, balance + amount ]);
			}
			// transレコード追加
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?)', [ trans_id, stock_id, del_date, '', amount, balance + amount, q3, "返品", supplier_name + 'へ返品予定を取り消し' ]);
			// returningを更新
			var price = alasql('SELECT SUM(price) AS price FROM returning_detail WHERE numb LIKE ?', [ q3 ])[0].price; 
			alasql('UPDATE returning SET price = ? WHERE numb LIKE ?', [ price, q3 ])
			// ページの読み込み
			window.location.reload(true);
		}
		// ダイアログ内のnoボタンのイベント
		$('#no').on('click',function(){
			dialogClose(this_btn);
		})
		function dialogClose(e){
			$(e).toggleClass('hidden');
			$('#dialog, #overlay').remove();
		}
	})

	// 商品の新規追加
	function addItem(){
		$('a#addItem').toggleClass('hidden');
		var new_tr = $('<tr class="newRow"></tr>');
		new_tr.append('<td></td>');
		// 商品分類選択ボックス
		//new_tr.append('<td><select name="q2" class="form-control"><option value="0">すべて</option></select></td>');
	/*	// 選択ボックスの作成
		var rows = alasql('SELECT * FROM kind;');
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			var option = $('<option>');
			option.attr('value', row.kind.id);
			option.text(row.kind.text);
			new_tr.find('select[name="q2"]').append(option);
		}*/
		// 商品を検索
		new_tr.append('<td><div id="code"><label class="control-label hidden">エラー:正しいコードを入力してください。</label><input type="text" name="code" placeholder="コードを入力してください。"></div></td>');
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
		var input = new_tr.find('input[name="code"]');
		input.attr("list","inputCodeList");
		input.append(datalist);
		
		new_tr.append('<td></td>');
		new_tr.append('<td></td>');
		new_tr.append('<td><div id="qty"><label class="control-label hidden">エラー:正しい数量を入力してください。</label><input type="number" name="qty" size="5" min="1" placeholder="数量を入力してください。"></div></td>');
		new_tr.append('<td></td>');
		new_tr.append('<td></td>');
		new_tr.append('<td><a href="#" class="btn btn-xs btn-default" id="row_update"> 保存</a></td>');
		
		new_tr.prependTo(tbody);
		
		// コード情報より商品情報の表示（同時に金額の自動計算）
		var newRow = $('tr.newRow');
//		console.log(newRow.html())
		newRow.find('input[name="code"]').change(function(){
			var input_tr = $(this).closest('tr');
			var code = $(this).val();
			var amount = parseInt(input_tr.find('input[name="qty"]').val());
//			console.log(code);
			var item = alasql('SELECT * \
					FROM item \
					JOIN kind ON kind.id = item.kind \
					WHERE item.code = ?', [ code ])[0];
			// 入力された値が正しいかどうかの確認
			if(item){
				input_tr.find('td').eq(0).text(item.kind.text);
				input_tr.find('td').eq(2).text(item.item.maker); 
				input_tr.find('td').eq(3).text(item.item.detail);
				$(this).prev('label').addClass('hidden');
				$(this).closest('div').removeClass('has-error');
				//console.log('item.item.price = '+ item.item.price)
				amount ? input_tr.find('td').eq(6).text(numberWithCommas(amount * item.item.price)) : input_tr.find('td').eq(6).text('');
			} else{
				input_tr.find('td').eq(0).text('');
				input_tr.find('td').eq(2).text(''); 
				input_tr.find('td').eq(3).text('');
				$(this).prev('label').removeClass('hidden');
				$(this).closest('div').addClass('has-error');
				//console.log('item.item.price = '+ item.item.price)
				amount ? input_tr.find('td').eq(6).text(numberWithCommas(amount * item.item.price)) : input_tr.find('td').eq(6).text('');
				}
		})
		// 金額の計算（数量を入力した後に自動計算）
		newRow.find('input[name="qty"]').change(function(){
			var input_tr = $(this).closest('tr');
			var code = input_tr.find('input[name="code"]').val();
			var amount = parseInt(input_tr.find('input[name="qty"]').val());
			var item = alasql('SELECT * \
					FROM item \
					JOIN kind ON kind.id = item.kind \
					WHERE item.code = ?', [ code ])[0];
//			console.log('item.item.price = '+ item.item.price)
			// 入力された値が正しいかどうかの確認
			if(amount){
				$(this).prev('label').addClass('hidden');
				$(this).closest('div').removeClass('has-error');
				item ? input_tr.find('td').eq(6).text(numberWithCommas(amount * item.item.price)) : input_tr.find('td').eq(6).text('');
			} else{
				$(this).prev('label').removeClass('hidden');
				$(this).closest('div').addClass('has-error');
				input_tr.find('td').eq(6).text('');
			}
		})
		// returning_detailとreturningに新規追加商品の保存
		newRow.find('#row_update').on('click',function(){
			var whouse_id = parseInt($('select#whouse_id').val());
			var memo = $('textarea#memo').val();
			var supplier_name = $('input#supplier_name').val();
			var supplier_ids = alasql('SELECT id FROM supplier WHERE name = ?', [ supplier_name ])[0];
			var supplier_id;
			supplier_ids ? supplier_id = supplier_ids.id : supplier_id = '';
			var input_tr = $(this).closest('tr');
//			console.log("hello")
			var code = input_tr.find('input[name="code"]').val();
			var amount = parseInt(input_tr.find('input[name="qty"]').val());
			var item = alasql('SELECT * \
					FROM item \
					JOIN kind ON kind.id = item.kind \
					WHERE item.code = ?', [ code ])[0];
			
			if(item && amount){
				// returning_detail追加
				var returning_detail_id = alasql('SELECT MAX(id) + 1 as id FROM returning_detail')[0].id;
				var price = amount * item.item.price
				alasql('INSERT INTO returning_detail VALUES(?,?,?,?,?)', [ returning_detail_id, q3, item.item.id, amount, price ]);
				// stockレコード更新
				var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whouse_id, item.item.id ])[0];
				var stock_id, balance = 0;
				if (rows) {
					stock_id = rows.id;
					balance = rows.balance;
					alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance - amount, stock_id ]);
				} else {
					stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
					alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item.item.id, whouse_id, balance - amount ]);
				}
				// transレコード追加
				var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
				alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?,?,?)', [ trans_id, stock_id, del_date, '', -amount, balance - amount, q3, "返品", memo ]);
				// returningへの保存（金額の変更）
				var old_price = alasql('SELECT price FROM returning WHERE numb LIKE ?', [ q3 ])[0].price;
//				console.log(JSON.stringify(price));
				alasql('UPDATE returning \
						SET price = ? \
						WHERE numb LIKE ?', [ old_price + price, q3 ]);
			}
			// trの削除
			input_tr.remove();
			// ページの読み込み
			window.location.reload(true);
		})
	}

	/*// クリック動作
	$('#tbody-returnings > tr').css('cursor', 'pointer').on('click', function() {
		window.location = $(this).attr('data-href');
	});*/
}