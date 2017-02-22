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
var SCROLL = 1;
var SCORE = 0;
var STATE = 0;

var ENEMIES = [];
var E_BULLETS = [];
var A_BULLETS = [];
var ITEMS = [];
var STARS = [];

var LOG = new Log();
var BALL = new Ball();
var LVL = new Leveler();

document.addEventListener(
	'keydown', 
	function(e){
		if((e.keyCode == 32 && STATE < 2)||(e.keyCode == 80 && !keys[80] && STATE == 1)){
			STATE = 2;
			window.requestAnimationFrame(main);
		}else if(e.keyCode == 80 && !keys[80] && STATE == 2){
			STATE = 1;
		}else if(STATE == 4 && e.keyCode == 32 && !keys[32]){
			STATE = 0;
			TIME = 0;
			SCORE = 0;
			ENEMIES = [];
			E_BULLETS = [];
			A_BULLETS = [];
			ITEMS = [];
			STARS = [];
			LOG = new Log();
			BALL = new Ball();
			LVL = new Leveler();
			window.requestAnimationFrame(main);
		}
		keys[e.keyCode] = true;
	}, 
	false
)
document.addEventListener(
	'keyup', 
	function(e){
		keys[e.keyCode] = false;
	}, 
	false
)

function rand(a, b){
	return Math.floor(Math.random() * (b - a + 1)) + a;
}

function overlap(obj1, obj2){
	var h = Math.pow(obj1.x - obj2.x, 2);
	var v = Math.pow(obj1.y - obj2.y, 2);
	return Math.sqrt(h + v) <= obj1.r + obj2.r;
}

function normalize(x, y, l){
	if(x == 0 && y == 0){return [x, y];}
	else{var k = l / Math.sqrt(x * x + y * y); return [x * k, y * k];}
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

function Leveler(){
	this.data = [
		[
			[0, new Turret(740, 100)],
			[0, new Turret(740, 200)],
			[60, new Turret(740, 200)],
			[120, new Turret(740, 300)],
			[210, new Tank(740,250)]
		],
		[
			[0, new Turret(740, 200)],
			[60, new Turret(740, 200)],
			[120, new Turret(740, 300)],
			[180, new Tank(740, 250)],
			[180, new Tank(780, 150)]
		],
		[
			[60, new Tank(740, 80)],
			[60, new Tank(740, 280)],
			[120, new Tank(780, 180)]
		]
	]
	this.lvl = 0;
	this.pos = 0;
	this.fin = false;
	this.update = function(){
		if(this.pos < this.data[this.lvl].length){
			if(this.data[this.lvl][this.pos][0] == TIME){
				ENEMIES.unshift(this.data[this.lvl][this.pos][1]);
				this.pos++;
				this.update();
			}
		}else{
			this.fin = true;
		}
	}
	this.next = function(){
		this.lvl += 1;
		this.pos = 0;
		this.fin = false;
		if(this.lvl == this.data.length){
			STATE = 4;
		}
	}
}

function Log(){
	this.fill = function(){
		this.data = [];
		for(i = 0; i < 120; i++){this.data.push([60, 180])};
	}
	this.fill();
	this.update = function(){
		if(keys[87] != keys[83] || keys[65] != keys[68]){
			this.data.unshift([BALL.x, BALL.y]);
			this.data.pop();
		}
	}
	this.get = function(delay){
		return this.data[delay - 1];
	}
}

function Star(){
	var d = rand(4, 10);
	var c = (14 - d).toString(16);
	this.x = 720;
	this.y = rand(0, 360);
	this.dx = -10 / d;
	this.color = "#" + c + c + c;
	this.length = Math.floor(80 / d);
	this.del = Math.random() > .1;
	this.update = function(){
		this.x += this.dx;
		if(this.x + this.length < 0){this.del = true};
	}
	this.draw = function(){
		drawLine(this.x, this.y, this.x + this.length, this.y, this.color);
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

function Ball(){
	this.r = 10;
	this.reload = 3;
	this.children = [];
	this.set = function(){
		this.x = 60;
		this.y = 180;
		this.dx = 0;
		this.dy = 0;
		this.t = this.reload;
		this.health = 3;
		this.children.forEach(function(x){x.update()});
	}
	this.set();
	this.fire = function(){
		A_BULLETS.push(new Bullet(this.x, this.y, 16, 0, 3, 3, '#3f3'))
	}
	this.update = function(){
		this.t++;
		if(keys[87] != keys[83] || keys[65] != keys[68]){
			this.children.forEach(function(x){x.update()});
		}
		var dx = keys[68] - keys[65];
		var dy = keys[83] - keys[87];
		if(dx != 0 || dy != 0){
			var k = 4 / Math.sqrt(Math.abs(dx) + Math.abs(dy));
			this.x = Math.max(Math.min(this.x + dx * k, 720), 0);
			this.y = Math.max(Math.min(this.y + dy * k, 360), 0);
		}
		if(keys[32] && this.t >= this.reload){
			this.t = 0;
			this.fire();
			this.children.forEach(function(x){x.fire()});
		}
		LOG.update();
	}
	this.collision = function(bullet){
		if(!bullet.del && overlap(this, bullet)){
			bullet.del = true;
			this.health -= bullet.dmg;
			if(this.health <= 0){STATE = 4};
		}
	}
	this.pickup = function(item){
		if(overlap(this, item)){
			item.del = true;
			SCORE += 5;
			if(this.children.length < 9){
				this.children.unshift(new Baby((this.children.length + 1) * 10));
			}
		}
	}
	this.draw = function(){
		this.children.forEach(function(x){x.draw()});
		drawCircle(this.x, this.y, this.r, '#fff');
	}
}

function Baby(delay){
	this.r = 5;
	this.delay = delay;
	this.fire = function(){
		A_BULLETS.push(new Bullet(this.x, this.y, 16, 0, 2, 1, '#3f3'));
	}
	this.update = function(){
		var p = LOG.get(this.delay);
		this.x = p[0];
		this.y = p[1];
	}
	this.collision = function(bullet){
		return false;
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#000');
		drawRing(this.x, this.y, this.r, '#fff');
	}
}

function Item(x, y){
	this.x = x;
	this.y = y;
	this.r = 6;
	this.r2 = 3;
	this.del = false;
	this.update = function(){
		this.x -= SCROLL * 2;
		if(this.x < -this.r){
			this.del = true;
		}
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#3f3');
		drawCircle(this.x, this.y, this.r2, '#000');
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
		var c = normalize(BALL.x - this.x, BALL.y - this.y, 3);
		E_BULLETS.push(new Bullet(this.x, this.y, c[0], c[1], 4, 1, '#f3f'));
	}
	this.update = function(){
		this.t++;
		if(this.t >= this.reload){
			this.fire();
			this.t = 0;
		}
		this.x -= SCROLL;
		if(this.x < -this.r){this.del = true};
	}
	this.collision = function(bullet){
		if(!bullet.del && overlap(this, bullet)){
			bullet.del = true;
			this.health -= bullet.dmg;
			if(this.health <= 0){
				this.del = true;
				SCORE += this.score;
				ITEMS.push(new Item(this.x, this.y));
			}
			return true;
		}
		return false;
	}
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#fff');
	}
}

function Drone(x, y, r, health, angle){
	this.x = x;
	this.y = y;
	this.r = r;
	this.health = health;
	this.t = 0;
	this.del = false;
	this.score = 0;
	this.angle = angle;
	this.fire = function(){
		var c = normalize(-2, angle, 3);
		E_BULLETS.push(new Bullet(this.x, this.y, c[0], c[1], 4, 1, '#f3f'));
	}
	this.update = function(dx, dy){
		this.t++;
		this.x += dx;
		this.y += dy;
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
	this.draw = function(){
		drawCircle(this.x, this.y, this.r, '#333');
		drawRing(this.x, this.y, this.r, '#fff');
	}
}

function Tank(x, y){
	this.x = x;
	this.y = y;
	this.r = 15;
	this.dx = -SCROLL;
	this.dy = 0;
	this.health = 80;
	this.reload = 60;
	this.del = false;
	this.score = 20;
	this.change = 150;
	this.t = 0;
	this.state = 0;
	this.children = [
		new Drone(this.x - 10, this.y - 8, 8, 50, -1), 
		new Drone(this.x - 10, this.y + 8, 8, 50, 1),
		new Drone(this.x - 12, this.y, 8, 50, 0)
	]
	this.fire = function(){
		this.children.forEach(function(x){x.fire()});
	}
	this.update = function(){
		this.t++;
		this.change--;
		if(this.state == 0 && this.change == 0){
			this.dx = 0;
			this.dy = 1;
			this.state = 1;
		}else if(this.state == 1){
			if(this.children.length == 0){
				this.state = 2;
				this.dx = SCROLL;
				this.dy = 0;
				this.change = 150;
			}else if(this.y >= 300 || this.y <= 60){
				this.dy = -this.dy;
			}
		}else if(this.state == 2 && this.change == 0){
			this.del = true;
		}
		this.x += this.dx;
		this.y += this.dy;
		if(this.t >= this.reload){
			this.fire();
			this.t = 0;
		}
		var self = this;
		this.children.forEach(function(x){x.update(self.dx, self.dy)});
	}
	this.collision = function(bullet){
		this.children.forEach(function(x){x.collision(bullet)});
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
		this.children.forEach(function(x){x.draw()});
		drawCircle(this.x, this.y, this.r, '#333');
		drawRing(this.x, this.y, this.r, '#fff');
	}
}

function update(){
	STARS.forEach(function(x){x.update()});
	A_BULLETS.forEach(function(x){x.update()});
	E_BULLETS.forEach(function(x){x.update()});
	ITEMS.forEach(function(x){x.update()});
	BALL.update();
	ENEMIES.forEach(function(x){x.update()});
	LVL.update();
	STARS.unshift(new Star());
	E_BULLETS.forEach(function(x){BALL.collision(x)});
	ITEMS.forEach(function(x){BALL.pickup(x)});
	A_BULLETS.forEach(function(x){ENEMIES.forEach(function(y){y.collision(x)})});
	STARS = STARS.filter(function(x){return !x.del});
	ITEMS = ITEMS.filter(function(x){return !x.del});
	A_BULLETS = A_BULLETS.filter(function(x){return !x.del});
	E_BULLETS = E_BULLETS.filter(function(x){return !x.del});
	ENEMIES = ENEMIES.filter(function(x){return !x.del});
	if(LVL.fin && ENEMIES.length == 0 && ITEMS.length == 0){
		STATE = 3;
		TIME = -180;
	}
}

function updateTransition(){
	STARS.forEach(function(x){x.update()});
	A_BULLETS.forEach(function(x){x.update()});
	E_BULLETS.forEach(function(x){x.update()});
	STARS = STARS.filter(function(x){return !x.del});
	ITEMS = ITEMS.filter(function(x){return !x.del});
	A_BULLETS = A_BULLETS.filter(function(x){return !x.del});
	E_BULLETS = E_BULLETS.filter(function(x){return !x.del});
}

function draw(){
	ctx.clearRect(0, 0, 720, 360);
	STARS.forEach(function(x){x.draw()});
	A_BULLETS.forEach(function(x){x.draw()});
	BALL.draw();
	ITEMS.forEach(function(x){x.draw()});
	ENEMIES.forEach(function(x){x.draw()});
	E_BULLETS.forEach(function(x){x.draw()});
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'left';
	ctx.fillText(BALL.health, 10, 15);
	ctx.textAlign = 'right';
	ctx.fillText(SCORE, 705, 15);
}

function drawPause(){
	ctx.clearRect(0, 0, 720, 360);
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.fillText("PAUSED", 360, 180);
}

function drawMenu(){
	ctx.clearRect(0, 0, 720, 360);
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.fillText("SHOOT", 360, 180);
	ctx.fillText("WASD, SPACE, P(ause)", 360, 200)
}

function drawTransition(){
	ctx.clearRect(0, 0, 720, 360);
	STARS.forEach(function(x){x.draw()});
	A_BULLETS.forEach(function(x){x.draw()});
	BALL.draw();
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'left';
	ctx.fillText(BALL.health, 10, 15);
	ctx.textAlign = 'right';
	ctx.fillText(SCORE, 705, 15);
	ctx.clearRect(TIME * -8 - 720, 0, TIME * -8, 360);
}

function drawEnd(){
	ctx.clearRect(0, 0, 720, 360);
	ctx.fillStyle = '#fff';
	ctx.textAlign = 'center';
	ctx.fillText(SCORE, 360, 180);
}

function main(){
	if(STATE == 0){
		for(i = 0; i < 720; i++){
			STARS.unshift(new Star());
			STARS.forEach(function(x){x.update()});
			STARS = STARS.filter(function(x){return !x.del});
		}
		drawMenu();
	}else if(STATE == 1){
		drawPause();
	}else if(STATE == 2){
		update();
		draw();
		TIME++;
		window.requestAnimationFrame(main);
	}else if(STATE == 3){
		updateTransition();
		drawTransition();
		TIME++;
		if(TIME == -90){
			LOG.fill();
			BALL.set();
			LVL.next();
		}else if(TIME == 0){
			STATE = 2;
		}
		window.requestAnimationFrame(main);
	}else{
		drawEnd();
	}
}

window.requestAnimationFrame(main);