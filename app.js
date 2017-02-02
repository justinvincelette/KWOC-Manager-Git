var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.get('/data', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/content/data.json'));
})

app.get('/:type/:fileName', function(req, res) {
  var type = req.params.type;
  var fileName = req.params.fileName;
  res.sendFile(path.join(__dirname, '/public/content/' + type + '/' + fileName));
})

app.post('/save', function(req, res) {
  // Password removed for security reasons
  if (req.body.password === "xxxxxxxx") {
    var filePath = path.join(__dirname, '/public/content/data.json');
    fs.writeFile(filePath, JSON.stringify(req.body.content), 'utf8', function(err) {
      if (err) {
        res.status(500).send("Could not save at this time");
      }
      res.send("Saved successfully");
    });
  } else {
    res.status(401).send("Incorrect password");
  }
});

app.post('/upload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = path.join(__dirname, '/public/content/' + req.headers.type);
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });
  form.on('end', function() {
    res.end('success');
  });
  form.parse(req);
});

var server = app.listen(process.env.PORT || 5000);