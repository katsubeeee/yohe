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
	FROM shipping \
	JOIN customer ON customer.id = shipping.customer \
	WHERE shipping.shipped = 0 AND shipping.order_id LIKE ? ';

sql += q1 ? 'AND shipping.whouse = ' + q1 + ' ' : '';
//sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var shippings = alasql(sql, [ q3 + '%' ]);

// HTML作成
var q1 = parseInt($.url().param('q1') || '0');
var tbody = $('#tbody-shippings');
for (var i = 0; i < shippings.length; i++) {
	var shipping = shippings[i];
	var tr = $('<tr data-href="shipping-form.html?q1='+ q1 +'&q3=' + shipping.shipping.order_id + '"></tr>');
	tr.append('<td>' + shipping.shipping.order_id + '</td>');
	tr.append('<td>' + shipping.customer.name + '</td>');
	tr.append('<td>' + numberWithCommas(shipping.shipping.price) + '</td>');
	tr.append('<td>' + shipping.shipping.del_date + '</td>');
	tr.appendTo(tbody);
}

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
