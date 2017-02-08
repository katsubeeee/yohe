$(document).ready(function(){
  $('#navi > h4').click(function(){
    // 引数には開閉する速度を指定します
    $(this).next().slideToggle('slow');
  });
});

$(".btn").click(function(){
	$(this).toggleClass('open');
	if($(this).hasClass('open')){
		$("#navi").animate(
				  {'left': '100px'}
//		    {width: "toggle", opacity: "toggle"},
//		    {duration: "slow", easing: "swing"}
		  );
	} else{
		$("#navi").animate(
				  {'left': '-100px'}
	)}
	});