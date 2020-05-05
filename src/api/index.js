const express = require('express');
const app = require('express')();
const fs = require('fs');
const cors = require('cors');
const config = require('./apiConfig');

app.use(cors());
app.use(express.json());

var simulateLatency = require('express-simulate-latency');
// use as middleware for all subsequent handlers...
var smallLag = simulateLatency({min: 100, max: 500});
app.use(smallLag);
// ...or use as middleware for a specific route
var bigLag = simulateLatency({min: 10000, max: 10000});

let logs = '';
let logsPath = './streamingLogs.txt';


app.listen(config.port, () => {
  console.log('listening on port: 3000');
});

function saveLog(log) {
  fs.writeFileSync(logsPath, logs += '\n[' + getDate() + '] ' + log, {flag: 'w+'});
}

function resetLog() {
  fs.writeFileSync(logsPath, '', {flag: 'w+'});
}

function getDate() {
  const date = new Date();
  return date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear() + ' - '
    + date.getHours() + ':' + date.getMinutes() + ':' + date.getMilliseconds();
}

function printHeaders(header) {
  for (const key in header) {
    saveLog(key + ':    ' + (typeof header[key] === 'json' ? JSON.stringify(header[key]) : header[key]));
  }
}

app.get('/logPath', (req, res) => {
  res.send(logsPath);
});

app.get('/resource', bigLag, (req, res) => {
  saveLog('*****New Request From ****');
  const path = JSON.parse(fs.readFileSync('./src/api/apiConfig.json')).path;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  console.log(req.method);
  saveLog('req.method' + req.method);

  printHeaders(req.headers);

  saveLog('stat:' + JSON.stringify(stat));
  saveLog('fileSize:' + fileSize);
  saveLog('range:' + JSON.stringify(range));

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(path, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/*'
    };
    saveLog('parts:' + parts);
    saveLog('start:' + start);
    saveLog('end:' + end);
    saveLog('chunkSize:' + chunkSize);
    saveLog('Head: ' + JSON.stringify(head));
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/*'
    };
    res.writeHead(200, head);
    saveLog('Head: ' + JSON.stringify(head));
    fs.createReadStream(path).pipe(res);
  }
});

app.get('/path', (req, res) => {
  const config = fs.readFileSync('./src/api/apiConfig.json');
  res.json(JSON.parse(config).path);
});

app.post('/clearLogs', (req, res) => {
  resetLog();
  res.send('');
});

app.post('/path', (req, res) => {
  config.path = req.body.path;
  fs.writeFileSync('./src/api/apiConfig.json', JSON.stringify(config));
  res.send(config.path);
});

app.post('/logPath', (req, res) => {
  config.logPath = req.body.path;
  fs.writeFileSync('./src/api/apiConfig.json', JSON.stringify(config));
  res.send(config.path);
});