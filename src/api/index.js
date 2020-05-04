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

app.listen(config.port, () => {
  console.log('listening on port: 3000');
});

app.get('/resource', bigLag, (req, res) => {
  console.log('new request');
  const path = JSON.parse(fs.readFileSync('./src/api/apiConfig.json')).path;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

  console.log('range:', range);

  if (range) {
    console.log('there is range');
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
    console.log('head:', head);
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    console.log('no range');
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(200, head);
    console.log('head:', head);
    fs.createReadStream(path).pipe(res);
  }
});

app.get('/path', (req, res) => {
  const config = fs.readFileSync('./src/api/apiConfig.json');
  res.json(JSON.parse(config).path);
});

app.post('/path', (req, res) => {
  config.path = req.body.path;
  fs.writeFileSync('./src/api/apiConfig.json', JSON.stringify(config));
  res.send('saludos');
});