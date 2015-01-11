//JG

$(document).ready(function(){

	window.io = io.connect();

	io.on('connect', function(socket){
		console.log('Conectado');
		io.emit('hello?');
	});

	io.on('saludo', function(data){
		$('#server').html(data.message);
	});

	io.on('log-in', function(data){
		$('#users').append('<li>'+data.username+'</li>');
	});	

	io.on('log-out', function(data){
		$('#users li').each(function(i, item){
			if(item.innerText == data.username){
				$(item).remove();
			}
		});
	});	

});