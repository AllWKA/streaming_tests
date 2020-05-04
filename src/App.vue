<template>
  <div id="app">
    <p>server: http://localhost:3000</p>
    <p>file: {{filePath}}</p>
    <v-btn small @click="selectFile">select file</v-btn>
    <video id="videoPlayer" controls v-if="playerIsShown">
      <source :src="'http://localhost:3000/resource'" type="video/mp4">
    </video>
    <v-btn @click="togglePlayer">toggle player</v-btn>
  </div>
</template>

<script>
const dialog = require('electron').remote.dialog;
const axios = require('axios');
export default {
  name: 'App',
  components: {},
  data() {
    return {
      filePath: '',
      serverPort: 0,
      playerIsShown: false
    };
  },
  methods: {
    selectFile() {
      dialog.showOpenDialog({properties: ['openFile']}).then(path => {
        this.filePath = path.filePaths[0];
        axios.post('http://localhost:3000/path',{path:path.filePaths[0]})
      });
    },
    togglePlayer(){
      this.playerIsShown = !this.playerIsShown
    }
  },
  mounted() {
    axios.get('http://localhost:3000/path').then(path => this.filePath = path.data)
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
</style>
