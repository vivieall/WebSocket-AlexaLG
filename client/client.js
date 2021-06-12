// wss://socket-alexa-lg.herokuapp.com
const connection = new WebSocket('ws://localhost:8080'),
box = document.getElementById('box'),
msg = document.getElementById('msg');

connection.addEventListener('open', () => {
console.log('connected');
});

connection.addEventListener('message', e => {
let p = document.createElement('p');
let content = JSON.parse(JSON.parse(e.data));
p.textContent = content;
console.log(JSON.parse(e.data));
box.appendChild(p);
});

function send (data) {
if (connection.readyState === WebSocket.OPEN) {
    connection.send(data);
} else {
    throw 'Not connected';
}
}

msg.addEventListener('keydown', e => {
let kc = e.which || e.keyCode;

if (kc === 13) {
    send(msg.value);
    msg.value = '';
}
});