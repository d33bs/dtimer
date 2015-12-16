head.ready(function(){

//model for singular task
var Settings = Backbone.Model.extend({
	localStorage: new Backbone.LocalStorage("Settings"),
	defaults : {
		id : 1,
		time : 0
	}
});

//main timer view - controls display and control views
var MainTimerView = Backbone.View.extend({
	el : "#timerview",
	initialize : function(){
		//check for localStorage - settings are stored locally and retrieved on refresh
		if(!!window.localStorage){
			this.input = new InputView({parent:this});
			this.display = new DisplayView({parent:this});
			this.settings = new Settings({id:1});
			this.settings.fetch();
			//check for previously saved timer settings in localStorage
			if(this.settings.get("time") > 0){
				console.log(this.settings.get("time"));
				$("#input input").val(this.settings.get("time"));
			}
			
		}else{
			this.msg_display("Unable to find localStorage. Please use a browser with localStorage enabled");
		}
	},
	is : {
		paused : false
	},

	display_from_storage : function(){
		
	},
	save_n_store : function(e){
		
	},
	msg_display : function(msg){
		$("#msg").text(msg);
	}
});

var DisplayView = Backbone.View.extend({
	el : "#display",
	initialize : function(){
	
	},
	is : {
		countdown_started : false,
		countdown_paused : false
	},
	count : {
		total : 0,
		min : 0,
		sec : 0
	},
	start_timer : function(e){
		if(!this.is.countdown_paused && $("#input input").val() > 0){
			if(this.is.countdown_started){
				clearInterval(this.second_interval);
			}
			this.is.countdown_started = true;
			this.is.countdown_paused = false;
			var min = parseInt($("#input input").val());
			this.count.total = min;
			this.count.min = min-1;
			this.count.sec = 59;
			this.update_display();
			this.second_interval = window.setInterval(function(){this.count_down();}.bind(this),1000);
		}else if(this.is.countdown_paused){
			this.second_interval = window.setInterval(function(){this.count_down();}.bind(this),1000);
			this.is.countdown_paused = false;
		}else{
			this.options.parent.msg_display("Minutes set must be greater than zero to start timer.");
		}
	},
	pause_timer : function(e){
		if(this.is.countdown_started){
			if(this.is.countdown_paused){
				this.second_interval = window.setInterval(function(){this.count_down();}.bind(this),1000);
				this.is.countdown_paused = false;
			}else if(!this.is.countdown_paused){
				clearInterval(this.second_interval);
				this.is.countdown_paused = true;
			}
		}else{
			this.options.parent.msg_display("Timer must be started before it can be paused.");
		}
	},
	stop_timer : function(e){
		if(this.is.countdown_started){
			clearInterval(this.second_interval);
			this.count.min = 0;
			this.count.sec = 0;
			this.update_display();
		}else{
			this.options.parent.msg_display("Timer must be started before it can be stopped.");
		}
	},
	finish_timer : function(){
	
	},
	count_down : function(){
		if(this.count.sec === 0 && this.count.min > 0){
			this.count.sec = 60;
			this.count.min--;
			this.count.sec--;
		}else if(this.count.sec === 0 && this.count.min === 0){
			this.finish_timer();
		}else{
			this.count.sec--;
		}
		this.update_display();
	},
	update_display : function(){
		$("#display #min").text(this.count.min);
		$("#display #sec").text((this.count.sec<10)?"0"+this.count.sec:this.count.sec);
		$("#display #line_deplete").css({"width":String(100-(100*(this.count.sec+(this.count.min*60))/(this.count.total*60)))+"%"});
	}
});

var InputView = Backbone.View.extend({
	el : "#input",
	initialize : function(){
		$("#input input").focus();
	},
	events : {
		"click #start" : "click_start",
		"click #pause" : "click_pause",
		"click #stop" : "click_stop",
		"keydown :input" : "key_down",
		"keyup :input" : "key_up"
	},
	click_start : function(e){
		this.options.parent.display.start_timer(e);
	},
	click_pause : function(e){
		this.options.parent.display.pause_timer(e);
	},
	click_stop : function(e){
		this.options.parent.display.stop_timer(e);
	},
	key_down : function(e){
		//clear user message on keypress 
		this.options.parent.msg_display("");
		
		//enter key pressed
		if (e.keyCode === 13){
			this.enter_control(e);
		//up or down key pressed
		}else if(e.keyCode === 38 || e.keyCode === 40){
			this.arrow_control(e);
                //hotkey to start
		}else if(e.keyCode === 83){
                        this.click_start();
                //hotkey for pause
		}else if(e.keyCode === 80){
                        this.click_pause();
                //hotkey for stop
		}else if(e.keyCode === 84){
                        this.click_stop();
                }
	},
	key_up : function(e){
		this.change_input(e);
	},
	change_input : function(e){
		this.options.parent.settings.set({time:parseInt($("#input input").val())});
		this.options.parent.settings.save();
	},
	enter_control : function(e){
		if($("#input input").is(":focus")){
			this.options.parent.display.start_timer(e);
		}
	},
	arrow_control : function(e){
		//up key pressed
		if(e.keyCode === 38){
			var cur = parseInt($("#input input").val());
			$("#input input").val(cur++);
		//down key pressed
		}else if(e.keyCode === 40){
			var cur = parseInt($("#input input").val());
			$("#input input").val(cur--);
		}
	}
});

//site initialization
var dtimer = dtimer || {
	init: function(){
		_.templateSettings = {interpolate : /\{\{(.+?)\}\}/g};
		this.timerview = new MainTimerView();
  	}
};

dtimer.init();
Backbone.history.start();

//head end 
});
 
// load scripts by assigning a label for them
head.js(
	{jquery: "http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"},
	{jqueryui: "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"},
	{underscore: "assets/js/lib/underscore.min.js"},
	{backbone: "assets/js/lib/backbone.min.js"},
	{backbone: "assets/js/lib/backbone.localstorage.min.js"}
);
