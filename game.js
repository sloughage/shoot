var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var keys = {
	65: false, // left (a)
	68: false, // right (d)
	87: false, // up (w)
	83: false, // down (s)
	32: false, // fire (space)
	80: false  // pause (p)
};

var init_time;
var TIME = 0;
var INT = 0;
var pause = false;
var scroll = 1;
var score = 0;
var players = [];
var enemies = [];
var e_bullets = [];
var p_bullets = [];
var STATE = 0;

function Log(){
	this.data = [[2000, 0]];
	this.update = function(){
		if(STATE != 0){
			if(STATE == this.data[0][1]){
				this.data[0][0] += INT;
			}else{
				this.data.unshift([INT, STATE]);
			}
			var t = INT;
			while(t > 0){
				if(this.data[this.data.length-1][0] < t){
					t = t - this.data[this.data.length-1][0];
					this.data = this.data.slice(0, this.data.length-1);
				}else{
					this.data[this.data.length-1][0] = this.data[this.data.length-1][0] - t;
					t = 0;
				}
			}
		}
	}
	this.get = function(delay){
		var t = delay;
		for(i = 0; i < this.data.length; i++){
			if(this.data[i][0] < t){
				t = t - this.data[i][0];
			}else{
				return this.data[i][1]
			}
		}
		return this.data[this.data.length-1][1];
	}
}

var log = new Log();

function updateState(){
	if(keys[87] && !keys[83]){
		if(keys[65] && !keys[68]){
			STATE = 8;
		}else if(!keys[65] && keys[68]){
			STATE = 2;
		}else{
			STATE = 1;
		}
	}else if(!keys[87] && keys[83]){
		if(keys[65] && !keys[68]){
			STATE = 6;
		}else if(!keys[65] && keys[68]){
			STATE = 4;
		}else{
			STATE = 5;
		}
	}else{
		if(keys[65] && !keys[68]){
			STATE = 7;
		}else if(!keys[65] && keys[68]){
			STATE = 3;
		}else{
			STATE = 0;
		}
	}
}

document.addEventListener(
	'keydown', 
	function(e){
		if(e.keyCode == 32 && !keys[32]){players.map(function(x){x.charge()})};
		if(e.keyCode == 80 && !keys[80]){pause = !pause};
		keys[e.keyCode] = true;
	}, 
	false
);
document.addEventListener(
	'keyup', 
	function(e){
		keys[e.keyCode] = false;
		if(e.keyCode == 32){players.map(function(x){x.fire()})};
	}, 
	false
);

var spawn_arr = [
	[0, 'players', new Ball(100, 100)],
	[0, 'players', new Baby(100, 100, 200)],
	[0, 'players', new Baby(100, 100, 400)],
	[0, 'players', new Baby(100, 100, 600)],
	[0, 'players', new Baby(100, 100, 800)],
	[0, 'players', new Baby(100, 100, 1000)],
	[0, 'enemies', new Turret(500, 200)],
	[0, 'enemies', new Turret(600, 300)]
];

function spawn(){
	if(spawn_arr.length > 0 && TIME >= spawn_arr[0][0]){
		switch(spawn_arr[0][1]){
			case 'players':
				players.push(spawn_arr[0][2]);
				break;
			case 'enemies':
				enemies.push(spawn_arr[0][2]);
				break;
		}
		spawn_arr.shift();
		spawn();
	}
}

function normalize(x, y, l){
	if(x == 0 && y == 0){return [x, y];}
	else{var k = l / Math.sqrt(x * x + y * y); return [x * k, y * k];}
}

function drawCircle(x, y, r, color){
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fillStyle = '#fff';
	ctx.fill();
	ctx.closePath();
}

function drawRing(x, y, r, color){
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.strokeStyle = '#fff';
	ctx.stroke();
	ctx.closePath();
}

function Ball(x, y){
	this.x = x;
	this.y = y;
	this.r = 10;
	this.dx = 0;
	this.dy = 0;
	this.t = 0;
	this.v = .2;
	this.fire = function(){
		var k = Math.min(6, Math.floor(this.t / 333));
		p_bullets.push(new Bullet(this.x, this.y, 1, 0, 3 + k / 2, 1 + k));
	}
	this.charge = function(){
		this.t = 0;
	}
	this.update = function(){
		log.update();
		switch(STATE){
			case 0:
				this.dx = 0;
				this.dy = 0;
				break;
			case 1:
				this.dx = 0;
				this.dy = -this.v;
				break;
			case 2:
				this.dx = this.v/Math.sqrt(2);
				this.dy = -this.v/Math.sqrt(2);
				break;
			case 3:
				this.dx = this.v;
				this.dy = 0;
				break;
			case 4:
				this.dx = this.v/Math.sqrt(2);
				this.dy = this.v/Math.sqrt(2);
				break;
			case 5:
				this.dx = 0;
				this.dy = this.v;
				break;
			case 6:
				this.dx = -this.v/Math.sqrt(2);
				this.dy = this.v/Math.sqrt(2);
				break;
			case 7:
				this.dx = -this.v;
				this.dy = 0;
				break;
			case 8:
				this.dx = -this.v/Math.sqrt(2);
				this.dy = -this.v/Math.sqrt(2);
		}
		this.dx *= INT;
		this.dy *= INT;
		this.x = Math.max(Math.min(this.x + this.dx, 720), 0);
		this.y = Math.max(Math.min(this.y + this.dy, 360), 0);
		this.t += INT;
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#fff');
	}
}

function Baby(x, y, delay){
	this.x = x;
	this.y = y;
	this.r = 5;
	this.v = .2;
	this.delay = delay;
	this.charge = function(){};
	this.fire = function(){
		p_bullets.push(new Bullet(this.x, this.y, 1, 0, 2, 1));
	}
	this.update = function(){
		if(STATE != 0){
			switch(log.get(this.delay)){
				case 1:
					this.y += -this.v * INT;
					break;
				case 2:
					this.x += this.v/Math.sqrt(2) * INT;
					this.y += -this.v/Math.sqrt(2) * INT;
					break;
				case 3:
					this.x += this.v * INT;
					break;
				case 4:
					this.x += this.v/Math.sqrt(2) * INT;
					this.y += this.v/Math.sqrt(2) * INT;
					break;
				case 5:
					this.y += this.v * INT;
					break;
				case 6:
					this.x += -this.v/Math.sqrt(2) * INT;
					this.y += this.v/Math.sqrt(2) * INT;
					break;
				case 7:
					this.x += -this.v * INT;
					break;
				case 8:
					this.x += -this.v/Math.sqrt(2) * INT;
					this.y += -this.v/Math.sqrt(2) * INT;
			}
		}
		this.x = Math.max(Math.min(this.x, 720), 0);
		this.y = Math.max(Math.min(this.y, 360), 0);
	}
	this.draw = function(){
		drawRing(this.x, this.y, this.r, '#fff');
	}
}

function Bullet(x, y, dx, dy, r, dmg){
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.r = r;
	this.dmg = dmg;
	this.del = false;
	this.update = function(){
		this.x += this.dx * INT;
		this.y += this.dy * INT;
		if(this.x > 720 + this.r || this.x < -this.r){
			this.del = true;
		}
	}
	this.hit = function(){
		this.del = true;
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#fff')
	}
}

function Turret(x, y){
	this.x = x;
	this.y = y;
	this.r = 12;
	this.health = 2;
	this.reload = 1000;
	this.del = false;
	this.score = 10;
	this.t = 0;
	this.fire = function(){
		if(players.length > 0){
			var c = normalize(players[0].x - this.x, players[0].y - this.y, .2);
			e_bullets.push(new Bullet(this.x, this.y, c[0], c[1], 3, 1));
		}
	}
	this.update = function(){
		this.t += INT;
		if(this.t >= this.reload){
			this.t = this.t - 1000;
			this.fire();
		}
	}
	this.hit = function(bullet){
		this.health -= bullet.dmg;
		if(this.health <= 0){
			this.del = true;
			score += this.score;
		}
		bullet.hit();
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#ff5');
	}
}
function Drone(x, y, r, h){
	this.x = x;
	this.y = y;
	this.r = r;
	this.h = h;
	this.move = function(dx, dy){
		self.x += dx;
		self.y += dy;
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#f5f');
	}
}

// function Swarm(x, y, children){
// 	this.x = x;
// 	this.y = y;
// 	this.children = drones;
// 	this.update(){};
// 	this.draw(){
// 		this.children.map(function(x){x.draw()})
// 	}
// }
// function Tank(x, y){
// 	this.x = x;
// 	this.y = y;
// 	this.dx = 0;
// 	this.dy = 0;
// 	this.r = 10;
// 	this.h = 20;
// 	// this.children = [new Drone(this.x - 6, this.y - 6, 5, 20), new Drone(this.x - 6, this.y + 6, 5, 20), new Drone(this.x - 8, this.y, 5, 20)];
// 	this.update(){
// 		// this.children = this.children.filter(function(x){return x.h > 0});
// 	}
// 	this.draw(){
// 		ctx.beginPath()
// 		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
// 		ctx.fillStyle = '#fff';
// 		ctx.fill();
// 		ctx.closePath();
// 		// draw(this.x, this.y, this.r, '#5ff');
// 		// for(i in this.children){
// 		// 	ctx.beginPath()
// 		// 	ctx.arc(this.children[i].x, this.children[i].y, this.children[i].r, 0, Math.PI * 2);
// 		// 	ctx.fillStyle = '#fff';
// 		// 	ctx.fill();
// 		// 	ctx.closePath();
// 		// 	// this.children[i].draw();
// 		// }
// 	}
// }

function update(){
	function collision(){
		function overlap(obj1, obj2){
			var h = Math.pow(obj1.x - obj2.x, 2);
			var v = Math.pow(obj1.y - obj2.y, 2);
			return Math.sqrt(h + v) <= obj1.r + obj2.r;
		}
		for(i in p_bullets){
			for(j in enemies){
				if(overlap(p_bullets[i], enemies[j])){
					enemies[j].hit(p_bullets[i]);
				}
			}
		}
	}
	updateState();
	players.map(function(x){x.update()});
	p_bullets.map(function(x){x.update()});
	e_bullets.map(function(x){x.update()});
	enemies.map(function(x){x.update()});
	collision();
	p_bullets = p_bullets.filter(function(x){return !x.del;});
	e_bullets = e_bullets.filter(function(x){return !x.del;});
	enemies = enemies.filter(function(x){return !x.del;});
}

function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	players.map(function(x){x.draw()});
	p_bullets.map(function(x){x.draw()});
	e_bullets.map(function(x){x.draw()});
	enemies.map(function(x){x.draw()});
}

function main(timestamp){
	if(!init_time)init_time = timestamp;
	INT = timestamp - init_time - TIME;
	TIME = timestamp - init_time;
	spawn();
	update();
	draw();
	window.requestAnimationFrame(main);
}

window.requestAnimationFrame(main);