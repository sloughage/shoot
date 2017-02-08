var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var keyPressed = {
	65: false, // left (a)
	68: false, // right (d)
	87: false, // up (w)
	83: false, // down (s)
	32: false, // fire (space)
	80: false  // pause (p)
};

var init_time;
var time = 0;
var interval = 0;
var pause = false;
var scroll = 1;
var score = 0;
var players = [];
var enemies = [];
var e_bullets = [];
var p_bullets = [];

document.addEventListener(
	'keydown', 
	function(e){
		if(e.keyCode == 32 && !keyPressed[32]){players.map(function(x){x.charge()})}
		if(e.keyCode == 80 && !keyPressed[80]){pause = !pause};
		keyPressed[e.keyCode] = true;
	}, 
	false
);
document.addEventListener(
	'keyup', 
	function(e){
		keyPressed[e.keyCode] = false;
		if(e.keyCode == 32){players.map(function(x){x.fire()})};
	}, 
	false
);

var spawn_arr = [
	[0, 'players', new Ball(100, 100)],
	[1000, 'enemies', new Turret(500, 200)],
	[1000, 'enemies', new Turret(600, 300)]
];

function spawn(){
	if(spawn_arr.length > 0 && time >= spawn_arr[0][0]){
		switch(spawn_arr[0][1]){
			case 'players':
				players.push(spawn_arr[0][2]);
				break;
			case 'enemies':
				enemies.push(spawn_arr[0][2]);
				break;
		}
		spawn_arr.shift();
		spawn()
	}
}

function normalize(x, y, l){
	if(x == 0 && y == 0){return [x, y];}
	else{var k = l / Math.sqrt(x * x + y * y); return [x * k, y * k];}
}

function drawCircle(x, y, r, color){
	ctx.beginPath()
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fillStyle = '#fff';
	ctx.fill();
	ctx.closePath();
}

function Ball(x, y){
	this.x = x;
	this.y = y;
	this.r = 10;
	this.dx = 0;
	this.dy = 0;
	this.t = 0;
	this.fire = function(){
		var k = Math.min(6, Math.floor(this.t / 333));
		p_bullets.push(new Bullet(this.x, this.y, 1, 0, 3 + k / 2, 1 + k));
	}
	this.charge = function(){
		this.t = 0;
	}
	this.update = function(){
		var h = keyPressed[68] - keyPressed[65];
		var v = keyPressed[83] - keyPressed[87];
		if(h == 0 && v == 0){var k = 0;}
		else{var k = .2 * interval / Math.sqrt(Math.abs(h) + Math.abs(v));}
		this.dx = h * k;
		this.dy = v * k;
		this.x = Math.max(Math.min(this.x + this.dx, 710), 10);
		this.y = Math.max(Math.min(this.y + this.dy, 350), 10);
		this.t += interval;
	}
	this.draw = function(){
		// ctx.beginPath()
		// ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
		// ctx.fillStyle = '#fff';
		// ctx.fill();
		// ctx.closePath();
		drawCircle(this.x, this.y, this.r, '#fff');
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
		this.x += this.dx * interval;
		this.y += this.dy * interval;
		if(this.x > 720 + this.r || this.x < -this.r){
			this.del = true;
		}
	}
	this.hit = function(){
		this.del = true;
	}
	this.draw = function(){
		// ctx.beginPath()
		// ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
		// ctx.fillStyle = '#fff';
		// ctx.fill();
		// ctx.closePath();
		drawCircle(this.x, this.y, this.r, '#fff')
	}
}

function Turret(x, y){
	this.x = x;
	this.y = y;
	this.r = 12;
	this.health = 10;
	this.reload = 1000;
	this.del = false;
	this.score = 1;
	this.t = 0;
	this.fire = function(){
		if(players.length > 0){
			var c = normalize(players[0].x - this.x, players[0].y - this.y, .2);
			e_bullets.push(new Bullet(this.x, this.y, c[0], c[1], 3, 1));
		}
	}
	this.update = function(){
		this.t += interval;
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
		// ctx.beginPath()
		// ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
		// ctx.fillStyle = '#fff';
		// ctx.fill();
		// ctx.closePath();
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
		// ctx.beginPath()
		// ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
		// ctx.fillStyle = '#fff';
		// ctx.fill();
		// ctx.closePath();
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

// enemies.push(new Turret(500, 300));

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
	if(!init_time){init_time = timestamp;};
	interval = timestamp - init_time - time;
	time = timestamp - init_time;
	spawn();
	update();
	draw();
	window.requestAnimationFrame(main);
}

window.requestAnimationFrame(main);