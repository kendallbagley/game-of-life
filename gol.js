$(document).ready(function () {
	var current_game = CreateGame();
	var a;
	
	$("#size").mouseup(function() {
		current_game = CreateGame();
	});
	
	$("#start_button").click(function (e) {
		e.preventDefault();
		current_game.started = true;
		
		$("#start_button").attr('disabled', 'disabled');
		$("#stop_button").removeAttr("disabled");
		$("#next_step").attr('disabled', 'disabled');
		
		current_game.setVariables();
		if(current_game.checkVariables() ) {
			a = setInterval(function(){current_game.step()}, current_game.speed);
		} else {
			$("#stop_button").attr('disabled', 'disabled');
			$("#start_button").removeAttr("disabled");
		}
	});
	
	$("#stop_button").click(function(e) {
		e.preventDefault();
		clearInterval(a);
		
		$("#stop_button").attr('disabled', 'disabled');
		$("#start_button").removeAttr("disabled");
		$("#next_step").removeAttr("disabled");
	});
	
	$("#random_button").click(function(e) {
		e.preventDefault();
		clearInterval(a);
		current_game = CreateRandomGame();
	});
	
	$("#reset_button").click(function(e) {
		e.preventDefault();
		clearInterval(a);
		current_game = CreateGame();
	});
	
	$("#next_step").click(function(e) {
		e.preventDefault();
		current_game.step();
	});
});

	var CreateGame = function() {
		$("#start_button").removeAttr("disabled");
		$("#stop_button").attr('disabled', 'disabled');
		$("#next_step").attr('disabled', 'disabled');
		
		var size = parseInt($("#size").val());
		var radius = parseInt($("#radius").val());
		var loneliness = parseInt($("#loneliness").val());
		var overpopulation = parseInt($("#overpopulation").val());
		var gen_min = parseInt($("#gen_min").val());
		var gen_max = parseInt($("#gen_max").val());
		var speed = parseInt($("#speed").val());
		var neighbors = parseInt($("#neighbors").val());
		
		if (isNaN(loneliness) || loneliness < 1 || loneliness > overpopulation) {
	    alert("Illegal Loneliness Threshold: " + $("#loneliness").val());
	    return;
		}
		
		if (isNaN(overpopulation) || overpopulation < loneliness || overpopulation > 4*radius*radius + 4*radius) {
	    alert("Illegal Overpopulation Threshold: " + $("#overpopulation").val());
	    return;
		}
		
		if (isNaN(gen_min) || gen_min < 1 || gen_min > gen_max) {
	    alert("Illegal Generation Minimum: " + $("#gen_min").val());
	    return;
		}
		
		if (isNaN(gen_max) || gen_max < gen_min || gen_max > 4*radius*radius + 4*radius) {
	    alert("Illegal Generation Maximum: " + $("#gen_max").val());
	    return;
		}
		
		return new GOL($("#game_grid"), size, radius, loneliness, overpopulation, gen_min, gen_max, speed, neighbors);
	};
	
	var CreateRandomGame = function() {
		var random_game = CreateGame();
		
		for(var x = 0; x < random_game.size; x++) {
			for(var y = 0; y < random_game.size; y++) {
				var r = Math.floor((Math.random() * 2) + 0);
				if(r == 1) {
					random_game.blocks[x][y].status = 1;
					random_game.blocks[x][y].block_div.addClass("alive");
					random_game.blocks[x][y].block_div.removeClass("dead");
					random_game.blocks[x][y].block_div.removeClass("undead");
				} 
			}
		}
		
		return random_game;
	};
	
	var GOL = function(game_div, size, radius, loneliness, overpopulation, gen_min, gen_max, speed, neighbors) {
		this.game_div = game_div;
		this.size = size;
		this.radius = radius;
		this.loneliness = loneliness;
		this.overpopulation = overpopulation;
		this.gen_min = gen_min;
		this.gen_max = gen_max;
		this.speed = speed;
		this.neighbors = neighbors;
		this.started = false;
		this.blocks = new Array(size);
		this.block_size = 500 / size;
		
		for(var x = 0; x < this.size; x++) {
			this.blocks[x] = new Array(size);
			for(var y = 0; y < this.size; y++) {
				var block = new Block(this, x, y, this.block_size);
				this.blocks[x][y] = block;
				game_div.append(block.getBlockDiv());
			}
		}
	};
	
	GOL.prototype.setVariables = function() {
		this.radius = parseInt($("#radius").val());
		this.loneliness = parseInt($("#loneliness").val());
		this.overpopulation = parseInt($("#overpopulation").val());
		this.gen_min = parseInt($("#gen_min").val());
		this.gen_max = parseInt($("#gen_max").val());
		this.speed = parseInt($("#speed").val());
		this.neighbors = parseInt($("#neighbors").val());
	};
	
	GOL.prototype.checkVariables = function() {
		if (isNaN(this.loneliness) || this.loneliness < 1 || this.loneliness > this.overpopulation) {
	    alert("Illegal Loneliness Threshold: " + $("#loneliness").val());
	    return false;
		}
		
		if (isNaN(this.overpopulation) || this.overpopulation < this.loneliness || this.overpopulation > 4*this.radius*this.radius + 4*this.radius) {
	    alert("Illegal Overpopulation Threshold: " + $("#overpopulation").val());
	    return false;
		}
		
		if (isNaN(this.gen_min) || this.gen_min < 1 || this.gen_min > this.gen_max) {
	    alert("Illegal Generation Minimum: " + $("#gen_min").val());
	    return false;
		}
		
		if (isNaN(this.gen_max) || this.gen_max < this.gen_min || this.gen_max > 4*this.radius*this.radius + 4*this.radius) {
	    alert("Illegal Generation Maximum: " + $("#gen_max").val());
	    return false;
		}
		
		return true;
	};

	
	GOL.prototype.step = function() {
		
		for(var x = 0; x < this.size; x++) {
			for(var y = 0; y < this.size; y++) {
				var b = this.blocks[x][y];
				var nalive = b.aliveNeighbors();
				
				if(b.status == 1 && (nalive < this.loneliness || nalive > this.overpopulation)) {
					b.changed = 3;
				} else if((b.status == 2 || b.status == 3) && nalive >= this.gen_min && nalive <= this.gen_max) {
					b.changed = 1;
				} 
			}
		}
		
		for(var i = 0; i < this.size; i++) {
			for(var j = 0; j < this.size; j++) {
				var o = this.blocks[i][j];
				
				if(o.changed !== 0) {
					if(o.changed == 3) {
						o.changed = 0;
						o.status = 3;
						o.block_div.addClass("undead");
						o.block_div.removeClass("alive");
					} else if(o.changed == 1 && o.status == 2) {
						o.changed = 0;
						o.status = 1;
						o.block_div.addClass("alive");
						o.block_div.removeClass("dead");
					} else if(o.changed == 1 && o.status == 3) {
						o.changed = 0;
						o.status = 1;
						o.block_div.addClass("alive");
						o.block_div.removeClass("undead");
					}
				}
			}
		}
		
	};
	
	var Block = function (gol, x, y, size) {
    	this.gol = gol;
    	this.x = x;
    	this.y = y;
    	this.size = size;
    	this.status = 2;
    	this.changed = 0;
    	this.block_div = $("<div></div>").css({position:"absolute", width: this.size, height: this.size, top: y * this.size, left: x * this.size});
    	
    	this.block_div.addClass("block");
    	this.block_div.addClass("dead");
    	var block = this;
    	
    	this.block_div.click(function (e) {
			e.preventDefault();
			if (e.button === 0 && !e.shiftKey && !e.altKey)  {
	    		block.toggle();
			} else if (e.button === 0 && e.shiftKey && !e.altKey) {
	    		block.revive();
			} else if(e.button === 0 && !e.shiftKey && e.altKey) {
				block.kill();
			}
    	});
	};
	
	Block.prototype.getBlockDiv = function() {
    return this.block_div;
	};
	
	Block.prototype.toggle = function() {
		if(this.status == 1) {
			this.status = 3;
			this.block_div.addClass("undead");
			this.block_div.removeClass("alive");
		} else if(this.status == 3) {
			this.status = 1;
			this.block_div.addClass("alive");
			this.block_div.removeClass("undead");
		} else if(this.status == 2) {
			this.status = 1;
			this.block_div.addClass("alive");
			this.block_div.removeClass("dead");
		}
	};
	
	Block.prototype.revive = function() {
		this.status = 1;
		this.block_div.addClass("alive");
		this.block_div.removeClass("undead");
		this.block_div.removeClass("dead");
	};
	
	Block.prototype.kill = function() {
		if(this.status == 1) {
			this.status = 3;
			this.block_div.addClass("undead");
			this.block_div.removeClass("alive");
		}
	};
	
	Block.prototype.aliveNeighbors = function() {
		var game = this.gol;
		var r = game.radius;
		var s = game.size;
		var n = game.neighbors;
		var b = game.blocks;
		var count = 0;
		
		for(var x = -r; x <= r; x++) {
			var xx = x + this.x;
			
			for(var y = -r; y <= r; y++) {
				var yy = y + this.y;
				if(xx < 0 || yy< 0 || xx >= s || yy >= s) {
					if(n == 1) {
						count++;
					} else if(n == 3 && b[(xx+s)%s][(yy+s)%s].status == 1) {
						count++;
					}
				} else if((x !== 0 || y !== 0) && b[xx][yy].status == 1) {
					count++;
				}
			}
		}
		return count;
	};

	