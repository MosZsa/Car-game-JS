class Road
{
	constructor(image, y)
	{
		this.x = 0;
		this.y = y;
		this.loaded = false;

		this.image = new Image();
		
		var obj = this;

		this.image.addEventListener("load", function () { obj.loaded = true; });

		this.image.src = image;
	}

	Update(road) 
	{
		this.y += speed; 

		if(this.y > window.innerHeight) 
		{
			this.y = road.y - canvas.width + speed; 
		}
	}
}

class Car
{
	constructor(image, x, y, isPlayer)
	{
		this.x = x;
		this.y = y;
		this.loaded = false;
		this.dead = false;
		this.isPlayer = isPlayer;

		this.image = new Image();

		var obj = this;

		this.image.addEventListener("load", function () { obj.loaded = true; });

		this.image.src = image;
	}

	Update()
	{
		if(!this.isPlayer)
		{
			this.y += speed;
		}

		if(this.y > canvas.height + 50)
		{
			this.dead = true;
		}
	}

	Collide(car)
	{
		var hit = false;

		if(this.y < car.y + car.image.height * scale && this.y + this.image.height * scale > car.y) 
		{
			if(this.x + this.image.width * scale > car.x && this.x < car.x + car.image.width * scale) 
			{
				hit = true;
			}
		}

		return hit;
	}

	Move(v, d) 
	{
		if(v == "x") 
		{
			d *= 2;

			this.x += d; 

			
			if(this.x + this.image.width * scale > canvas.width)
			{
				this.x -= d; 
			}
	
			if(this.x < 0)
			{
				this.x = 0;
			}
		}
		else 
		{
			this.y += d;

			if(this.y + this.image.height * scale > canvas.height)
			{
				this.y -= d;
			}

			if(this.y < 0)
			{
				this.y = 0;
			}
		}
		
	}
}


const UPDATE_TIME = 1000 / 60;

var timer = null;

var canvas = document.getElementById("canvas"); 
var ctx = canvas.getContext("2d"); 

var scale = 0.2; 

Resize(); 

window.addEventListener("resize", Resize); 


canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; }); 

window.addEventListener("keydown", function (e) { KeyDown(e); }); 

var objects = []; 

var roads = 
[
	new Road("images/road.jpg", 0),
	new Road("images/road.jpg", canvas.width)
]; 

var player = new Car("images/car.png", canvas.width / 2, canvas.height / 2, true); 


var speed = 8; 

var score = 0; 

var music = new Audio("Music/background_music.mp3");
music.loop = true; 

canvas.addEventListener("click", 
function() {
    music.play(); 
});

music.volume = 0.2;

Start();

function Start()
{
	if(!player.dead)
	{
		timer = setInterval(Update, UPDATE_TIME); 
	}
	
}

function Stop()
{
	clearInterval(timer); 
	timer = null;
}

function Update() 
{
	roads[0].Update(roads[1]);
	roads[1].Update(roads[0]);

	if(RandomInteger(0, 10000) > 9700) 
	{
		objects.push(new Car("images/car_reverse.png", RandomInteger(30, canvas.width - 50), RandomInteger(250, 400) * -1, false));
	}

	player.Update();

	if(player.dead)
	{
		alert("Crash!");
		Stop();
		showRestartButton(); 
	}

	var isDead = false; 

	for(var i = 0; i < objects.length; i++)
	{
		objects[i].Update();

		if(objects[i].dead)
		{
			isDead = true;
		}
	}

	if(isDead)
	{
		objects.shift();
		score++; 
	}

	var hit = false;

	for(var i = 0; i < objects.length; i++)
	{
		hit = player.Collide(objects[i]);

		if(hit)
		{
			alert("Crash!");
			Stop();
			showRestartButton(); 
			player.dead = true;
			break;
		}
	}

	Draw();
}

function Draw() 
{
	ctx.clearRect(0, 0, canvas.width, canvas.height); 

	for(var i = 0; i < roads.length; i++)
	{
		ctx.drawImage
		(
			roads[i].image, 
			0, 
			0, 
			roads[i].image.width, 
			roads[i].image.height, 
			roads[i].x, 
			roads[i].y, 
			canvas.width, 
			canvas.width 
		);
	}

	DrawCar(player);

	for(var i = 0; i < objects.length; i++)
	{
		DrawCar(objects[i]);
	}

	drawScore(); 
}

function DrawCar(car)
{
	ctx.drawImage
	(
		car.image, 
		0, 
		0, 
		car.image.width, 
		car.image.height, 
		car.x, 
		car.y, 
		car.image.width * scale, 
		car.image.height * scale 
	);
}

function KeyDown(e)
{
	switch(e.keyCode)
	{
		case 37: 
			player.Move("x", -speed);
			break;

		case 39: 
			player.Move("x", speed);
			break;

		case 38: 
			player.Move("y", -speed);
			break;

		case 40: 
			player.Move("y", speed);
			break;

		case 27: 
			if(timer == null)
			{
				Start();
			}
			else
			{
				Stop();
			}
			break;
	}
}

function Resize()
{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

function RandomInteger(min, max) 
{
	let rand = min - 0.5 + Math.random() * (max - min + 1);
	return Math.round(rand);
}

function drawScore() {
	ctx.fillStyle = "#ffffff";
	ctx.font = "24px Arial";
	ctx.fillText("Score: " + score, 10, 30); 
}

function showRestartButton() {
	var button = document.createElement("button"); 
	button.innerHTML = "Restart"; 
	button.style.position = "absolute";
	button.style.left = "50%";
	button.style.top = "50%";
	button.style.width = "100px"
	button.style.height = "100px"
	button.style.transform = "translate(-50%, -50%)";
	button.onclick = function() {
		location.reload(); 
	};
	document.body.appendChild(button); 
}
