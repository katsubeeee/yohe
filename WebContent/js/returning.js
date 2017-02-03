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
	FROM returning \
	JOIN supplier ON supplier.id = returning.supplier \
	WHERE returning.shipped = 0 AND returning.return_id LIKE ? ';

sql += q1 ? 'AND returning.whouse = ' + q1 + ' ' : '';
//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var returnings = alasql(sql, [ q3 + '%' ]);

// HTML作成
var q1 = parseInt($.url().param('q1') || '0');
var tbody = $('#tbody-returnings');
for (var i = 0; i < returnings.length; i++) {
	var returning = returnings[i];
	var tr = $('<tr data-href="returning-eform.html?q3=' + returning.returning.return_id + '"></tr>');
	tr.append('<td>' + returning.returning.return_id + '</td>');
	tr.append('<td>' + returning.supplier.name + '</td>');
	tr.append('<td>' + numberWithCommas(returning.returning.price) + '</td>');
	tr.append('<td>' + returning.returning.del_date + '</td>');
	tr.appendTo(tbody);
}

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
