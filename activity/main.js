
const electron = require('electron');
const ejs = require('ejs-electron');


const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

function createWindow()
{
    const win = new BrowserWindow({    
        width:800,
        height:600,
        webPreferences: {
            nodeIntegration : true,    
            enableRemoteModule : true
        }
    });
    
    //it loads the html file to run as a desktop app using electron
    win.loadFile("./index.ejs").then(function()   
    {
        win.maximize();      
    });   
    win.webContents.openDevTools();   
}

app.whenReady().then(createWindow);   

app.on('window-all-closed', () => {    
    if (process.platform !== 'darwin') 
    {
      app.quit()
    }
})

app.on('activate', () => {         
    if (BrowserWindow.getAllWindows().length === 0) 
    {
      createWindow()
    }
})
