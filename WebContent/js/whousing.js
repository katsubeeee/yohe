// 検索ボックス作成
var rows = alasql('SELECT * FROM whouse;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.whouse.id);
	option.text(row.whouse.name);
	$('select[name="q1"]').append(option);
}

// 検索条件の取得
var q1 = parseInt($.url().param('q1') || '0');
$('select[name="q1"]').val(q1);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// SQLの生成
var sql = 'SELECT * \
	FROM whousing \
	JOIN customer ON customer.id = whousing.customer \
	WHERE whousing.whoused = 0 AND whousing.order_id LIKE ? ';

sql += q1 ? 'AND whousing.whouse = ' + q1 + ' ' : '';
//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var whousings = alasql(sql, [ q3 + '%' ]);

// HTML作成
var q1 = parseInt($.url().param('q1') || '0');
var tbody = $('#tbody-whousings');
for (var i = 0; i < whousings.length; i++) {
	var whousing = whousings[i];
	var tr = $('<tr data-href="whousing-form.html?q1='+ q1 +'&q3=' + whousing.whousing.order_id + '"></tr>');
	tr.append('<td>' + whousing.whousing.order_id + '</td>');
	tr.append('<td>' + whousing.customer.name + '</td>');
	tr.append('<td>' + numberWithCommas(whousing.whousing.price) + '</td>');
	tr.append('<td>' + whousing.whousing.del_date + '</td>');
	tr.appendTo(tbody);
}

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
