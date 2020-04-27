const express = require('express');
const app = require ('express')();
const fs = require('fs');
const cors = require('cors');
const config = require('./apiConfig');

app.use(cors());
app.use(express.json());

app.listen(config.port, ()=>{
  console.log('listening on port: 3000');
});

app.get('/resource', (req, res)=>{
  const path =  JSON.parse(fs.readFileSync('./src/api/apiConfig.json')).path;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;

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
      'Content-Type': 'video/mp4'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.get('/path', (req, res)=>{
  const config = fs.readFileSync('./src/api/apiConfig.json');
  res.json(JSON.parse(config).path)
});

app.post('/path',(req,res)=>{
  config.path = req.body.path;
  fs.writeFileSync('./src/api/apiConfig.json',JSON.stringify(config));
  res.send('saludos');
});