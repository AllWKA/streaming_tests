<template>
  <div id="app">
    <p>server: http://localhost:3000</p>
    <p>file: {{filePath}}</p>
    <v-btn small @click="selectFile">select file</v-btn>
    <video id="videoPlayer" controls v-if="playerIsShown">
      <source :src="'http://localhost:3000/resource'" type="video/mp4">
    </video>
    <v-btn @click="togglePlayer">toggle player</v-btn>
    <div class="logs-container">
      <p v-for="(log,i) in logs" :key="i">{{log}}</p>
    </div>
    <button @click="clearLogs">clear logs</button>
  </div>
</template>

<script>
const dialog = require('electron').remote.dialog;
const axios = require('axios');
const {watchFile, readFileSync} = require('fs');
export default {
  name: 'App',
  components: {},
  data() {
    return {
      filePath: '',
      serverPort: 0,
      playerIsShown: false,
      logs: 'no data'
    };
  },
  methods: {
    selectFile() {
      dialog.showOpenDialog({properties: ['openFile']}).then(path => {
        this.filePath = path.filePaths[0];
        axios.post('http://localhost:3000/path', {path: path.filePaths[0]});
      });
    },
    togglePlayer() {
      this.playerIsShown = !this.playerIsShown;
    },
    clearLogs() {
      axios.post('http://localhost:3000/clearLogs');
    }
  },
  mounted() {
    axios.get('http://localhost:3000/path').then(path => this.filePath = path.data);
    this.logs = readFileSync('./streamingLogs.txt').toString().split('\n');
    watchFile('./streamingLogs.txt', async() => {
      this.logs = readFileSync('./streamingLogs.txt').toString().split('\n');
    });
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.logs-container {
  text-align: left;
  height: 50vh;
  width: 100%;
  overflow: auto;
  border: 3px solid black;
}
</style>
