const { ipcRenderer } = require('electron')
const { $ } = require('./helper')

const musicAudio = new Audio()
let allTracks
let currentTrack 

$('addBtn').addEventListener('click', () => {
  ipcRenderer.send('add-music-window', '111')
})

const renderListHtml = (tracks) => {
  const tracksList = $('tracksList')
  const tracksListHTML = tracks.reduce((html, track) => {
    html += `<li class="music-track list-group-item d-flex justify-content-between align-items-center"
              <div>${track.fileName}</div>
              <div>
                <button id="${track.id}" class="play" data-id="${track.id}">play</button>
                <button class="delete" data-id="${track.id}">delete</button>
              </div>
            </li>`
    return html
  }, '')
  const emptyTracksHTML = '<div class="alert alert-primary">还没有添加任何音乐</div>'
  tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTracksHTML
}

ipcRenderer.on('getTracks', (event, tracks) => {
  allTracks = tracks
  renderListHtml(tracks)
})

// 添加 播放事件
$('tracksList').addEventListener('click', (event) => {
  event.preventDefault()
  const { dataset, classList } = event.target
  const id = dataset && dataset.id
  if(id && classList.contains('play')) {
    //开始播放音乐
    if(currentTrack && currentTrack.id === id) {
      //继续播放音乐
      musicAudio.play()
    }else {
      //播放新的歌曲，还原之前的歌曲状态
      currentTrack = allTracks.find(track => track.id === id)
      musicAudio.src = currentTrack.path
      musicAudio.play()
      const resetStatus = document.querySelector('.playing')
      console.log('resetStatus',resetStatus)
      if(resetStatus) {
        resetStatus.classList.replace('playing', 'play')
        resetStatus.innerHTML = 'play'
      }
    }
    $(id).innerHTML = 'playing'
    classList.replace('play', 'playing')
  }else if(id && classList.contains('playing')) {
    //暂停
    musicAudio.pause()
    classList.replace('playing', 'play')
    $(id).innerHTML = 'play'
  }else if(id && classList.contains('delete')) {
    //删除
    ipcRenderer.send('delete-track', id)
  }
})