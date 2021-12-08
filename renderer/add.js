const { ipcRenderer } = require('electron')
const { $ } = require('./helper')
const path = require('path')  //nodejs的api

let musicFilesPath = []

$('selectBtn').addEventListener('click', () => {
  ipcRenderer.send('open-music-file', '111')
})

$('addMusic').addEventListener('click', () => {
  ipcRenderer.send('addMusic', musicFilesPath)
})

const renderListHTML = (musicPath) => {
  const musicList = $('musicList')
  const musicItemsHTML = musicPath.reduce((html, music) => {
    html += `<li class="list-group-item">${path.basename(music)}</li>`
    return html
  }, '')
  musicList.innerHTML = `<ul class="list-group">${musicItemsHTML}</ul>`
}

ipcRenderer.on('selected-file', (event, musicPath) => {
  if(Array.isArray(musicPath)) {
    renderListHTML(musicPath)
    musicFilesPath = musicPath
  }
})
