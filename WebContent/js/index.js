
// ユーザー情報入力補助
var datalist = $('<datalist id="inputCodeList"></datalist>')
var whouses = alasql('SELECT id, name FROM whouse');
for(var i = 0; i < whouses.length; i++ ){
	var whouse = whouses[i]
	var option = $('<option></option>');
	option.val(whouse.name);
	datalist.append(option);
}
// ユーザー「本社」の追加
datalist.append('<option value="本社"></option>')
var inputUsers = $('input#users');
inputUsers.attr("list","inputCodeList");
inputUsers.append(datalist);

// 送信ボタンイベント
$('button[type="submit"]').click(function(){
	userSubmit($('input#users').val());
})

function userSubmit(user_name){
	var user_id = alasql('SELECT id \
			FROM whouse \
			WHERE name = ?', [ user_name ])[0];
	console.log(user_id)
	if(user_name == '本社'){
		// ☆ログインユーザーの登録（初回ログイン時に記録）
		var ui = alasql('SELECT MAX(id) + 1 as id FROM uim')[0].id;
		alasql('INSERT INTO uim VALUES(?,?)', [ ui, 0 ]);
		var q4 = ui;
		return window.location.replace('index.html');
	} else if(user_id){
		var q1 = user_id.id;
		// ☆ログインユーザーの登録（初回ログイン時に記録）
		var ui = alasql('SELECT MAX(id) + 1 as id FROM uim')[0].id;
		alasql('INSERT INTO uim VALUES(?,?)', [ ui, q1 ]);
		var q4 = ui;
	} else{
		var span = $('<span>');
		var div = $('div.div-form')
		span.text('ユーザー名を正しく入力してください。フォーム内の▼からも選択ができます。');
		span.css('color','red');
		span.prependTo(div);
		return;
	}
	return window.location.replace('index2.html?q1='+ q1 +'&q4='+ q4) ;
}