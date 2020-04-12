// Libraries
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var dataUtil = require("./data-util")
var moment = require("moment")
var _ = require("underscore");

dataUtil.restoreOriginalData();

// Global
var app = express();
var _DATA = dataUtil.loadData().discourse;

// Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main', partialsDir: "views/partials/" }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

// END POINTS
app.get('/', function(req,res) {
    res.render('home', {
	"data": _DATA,
	"sort": false
    });
});

app.get('/api', function(req, res) {
    res.json(_DATA);
});

app.get('/question', function(req, res) {
    var id = _DATA.length - req.query.id;
    
    if(id == NaN || id < 0 || id >=_DATA.length) {
	return res.render("error", {"message": "404 ERROR: PAGE NOT FOUND"});
    }
    
    res.render('question', {
	"id": id,
	"data": _DATA[id]
    });
});

app.get('/api/question', function(req, res) {
    var id = _DATA.length - req.query.id;
    
    if(id == NaN || id < 0 || id >= _DATA.length) {
	return res.render("error", {"message": "404 ERROR: PAGE NOT FOUND"});
    }
    
    res.json(_DATA[id]);
});

app.put('/question', function(req, res) {
    var i = req.body.id;
        
    _DATA[i]["views"] = req.body.views ? req.body.views : _DATA[i]["views"];
    _DATA[i]["agree"] = req.body.agree ? req.body.agree : _DATA[i]["agree"];
    _DATA[i]["disagree"] = req.body.disagree ? req.body.disagree : _DATA[i]["disagree"];
    
    dataUtil.saveData(_DATA);
    
    res.send('OK');
});

app.post('/argue', function(req, res) {
    var i = req.body.qId;
    var o = req.body.opinion;
    var p = req.body.pos;
    
    p == "pro" ? _DATA[i]["pro"].push(o) : _DATA[i]["con"].push(o);
    
    dataUtil.saveData(_DATA);
    
    res.redirect('/question?id=' + _DATA[i]["id"]);
});

app.get('/create', function(req, res) {
    res.render("create");
});

app.post('/create', function(req, res) {
    var new_question = {};
    
    if(_.findWhere(_DATA, {"question": req.body.question.trim()}) != null) {
	return res.render("error", {"message": "400 ERROR: QUESTION ALREADY EXISTS"});
    }
    
    new_question["question"] = req.body.question.trim();
    new_question["id"] = _DATA[0]["id"] + 1
    new_question["created"] = moment().format('MMMM Do YYYY, h:mm a');
    new_question["views"] = new_question["agree"] = new_question["disagree"] = 0;
    new_question["pro"] = [];
    new_question["con"] = [];
    
    _DATA.unshift(new_question);
    dataUtil.saveData(_DATA);
    
    res.redirect("/");
});

app.get("/sort/:order/name", function(req, res) {
    var by = _.sortBy(_DATA, 'question');
    
    res.render("home", {
	"data": req.params.order == 'a' ? by : by.reverse(),
	"sort": true,
	"url": req.params.order == 'd' ? "/sort/a/name" : "/sort/d/name"
    });
});

app.get("/sort/:order/views", function(req, res) {
    var by = _.sortBy(_DATA, 'views');
    
    res.render("home", {
	"data": req.params.order == 'a' ? by : by.reverse(),
	"sort": true,
	"url": req.params.order == 'd' ? "/sort/a/views" : "/sort/d/views"
    });
});

app.get("/sort/:order/agree", function(req, res) {
    var by = _.sortBy(_DATA, 'agree');
    
    res.render("home", {
	"data": req.params.order == 'a' ? by : by.reverse(),
	"sort": true,
	"url": req.params.order == 'd' ? "/sort/a/agree" : "/sort/d/agree"
    });
});

app.get("/sort/:order/disagree", function(req, res) {
    var by = _.sortBy(_DATA, 'disagree');
    
    res.render("home", {
	"data": req.params.order == 'a' ? by : by.reverse(),
	"sort": true,
	"url": req.params.order == 'd' ? "/sort/a/disagree" : "/sort/d/disagree"
    });
});

app.get("/sort/:order/controversial", function(req, res) {
    var by = _.sortBy(_DATA, function(o) {
	return (o.agree - o.disagree) * (o.disagree - o.agree);
    });
    
    res.render("home", {
	"data": req.params.order == 'a' ? by : by.reverse(),
	"sort": true,
	"url": req.params.order == 'd' ? "/sort/a/controversial" : "/sort/d/controversial"
    });
});

app.get("/pics/:img", function(req, res) {
    res.sendFile("public/pics/" + req.params.img, { root: __dirname });
})

app.get("*", function(req, res) {
    res.render("error", {"message": "404 ERROR: PAGE NOT FOUND"});
})

app.listen(3000, function() {
    console.log('Listening on port 3000!');
});
