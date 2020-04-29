// const express = require('express');
const app = require('express')();
const fs = require('fs');
// const cors = require('cors');
const config = require('./apiConfig');

const {Readable} = require('stream');
const util = require('util');

// app.use(cors());
// app.use(express.json());

const MyStream = function(options) {
  Readable.call(this, options);
  this.counter = 1000;
};

util.inherits(MyStream, Readable);

MyStream.prototype._read = function(n) {
  this.push('foobar');
  if (this.counter-- === 0) {
    this.push(null);
  }
};

app.listen(config.port, () => {
  console.log('listening on port: 3000');
});

app.get('/resource', (req, res) => {
  console.log('ask for new resource');
  const path = JSON.parse(fs.readFileSync('./src/api/apiConfig.json')).path;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const file = fs.createReadStream(path);

  const head = {
    'Content-Length': fileSize,
    'Content-Type': 'audio/*'
  };
  res.writeHead(200, head);
  let chunksSend = 0;
  // let raw_data = Buffer.alloc(0);

  // file._read = () => {};

  file.on('data', (chunk) => {
    const id = chunksSend++;
    console.log('There will be no additional data for ' + (500 * id) + ' second for:', id);
    // if (id<15){
      setTimeout(() => {
        console.log('resume for:', id);
        res.write(chunk);
      }, 2000 * id);
    // }
  });

  file.on('end', () => {
    console.log('______There will be no more data.______');
  });

  // file.read();
  // file.on('readable', () => {
  //   chunksSend++;
  //   // file.pause();
  //   console.log('There will be no additional data for ' + (500 * chunksSend) + ' second for:', chunksSend);
  //   setTimeout(() => {
  //     console.log('resume for:', chunksSend);
  //     // file.resume();
  //     file.read();
  //   }, 500 * chunksSend);
  // });

  // file.pipe(res);

  // if (range) {
  //   const parts = range.replace(/bytes=/, '').split('-');
  //   const start = parseInt(parts[0], 10);
  //   const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  //   const chunkSize = (end - start) + 1;
  //   const file = fs.createReadStream(path, {start, end});
  //   const head = {
  //     'Content-Range': `bytes ${start}-${end}/${fileSize}`,
  //     'Accept-Ranges': 'bytes',
  //     'Content-Length': chunkSize,
  //     'Content-Type': 'video/mp4'
  //   };
  //   res.writeHead(206, head);
  //   file.pipe(res);
  // } else {
  //   const head = {
  //     'Content-Length': fileSize,
  //     'Content-Type': 'video/mp4'
  //   };
  //   res.writeHead(200, head);
  //   fs.createReadStream(path).pipe(res);
  // }
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