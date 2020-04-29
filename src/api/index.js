// const express = require('express');
const app = require('express')();
const fs = require('fs');
// const cors = require('cors');
const config = require('./apiConfig');

// app.use(cors());
// app.use(express.json());

app.listen(config.port, () => {
  console.log('listening on port: 3000');
});

app.get('/resource', (req, res) => {
  console.log('new request --> header:', req.headers);
  const path = JSON.parse(fs.readFileSync('./src/api/apiConfig.json')).path;
  // const stat = fs.statSync(path);
  // const fileSize = stat.size;
  let middleBuffer = Buffer.alloc(0);
  const file = fs.createReadStream(path);

  file.on('data', (chunk) => {
    console.log('file data:', chunk.length);
    middleBuffer = Buffer.concat([middleBuffer, chunk]);
    // file.push(chunk);
    // res.write(chunk);
  });

  file.on('end', () => {
    console.log(middleBuffer.length);
    for (let i = 0; i < middleBuffer.length; i++) {
      setTimeout(()=>{
        if (i%500==0){
          console.log('serving 500:', i);
        }
        res.write(Buffer.from([middleBuffer[i]]));
      }, 5*i);
    }
  });

  // const head = {
  //   'Content-Length': fileSize,
  //   'Content-Type': 'audio/*'
  // };
  // res.writeHead(200, head);

  file.on('end', () => {
    console.log('______No more data.______');
  });
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