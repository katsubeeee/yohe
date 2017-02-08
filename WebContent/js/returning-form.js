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
	
	// パンくずリストのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	
	// 返品No.の自動入力
	var q3 = alasql('SELECT MAX(numb) + 1 as numb FROM returning')[0].numb;
	$('#return_id').val(q3);

	// 取引先入力補助
	var datalist = $('<datalist id="inputSupplierList"></datalist>')
	var suppliers = alasql('SELECT name FROM supplier');
	for(var i = 0; i < suppliers.length; i++ ){
		var supplier = suppliers[i]
		var option = $('<option></option>');
		option.val(supplier.name);
		datalist.append(option);
	}
	var input = $('#supplier_name');
	input.attr("list","inputSupplierList");
	input.append(datalist);
	
	// 選択ボックスの作成
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
		$('#whouse_name').append(option);
	}

	// 取引先入力後のメモを自動作成
	$('input#supplier_name').change(function(){
		var supplier_name = $('input#supplier_name').val();
		$('textarea#memo').val(supplier_name + ' へ返品予定 ');
	})
	
	// 日付情報入力時のfunction
	$('input#del_date').change(function(){
		var date = $('input#del_date').val();
		var dat = date.split('-');
		if(!parseInt(dat[0]) || !parseInt(dat[1]) || !parseInt(dat[2])){
			$(this).closest('div').addClass('has-error');
			$(this).prev('p').removeClass('hidden');
		} else{
			$(this).closest('div').removeClass('has-error');
			$(this).prev('p').addClass('hidden');
		}
	})
	
	// 商品の新規追加
	function addItem(){
		var tbody = $('#tbody-returnings');
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
		new_tr.append('<td><div id="code"><label class="control-label hidden">エラー:正しいコードを入力してください。</label><input type="text" name="code" placeholder="コードを入力"></div></td>');
		// 商品コード入力補助
		var datalist = $('<datalist id="inputCodeList"></datalist>')
		var items = alasql('SELECT code, detail, maker FROM item');
		for(var i = 0; i < items.length; i++ ){
			var item = items[i]
			var option = $('<option></option>');
			option.val(item.code);
			option.text(item.maker + ' ' + item.detail);
			datalist.append(option);
		}
		var input = new_tr.find('input[name="code"]');
		input.attr("list","inputCodeList");
		input.append(datalist);

		new_tr.append('<td></td>');
		new_tr.append('<td></td>');
		new_tr.append('<td><div id="qty"><label class="control-label hidden">エラー:正しい数量を入力してください。</label><input type="number" name="qty" size="5" min="1" placeholder="1以上の数字を入力"></div></td>');
		new_tr.append('<td></td>');
		
		new_tr.prependTo(tbody);

		// コード情報より商品情報の自動表示（同時に金額の自動計算）
		var newRow = $('tr.newRow');
		//console.log(newRow.html())
		newRow.find('input[name="code"]').change(function(){
			var input_tr = $(this).closest('tr');
			var code = $(this).val();
			var amount = parseInt(input_tr.find('input[name="qty"]').val());
//			console.log(code);
			var item = alasql('SELECT * \
						FROM item \
						JOIN kind ON kind.id = item.kind \
						WHERE item.code = ?', [ code ])[0];
				if(item){
					input_tr.find('td').eq(0).text(item.kind.text);
					input_tr.find('td').eq(2).text(item.item.maker); 
					input_tr.find('td').eq(3).text(item.item.detail);
					$(this).prev('label').addClass('hidden');
					$(this).closest('div').removeClass('has-error');
					//console.log('item.item.price = '+ item.item.price)
					amount ? input_tr.find('td').eq(5).text(numberWithCommas(amount * item.item.price)) : input_tr.find('td').eq(5).text('');
				} else{
					input_tr.find('td').eq(0).text('');
					input_tr.find('td').eq(2).text(''); 
					input_tr.find('td').eq(3).text('');
					$(this).prev('label').removeClass('hidden');
					$(this).closest('div').addClass('has-error');
					//console.log('item.item.price = '+ item.item.price)
					amount ? input_tr.find('td').eq(5).text(numberWithCommas(amount * item.item.price)) : input_tr.find('td').eq(5).text('');
				}
	//新しい行の挿入
	// 商品かつ数量がきちんと入力されていないと、次の行の入力が行えないようにする。
	// かつ、新規入力している行があれば、新しい行が表示されないようにする。
			var checkTrIndex = $(this).closest('tr');
			//console.log($(tbody).find('tr').index(checkTrIndex));
			//console.log('item = '+ JSON.stringify(item));
			//console.log('amount = '+ amount);
			if(item && amount && $(tbody).find('tr').index(checkTrIndex) == 0){
				return addItem();
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
			
			if(amount){
				$(this).prev('label').addClass('hidden');
				$(this).closest('div').removeClass('has-error');
				item ? input_tr.find('td').eq(5).text(numberWithCommas(amount * item.item.price)) : input_tr.find('td').eq(5).text('');
			} else{
				$(this).prev('label').removeClass('hidden');
				$(this).closest('div').addClass('has-error');
				input_tr.find('td').eq(5).text('');
			}
			
			// 新しい行の挿入
			// 商品かつ数量がきちんと入力されていないと、次の行の入力が行えないようにする。
			// かつ、新規入力している行があれば、新しい行が表示されないようにする。
			var checkTrIndex = $(this).closest('tr');
			//console.log($(tbody).find('tr').index(checkTrIndex));
			//console.log('item = '+ JSON.stringify(item));
			//console.log('amount = '+ amount);
			if(item && amount && $(tbody).find('tr').index(checkTrIndex) == 0){
				return addItem();
			}
		})
	}
	addItem();

	// 返品処理
	function returning(){
		var return_id = $('input#return_id').val();
		var supplier_name = $('input#supplier_name').val();
		var whouse_id = parseInt($('select#whouse_name').val());
		var del_date = $('input#del_date').val();
		var dal_date1 = date.split('-');
		var memo = $('textarea#memo').val();
		// 現在時刻の取得
		var now_time = Date.now();
		var dat = new Date();
		dat.setTime(now_time);
		var year = dat.getFullYear();
		var month = dat.getMonth() + 1;
		var date = dat.getDate();
		// 取得した年月日をSQLのdate形式に直す。
		var predate = year + '-' + month + '-' + date; 
		var supplier_ids = alasql('SELECT id FROM supplier WHERE name = ?', [ supplier_name ])[0];
		var supplier_id;
		supplier_ids ? supplier_id = supplier_ids.id : supplier_id = '';
//		console.log(return_id);
//		console.log(supplier_name);
//		console.log(whouse_name);
//		console.log(del_date);
		// マスタ情報の入力チェック
		if(!supplier_id && !whouse_id && parseInt(del_date1[0]) && parseInt(del_date1[1]) && parseInt(del_date1[2])){
			$('input#supplier_name').closest('div').addClass('has-error');
			$('input#supplier_name').prev('label').removeClass('hidden');
			$('select#whouse_name').closest('div').addClass('has-error');
			$('select#whouse_name').prev('label').removeClass('hidden');
			return;
			} else if(!supplier_id){
				$('input#supplier_name').closest('div').addClass('has-error');
				$('input#supplier_name').prev('label').removeClass('hidden');
				$('select#whouse_name').closest('div').removeClass('has-error');
				$('select#whouse_name').prev('label').addClass('hidden');
				return;
			} else if(!whouse_id){
				$('select#whouse_name').closest('div').addClass('has-error');
				$('select#whouse_name').prev('label').removeClass('hidden');
				$('input#supplier_name').closest('div').removeClass('has-error');
				$('input#supplier_name').prev('label').addClass('hidden');
				return;
			} else if(parseInt(del_date1[0]) || parseInt(del_date1[1]) || parseInt(del_date1[2])){
				$('input#del_date').closest('div').addClass('has-error');
				$('input#del_date').prev('p').removeClass('hidden');
				$('input#supplier_name').closest('div').removeClass('has-error');
				$('input#supplier_name').prev('label').addClass('hidden');
				$('select#whouse_name').closest('div').removeClass('has-error');
				$('select#whouse_name').prev('label').addClass('hidden');
				return ;
			} else{
				$('input#supplier_name').closest('div').removeClass('has-error');
				$('input#supplier_name').prev('label').addClass('hidden');
				$('select#whouse_name').closest('div').removeClass('has-error');
				$('select#whouse_name').prev('label').addClass('hidden');
				$('input#del_date').closest('div').removeClass('has-error');
				$('input#del_date').prev('p').addClass('hidden');
			}
		
		var input_code = [];
		var input_amount = [];
		var tbody_tr = $('#tbody-returnings').find('tr');
		var tr_length = tbody_tr.length;
		// テーブルに入力された商品、数量の情報を取得し、DB更新
		var all_price = 0;
		for(var i = 0; i < tr_length; i++){
			var code = tbody_tr.find('input[name="code"]').eq(i).val();
			var amount = parseInt(tbody_tr.find('input[name="qty"]').eq(i).val());
			var item = alasql('SELECT * \
					FROM item \
					JOIN kind ON kind.id = item.kind \
					WHERE item.code = ?', [ code ])[0];
			if(item && amount){
				// returning_detail追加
				var returning_detail_id = alasql('SELECT MAX(id) + 1 as id FROM returning_detail')[0].id;
				var price = amount * item.item.price
				all_price = all_price + price;
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
			}// elseのitemとamountが不正値である場合については、changeファンクションで処理済なので、触れない。
		}
		// returning追加
		if(all_price > 0){
			var returning_id = alasql('SELECT MAX(numb) + 1 as numb FROM returning')[0].numb;
			alasql('INSERT INTO returning VALUES(?,?,?,?,?,?,?,?,?,?)', [ returning_id, q3, supplier_id, whouse_id, all_price, predate, del_date, '', memo, 0 ]);
		} else{
			window.alert('問題が発生したため処理が完了できませんでした。\n正しく入力されていない恐れがあります。\n入力した値をご確認ください。')
			return ;
		}
		window.location.replace('returning-eform.html?q1='+ q1 +'&q3='+ q3 +'&q4='+ q4);
	}

	/*// クリック動作
	$('#tbody-returnings > tr').css('cursor', 'pointer').on('click', function() {
		window.location = $(this).attr('data-href');
	});*/
	
}