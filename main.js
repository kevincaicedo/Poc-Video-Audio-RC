// Modules to control application life and create native browser window
const { app, BrowserWindow, desktopCapturer, ipcMain, dialog } = require('electron')
const { writeFileSync } = require('fs')
const { recognizeWav } = require('./recognize');
const path = require('path')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const mainWindow = createWindow()

  // message from front-end App.js, request that this file be processed by DeepSpeech
  ipcMain.handle('recognize-wav', async function (event, file) {
    const filePath = path.resolve(__dirname, 'audios', "Untitled.wav");
    const results = await recognizeWav(filePath, model);
    if (results) checkDone(file, results);
    return results;
  });

  desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
    for (const source of sources) {
      console.log("Source Name", source.name);
      if (source.name === 'Screen 1') {
        mainWindow.webContents.send('SET_SOURCE', source.id)
        return
      }
    }
  })

  ipcMain.on('SAVE_VIDEO', (event, arg) => {
    const { fileName, base64 } = arg;
    console.log(fileName);
    const buffer = Buffer.from(base64, 'base64');

    dialog.showSaveDialog({
      buttonLabel: 'Save video',
      defaultPath: `vid-${Date.now()}.webm`
    }).then(({ filePath }) => {
      writeFileSync(filePath, buffer, () => console.log('video saved successfully!'));
    })
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
