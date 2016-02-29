var express = require('express');
var fs = require('fs');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
__dirname = path.resolve(path.dirname());

app.use("/css",  express.static(__dirname + '/public/css'));
app.use("/js", express.static(__dirname + '/public/js'));
app.use("/frameworks", express.static(__dirname + '/public/frameworks'));

server.listen(5500);

io.sockets.on('connection', function (socket) {
    console.log('connected to client');
    socket.emit('connected');

    socket.on('read_request', function (data) {
        var info = f_read_sync(data);
        io.sockets.emit('read_request',info);
    });
    socket.on('write_request', function (data) {
        var writer =  JSON.parse(data);
        var splitter = writer.path.split('/');
        var total = '';

            for(var i=0;i<splitter.length;i++){
                if(i>0){
                    total+='/'
                }
                total+=splitter[i];
                console.log(total);
                if (total.indexOf('.')>-1){
                    f_write_sync(total,writer.content);
                }else{
                    fs.mkdir(total,function(error) {
                        console.log(error);
                    });
                }
            }

            io.sockets.emit('message','write done');
    });
    socket.on('f_readdir',function(data){
        socket.emit('f_readdir',f_readdir(data));
    });
    socket.on('f_framework',function(){
        socket.emit('f_framework',f_readdir('./frameworks/front_end'))
    })
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});


function f_read_sync(file){
   return fs.readFileSync('./'+file,'utf-8');
}

function f_write_sync(file, content){
    return fs.writeFile('./'+file,content,function(err){
        console.log(err)
    });
}

function f_readdir(v_path){
    return fs.readdirSync('./'+v_path);
}



