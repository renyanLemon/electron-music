const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const DataStore = require('./MusicDataStore')

const myStore = new DataStore({'name': 'Music Data'})

// 封装
class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const basicConfig = {
      width: 500,
      height: 400,
      webPreferences: {
        // nodeIntegration true 可以使用nodejs api
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        nodeIntegrationInSubFrames: true,
        // 如果想在渲染器中使用nodejs， 上面三个写成true， 下面一个写成false
        contextIsolation: false
      }
    }

    const finalConfig = { ...basicConfig, ...config }

    super(finalConfig)

    this.loadFile(fileLocation)
    
    this.once('ready-to-show', () => {
      this.show()
    })

  }
}

app.on('ready', () => {

  const mainWindow = new AppWindow({}, './renderer/index.html')

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.send('getTracks', myStore.getTracks())
  })

  ipcMain.on('add-music-window', (event, arg) => {
    const addWindow = new AppWindow({
      width: 400,
      height: 300,
      parent: mainWindow,
    }, './renderer/add.html')
  })

  ipcMain.on('open-music-file', (event, arg) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [{name: 'Music', extensions: ['mp3']}]
    }).then(result => {
      if(result.filePaths) {
        event.sender.send('selected-file', result.filePaths)
      }
    }).catch(err => {
      console.log(err)
    })
  })

  ipcMain.on('addMusic', (event, tracks) => {
    const updateTracks = myStore.addTracks(tracks).getTracks()
    mainWindow.send('getTracks', updateTracks)
  })

  ipcMain.on('delete-track', (event, id) => {
    const updateTracks = myStore.deleteTrack(id).getTracks()
    mainWindow.send('getTracks', updateTracks)
  })
 
})