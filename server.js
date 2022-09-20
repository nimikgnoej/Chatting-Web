//server.js

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    // 루트 페이지로 접속하면 chat.pug를 렌더링함
    res.render('chat');
});

var count = 1;
var userArr = []; //유저 정보 담을 빈 배열
io.on('connection', function (socket) { //입장했을때 이름 부여 및 알림 메세지 출력
    console.log('User Connected: ', socket.id);
    var name = "익명" + count++;
    userArr.push(name);
    socket.name = name;
    io.to(socket.id).emit('create name', name);

    //알림메세지 출력
    var alarm = '<알림> ' + name + ' 님이 채팅창에 접속했습니다.';
    io.emit('user login', alarm);

    socket.on('disconnect', function () {
        console.log('User Disconnected: ' + socket.id + ' ' + socket.name);
        var disconnect_alarm = '<알림> ' + socket.name + ' 님이 채팅방을 나갔습니다.';
        io.emit('user logout', disconnect_alarm);
        for (let i = 0; i < userArr.length; i++) {
            if (userArr[i] === socket.name) {
                userArr.splice(i, 1);
                i--;
            }
        }
    });

    socket.on('send message', function (name, text) {
        var msg = name + ' : ' + text;
        if (name != socket.name) {
            for (let i = 0; i < userArr.length; i++) {
                if (userArr[i] === socket.name) {
                    userArr.splice(i, 1, name);
                }
            }
            io.emit('change name', socket.name, name);
        }
        socket.name = name;
        console.log(msg);
        io.emit('receive message', msg);
    });

    socket.on('show user info', function () {
        io.to(socket.id).emit('user info ment');
        for (var i = 0; i < userArr.length; i++) {
            io.to(socket.id).emit('print user', userArr[i]);
        }
    })
});

http.listen(3000, function () {
    console.log('server on..');
});