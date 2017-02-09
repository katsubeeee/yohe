// ログインユーザーの判別 // ※1~6行目と37,38行目,最後の括弧はどのページにも必要。
// ※①HTML側にinput[name="q4"]を作ること、②navbarにcss.クラス="toppage"をつけることを忘れずに。
/*var q4 = parseInt($.url().param('q4') || '0');
$('input[name="q4"]').val(q4);
if(q4 === 0){
	window.location.replace('index.html');
} else{*/	var q4 = 0;

	//検索条件の取得
	var q1 = parseInt($.url().param('q1') || '0');
	$('select[name="q1"]').val(q1);
	
	// パンくずリストのリンク設定
	$('.topPage a').attr('href','index2.html?q1='+ q1 +'&q4='+ q4);
	$('.location a').attr('href','location.html?q1='+ q1 +'&q4='+ q4);

	// 商品の新規追加
	function addItem(){
		var tbody = $('#tbody-locatings');
		var new_tr = $('<tr class="newRow"></tr>');
		new_tr.append('<td><div id="location"><label class="control-label hidden">エラー:倉庫を選択してください。</label><select name="whouse" class="form-control"><option value="">倉庫を選択</option></select></div></td>');
		// 倉庫名　事前選択
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
			new_tr.find('select[name="whouse"]').append(option);
		}
		new_tr.append('<td></td>');
		
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
		new_tr.append('<td><div id="location"><label class="control-label hidden">エラー:ロケーションを選択してください。</label><select name="q5" class="form-control"><option value="">ロケーションを選択</option></select></div></td>');
		// ロケーションリスト作成
		var rows = alasql('SELECT * FROM shelf;');
		for (var i = 0; i < rows.length; i++) {
			var row = rows[i];
			var option = $('<option>');
			option.attr('value', row.shelf.id);
			option.text(row.shelf.dist + '-' + row.shelf.numb);
			new_tr.find('select[name="q5"]').append(option);
		}
		
		new_tr.append('<td><div id="qty"><label class="control-label hidden">エラー:正しい数量を入力してください。</label><input type="number" name="qty" size="5" min="1" placeholder="1以上の数字を入力"></div></td>');
		
		new_tr.prependTo(tbody);

		// コード情報より商品情報の自動表示と行挿入
		var newRow = $('tr.newRow');
		newRow.find('input[name="code"]').change(function(){
			var input_tr = $(this).closest('tr');
			var whouse_id = parseInt(input_tr.find('select[name="q1"]').val());
			var code = $(this).val();
			var location = parseInt(input_tr.find('select[name="q5"]').val());
			var amount = parseInt(input_tr.find('input[name="qty"]').val());
//			console.log(code);
			var item = alasql('SELECT * \
						FROM item \
						JOIN kind ON kind.id = item.kind \
						WHERE item.code = ?', [ code ])[0];
				if(item){
					input_tr.find('td').eq(1).text(item.kind.text);
					input_tr.find('td').eq(3).text(item.item.maker); 
					input_tr.find('td').eq(4).text(item.item.detail);
					$(this).prev('label').addClass('hidden');
					$(this).closest('div').removeClass('has-error');
					//console.log('item.item.price = '+ item.item.price)
				} else{
					input_tr.find('td').eq(1).text('');
					input_tr.find('td').eq(3).text(''); 
					input_tr.find('td').eq(4).text('');
					$(this).prev('label').removeClass('hidden');
					$(this).closest('div').addClass('has-error');
					//console.log('item.item.price = '+ item.item.price)
				}
	//新しい行の挿入
	// 商品かつ数量がきちんと入力されていないと、次の行の入力が行えないようにする。
	// かつ、新規入力している行があれば、新しい行が表示されないようにする。
			var checkTrIndex = $(this).closest('tr');
			//console.log($(tbody).find('tr').index(checkTrIndex));
			//console.log('item = '+ JSON.stringify(item));
			//console.log('amount = '+ amount);
			if(item && location && amount && $(tbody).find('tr').index(checkTrIndex) == 0){
				return addItem();
			}
		})
		// 数量を入力後の行挿入
		newRow.find('input[name="qty"]').change(function(){
			var input_tr = $(this).closest('tr');
			var whouse_id = parseInt(input_tr.find('select[name="whouse"]').val());
			var code = input_tr.find('input[name="code"]').val();
			var location = parseInt(input_tr.find('select[name="q5"]').val());
			var amount = parseInt(input_tr.find('input[name="qty"]').val());
			var item = alasql('SELECT * \
					FROM item \
					JOIN kind ON kind.id = item.kind \
					WHERE item.code = ?', [ code ])[0];
//			console.log('item.item.price = '+ item.item.price)
			
			if(amount){
				$(this).prev('label').addClass('hidden');
				$(this).closest('div').removeClass('has-error');
			} else{
				$(this).prev('label').removeClass('hidden');
				$(this).closest('div').addClass('has-error');
			}
			
			// 新しい行の挿入
			// 商品かつ数量がきちんと入力されていないと、次の行の入力が行えないようにする。
			// かつ、新規入力している行があれば、新しい行が表示されないようにする。
			var checkTrIndex = $(this).closest('tr');
			//console.log($(tbody).find('tr').index(checkTrIndex));
			//console.log('item = '+ JSON.stringify(item));
			//console.log('amount = '+ amount);
			if(item && location && amount && $(tbody).find('tr').index(checkTrIndex) == 0){
				return addItem();
			}
		})
		// ロケーション選択後の行挿入
		newRow.find('input[name="q5"]').change(function(){
			var input_tr = $(this).closest('tr');
			var whouse_id = parseInt(input_tr.find('select[name="whouse"]').val());
			var code = input_tr.find('input[name="code"]').val();
			var location = input_tr.find('select[name="q5"]').val();
			var amount = parseInt(input_tr.find('input[name="qty"]').val());
			var item = alasql('SELECT * \
					FROM item \
					JOIN kind ON kind.id = item.kind \
					WHERE item.code = ?', [ code ])[0];
//			console.log('item.item.price = '+ item.item.price)
			
			if(amount){
				$(this).prev('label').addClass('hidden');
				$(this).closest('div').removeClass('has-error');
			} else{
				$(this).prev('label').removeClass('hidden');
				$(this).closest('div').addClass('has-error');
			}
			
			// 新しい行の挿入
			// 商品かつ数量がきちんと入力されていないと、次の行の入力が行えないようにする。
			// かつ、新規入力している行があれば、新しい行が表示されないようにする。
			var checkTrIndex = $(this).closest('tr');
			//console.log($(tbody).find('tr').index(checkTrIndex));
			//console.log('item = '+ JSON.stringify(item));
			//console.log('amount = '+ amount);
			if(item && location && amount && $(tbody).find('tr').index(checkTrIndex) == 0){
				return addItem();
			}
		})		
	}
	addItem();

	// ロケーション登録処理
	function locating(){
		var tbody_tr = $('#tbody-locatings').find('tr');
		var tr_length = tbody_tr.length;
		// テーブルに入力された商品、数量の情報を取得し、DB更新
		for(var i = 0; i < tr_length; i++){
			var whouse_id = parseInt(tbody_tr.find('select[name="whouse"]').eq(i).val());
			var code = tbody_tr.find('input[name="code"]').eq(i).val();
			var location = tbody_tr.find('select[name="q5"]').eq(i).val();
			var amount = parseInt(tbody_tr.find('input[name="qty"]').eq(i).val());
			var item = alasql('SELECT * \
					FROM item \
					JOIN kind ON kind.id = item.kind \
					WHERE item.code = ?', [ code ])[0];
			if(item && amount && location && whouse_id){
				// stockレコード更新
				var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whouse_id, item.item.id ])[0];
				var stock_id, balance = 0;
				if (rows) {
					stock_id = rows.id;
					balance = rows.balance;
					if(balance < amount){
						return window.alert('数量が在庫数を超えています。\n数量を入力しなおしてください。')
					}
				} else {
					return window.alert('在庫に計上されていない商品には、ロケーションを登録できません。\n入庫入力を行ってから、もう一度やり直してください。')
				}
				// locationの更新
				var location_id = ('SELECT MAX(id) + 1 as id FROM stock')[0].id;
				alasql('INSERT INTO location VALUES(?,?,?,?)', [ location_id, stock_id, location, amount ]);
			}
		}
		window.location.replace('location.html?q1='+ q1 +'&q4='+ q4);
	}

	/*// クリック動作
	$('#tbody-returnings > tr').css('cursor', 'pointer').on('click', function() {
		window.location = $(this).attr('data-href');
	});*/
	
//}