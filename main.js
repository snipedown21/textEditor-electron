const electron = require('electron');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, dialog, Menu } = electron;
let win;
let filepath = undefined;

app.on('ready', () => {
   win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.loadFile('index.html');

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

ipcMain.on('SAVE_TEXT', (event, text) => {
  if(filepath === undefined) {
    dialog.showSaveDialog(win, { defaultPath: 'filename.txt' }, (fullpath) => {
      if(fullpath) {
        filepath = fullpath;
        writeToFile(text);
      }
    });
  }
  else {
    writeToFile(text);
  }
});

function writeToFile(data) {
  fs.writeFile(filepath, data, (err) => {
    if(err) {
      console.log('There was an error:' + err);
    }
    console.log('File has been saved.');
    win.webContents.send('TEXT_SAVED', 'success');
  });
}


const menuTemplate = [
  ...(process.platform === 'darwin' ? [{
    label: app.getName(),
    submenu: [
      { role: 'about' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click() {
          win.webContents.send('SAVE_MENU_CLICKED');
        }
      },
      {
        label: 'Save As',
        accelerator: 'CmdOrCtrl+Shift+S',
        click() {
          filepath = undefined;
          win.webContents.send('SAVE_MENU_CLICKED');
        }
      }
    ]
  },
  { role: 'editMenu' },
  { role: 'viewMenu' }
];
