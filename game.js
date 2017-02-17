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

var TIME = 0;
var SCROLL = .08;
var SCORE = 0;
var STATE = 0;
var PHASE = 0;
var LVL = 0;

var players = [];
var enemies = [];
var e_bullets = [];
var p_bullets = [];
var stars = [];

var log = new Log();

function rand(a, b){
	return Math.floor(Math.random() * (b - a + 1)) + a;
}

function Star(x=720){//framed
	var d = rand(4, 10);
	var c = (14 - d).toString(16);
	this.x = x;
	this.y = rand(0, 360);
	this.dx = -10 / d;
	this.color = "#" + c + c + c;
	this.length = Math.floor(80 / d);
	this.del = false;
	this.update = function(){
		this.x += this.dx;
		if(this.x + this.length < 0){
			this.del = true;
		}
	}
	this.draw = function(){
		drawLine(this.x, this.y, this.x + this.length, this.y, this.color);
	}
}

function Log(){
	this.data = [];
	for(i=0, var x=ball.x, var y=ball.y; i<120; i++){this.data.push([x, y])};
	this.update = function(){
		if(keys[87] != keys[83] || keys[65] != keys[68]){
			this.data.unshift([ball.x, ball.y]);
			this.data = this.data.pop();
		}
	}
	this.get = function(delay){
		return this.data[delay - 1];
	}
}

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

document.addEventListener(//framed
	'keydown', 
	function(e){
		if((e.keyCode == 32 && PHASE < 2)||(e.keyCode == 80 && !keys[80] && PHASE == 1)){
			PHASE = 2;
			// window.requestAnimationFrame(function(x){PREV_TS = x});
			window.requestAnimationFrame(main);
		}else if(e.keyCode == 80 && !keys[80] && PHASE == 2){
			PHASE = 1;
		};
		keys[e.keyCode] = true;
	}, 
	false
);
document.addEventListener(
	'keyup', 
	function(e){
		keys[e.keyCode] = false;
	}, 
	false
);

var ball = new Ball(100, 100);
var spawn_arr = [
	[0, 'p', ball],
	[0, 'p', new Baby(150)],
	[0, 'p', new Baby(300)],
	[0, 'p', new Baby(450)],
	[0, 'e', new Turret(740, 200)],
	[0, 'e', new Turret(740, 300)],
	[0, 'e', new Drone(740, 100, 8, 50)],
	[1000, 'e', new Tank(740,250)]
];

var spawn_arr2 = [
	[0, 'p', ball],
	[0, 'e', new Turret(740, 100)]
]

function spawn(){
	if(Math.random() < .15){
		stars.unshift(new Star());
	}
	if(spawn_arr.length > 0 && TIME >= spawn_arr[0][0]){
		switch(spawn_arr[0][1]){
			case 'p':
				players.unshift(spawn_arr[0][2]);
				break;
			case 'e':
				enemies.unshift(spawn_arr[0][2]);
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

function overlap(obj1, obj2){
	var h = Math.pow(obj1.x - obj2.x, 2);
	var v = Math.pow(obj1.y - obj2.y, 2);
	return Math.sqrt(h + v) <= obj1.r + obj2.r;
}

function drawCircle(x, y, r, color){
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}

function drawRing(x, y, r, color){
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.strokeStyle = color;
	ctx.stroke();
	ctx.closePath();
}

function drawLine(x1, y1, x2, y2, color){
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
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
	this.reload = 3;
	this.v = 4;
	this.health = 10;
	this.fire = function(){
		p_bullets.push(new Bullet(this.x, this.y, 16, 0, 3, 3, '#3f3'))
	}
	this.update = function(){
		this.t++;
		var dx = keys[68] - keys[65];
		var dy = keys[83] - keys[87];
		if(dx != 0 && dy != 0){
			var k = this.v / Math.sqrt(Math.abs(dx) + Math.abs(dy));
			this.x = Math.max(Math.min(this.x + dx * k, 720), 0);
			this.y = Math.max(Math.min(this.y + dy * k, 360), 0);
		}
		if(keys[32] && this.t >= this.reload){
			this.t = 0;
			for(p in players){p.fire()};
		}
		log.update();
	}
	this.collision = function(bullet){
		if(!bullet.del && overlap(this, bullet)){
			bullet.del = true;
			this.health -= bullet.dmg;
			if(this.health <= 0){
				this.del = true;
				SCORE += this.score;
			}
		}
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#fff');
	}
}

function Baby(delay){
	this.r = 5;
	this.reload = 3;
	this.delay = delay;
	this.fire = function(){
		p_bullets.push(new Bullet(this.x, this.y, 16, 0, 2, 1, '#3f3'));
	}
	this.update = function(){
		[this.x, this.y] = log.get(this.delay);
	}
	this.collision = function(bullet){
		return false;
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#000');
		drawRing(this.x, this.y, this.r, '#fff');
	}
}

function Bullet(x, y, dx, dy, r, dmg, color){
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.r = r;
	this.dmg = dmg;
	this.color = color;
	this.del = false;
	this.update = function(){
		this.x += this.dx;
		this.y += this.dy;
		if(this.x > 720 + this.r || this.x < -this.r){this.del = true};
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, this.color);
	}
}

function Turret(x, y){
	this.x = x;
	this.y = y;
	this.r = 12;
	this.health = 10;
	this.reload = 60;
	this.del = false;
	this.score = 10;
	this.t = 0;
	this.fire = function(){
		var c = normalize(ball.x - this.x, ball.y - this.y, 3);
		e_bullets.push(new Bullet(this.x, this.y, c[0], c[1], 4, 1, '#f3f'));
	}
	this.update = function(){
		this.t += INT;
		if(this.x < -this.r){
			this.del = true;
		}
		if(this.t >= this.reload){
			this.t = this.t - 1000;
			this.fire();
		}
		this.x -= SCROLL * INT;
	}
	this.collision = function(bullet){
		if(!bullet.del && overlap(this, bullet)){
			bullet.del = true;
			this.health -= bullet.dmg;
			if(this.health <= 0){
				this.del = true;
				SCORE += this.score;
			}
		}
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#fff');
	}
}
function Drone(x, y, r, health){
	this.x = x;
	this.y = y;
	this.r = r;
	this.health = health;
	this.t = 0;
	this.del = false;
	this.score = 0;
	this.move = function(dx, dy){
		self.x += dx;
		self.y += dy;
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#000');
		drawRing(this.x, this.y, this.r, '#fff');
	}
	this.update = function(){
		this.t += INT;
		this.x -= SCROLL * INT;
	}
	this.collision = function(bullet){
		if(!bullet.del && overlap(this, bullet)){
			bullet.del = true;
			this.health -= bullet.dmg;
			if(this.health <= 0){
				this.del = true;
				SCORE += this.score;
			}
			return true;
		}
		return false;
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
function Tank(x, y){
	this.x = x;
	this.y = y;
	this.r = 12;
	this.health = 20;
	this.reload = 1000;
	this.del = false;
	this.score = 20;
	this.t = 0;
	this.bv = .2
	this.children = [new Drone(this.x - 5, this.y - 5, 8, 20), new Drone(this.x - 5, this.y + 5, 8, 20)];
	this.fire = function(){
		if(players.length > 0){
			e_bullets.push(new Bullet(this.x, this.y, -this.bv, 0, 4, 1, '#f3f'));
		}
	}
	this.update = function(){
		this.t += INT;
		if(this.t >= this.reload){
			this.t = this.t - 1000;
			this.fire();
		}
		this.x -= SCROLL * INT;
		this.children.forEach(function(x){x.update()});
	}
	this.collision = function(bullet){
		for(i in this.children){
			this.children[i].collision(bullet);
		}
		if(!bullet.del && overlap(this, bullet)){
			bullet.del = true;
			this.health -= bullet.dmg;
			if(this.health <= 0){
				this.del = true;
				SCORE += this.score;
			}
		}
		this.children = this.children.filter(function(x){return !x.del});
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#fff');
		for(i in this.children){
			this.children[i].draw();
		}
	}
}

function update(){
	updateState();
	stars.map(function(x){x.update()});
	players.map(function(x){x.update()});
	p_bullets.map(function(x){x.update()});
	e_bullets.map(function(x){x.update()});
	enemies.map(function(x){x.update()});
	e_bullets.map(function(x){players.map(function(y){y.collision(x)})});
	p_bullets.map(function(x){enemies.map(function(y){y.collision(x)})});
	stars = stars.filter(function(x){return !x.del});
	p_bullets = p_bullets.filter(function(x){return !x.del});
	e_bullets = e_bullets.filter(function(x){return !x.del});
	enemies = enemies.filter(function(x){return !x.del});
}

function draw(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	stars.map(function(x){x.draw()});
	players.map(function(x){x.draw()});
	p_bullets.map(function(x){x.draw()});
	e_bullets.map(function(x){x.draw()});
	enemies.map(function(x){x.draw()});
	ctx.fillStyle = '#fff';
	ctx.font = '12px';
	ctx.fillText(ball.health, 5, 10);
	ctx.fillText(SCORE, 705, 10);
	ctx.fillText(stars.length, 705, 350)
}

function drawPause(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.fillText("PAUSED", 360, 180);
}

function drawMenu(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.fillText("SHOOT", 360, 180);
}

function main(ts){
	if(PHASE == 0){
		drawMenu();
	}else if(PHASE == 1){
		drawPause();
	}else{
		if(TIME == 0){
			for(i = 0; i < 50; i++){
				stars.unshift(new Star(rand(0, 720)));
			}
		}
		TIME++;
		spawn();
		update();
		draw();
		window.requestAnimationFrame(main);
	}
}

window.requestAnimationFrame(main);