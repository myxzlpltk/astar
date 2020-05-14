class App{

	constructor(){
		this.width = $(document).width();
		this.height = $(document).height()-5;
		this.nodes = [];

		this.ctx = $('canvas').attr({
			width: this.width,
			height: this.height
		}).get(0).getContext('2d');
	}

	randomX(){
		return Math.floor(Math.random()*(this.width-200))+25;
	}
	randomY(){
		return Math.floor(Math.random()*(this.height-200))+25;
	}

	addNode(x, y){
		this.nodes.push({
			x: x,
			y:y
		});
	}

	getDistance(index1, index2){
		var node1 = this.nodes[index1];
		var node2 = this.nodes[index2];

		var x = Math.abs(node1.x - node2.x);
		var y = Math.abs(node1.y - node2.y);
		var distance = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));

		return distance;
	}

	calculateWay(){
		for(var i=0; i<this.nodes.length; i++){
			var data = [];
			for(var j=0; j<this.nodes.length; j++){
				if(i!=j){
					data.push({
						to: j,
						position: this.nodes[j],
						distance: this.getDistance(i, j)
					});
				}
			}

			data = data.sort(function(a, b){
				return a.distance - b.distance;
			});

			this.nodes[i].way = data.slice(0, 3);
		}
	}

	track(from, to){
		console.log(from, to, this.nodes[from], this.nodes[to]);

		var data = this._track(from, to, {status: true, path: [from], visited: [from]});

		console.log(data.status, data.path);

		if(data.status){
			let ctx = this.ctx;

			for(var i=0; i<data.path.length-1; i++){
				var j = i+1;
				
				ctx.strokeStyle = "#1e90ff";

				var node1 = this.nodes[data.path[i]];
				var node2 = this.nodes[data.path[j]];

				var center = {
					x: Math.round(Math.min(node1.x, node2.x)+Math.abs(node1.x-node2.x)/2),
					y: Math.round(Math.min(node1.y, node2.y)+Math.abs(node1.y-node2.y)/2)
				};

				ctx.beginPath();
				ctx.moveTo(node1.x, node1.y);
				ctx.lineTo(node2.x, node2.y);
				var headlen = 10;
				var dx = center.x - node1.x;
				var dy = center.y - node1.y;
				var angle = Math.atan2(dy, dx);

				ctx.moveTo(center.x, center.y);
				ctx.lineTo(center.x - headlen * Math.cos(angle - Math.PI / 6), center.y - headlen * Math.sin(angle - Math.PI / 6));
				ctx.moveTo(center.x, center.y);
				ctx.lineTo(center.x - headlen * Math.cos(angle + Math.PI / 6), center.y - headlen * Math.sin(angle + Math.PI / 6));
				ctx.stroke();

				ctx.strokeStyle = "#000000";
			}
		}
	}

	_track(from, to, data){
		var temp = [];

		this.nodes[data.path[data.path.length-1]].way.filter(function(way){

			return data.visited.indexOf(way.to) == -1;

		}).forEach(function(way){
			data.visited.push(way.to);

			temp.push({
				f: way.distance+app.getDistance(way.to, to),
				next: way.to
			});
		});

		temp.sort(function(a,b){return a.f-b.f});

		if(temp.length > 0){
			data.path.push(temp[0].next);

			if(temp[0].next != to){
				return this._track(from, to, data);
			}
			else{
				return data;
			}
		}
		else{
			data.status = false;
			return data;
		}
	}

	render(){
		let ctx = this.ctx;

		// clear canvas
		this.ctx.clearRect(0, 0, this.width, this.height);

		// draw way
		let nodes = this.nodes;
		this.nodes.forEach(function(node, i){
			node.way.forEach(function(way){
				var node1 = node;
				var node2 = app.nodes[way.to];

				var center = {
					x: Math.round(Math.min(node1.x, node2.x)+Math.abs(node1.x-node2.x)/2),
					y: Math.round(Math.min(node1.y, node2.y)+Math.abs(node1.y-node2.y)/2)
				};

				ctx.beginPath();
				if(nodes[way.to].way.filter(function(way){return way.to==i}).length==0 || i<way.to){
					ctx.moveTo(node1.x, node1.y);
					ctx.lineTo(node2.x, node2.y);
				}
				var headlen = 10;
				var dx = center.x - node1.x;
				var dy = center.y - node1.y;
				var angle = Math.atan2(dy, dx);

				ctx.moveTo(center.x, center.y);
				ctx.lineTo(center.x - headlen * Math.cos(angle - Math.PI / 6), center.y - headlen * Math.sin(angle - Math.PI / 6));
				ctx.moveTo(center.x, center.y);
				ctx.lineTo(center.x - headlen * Math.cos(angle + Math.PI / 6), center.y - headlen * Math.sin(angle + Math.PI / 6));
				ctx.stroke();

			});
		});

		// draw node
		ctx.moveTo(0, 0);
		
		this.nodes.forEach(function(node, i){
			ctx.beginPath();
			ctx.arc(node.x, node.y, 5, 0, 2*Math.PI);
			ctx.fillStyle = 'red';
			ctx.fill();

			ctx.fillStyle = 'green';
			ctx.font = "10px Arial";
			ctx.fillText(i, node.x-5, node.y-10);
		});
	}

}

var app;

$(document).ready(function(){
	app = new App();

	// Init App
	
	var total = 20;
	while(total--){
		app.addNode(app.randomX(), app.randomY());
	}
	total = 20;

	app.calculateWay();

	var queue = [];

	for(var i=0; i<total-1; i++){
		for(var j=i+1; j<total; j++){
			queue.push([i, j]);
		}
	}

	function run(queue){
		var execute = queue.shift();

		app.render();
		app.track(execute[0], execute[1]);
	}

	run(queue);
});