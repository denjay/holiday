import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  screen,
  Menu,
  Tray,
  Notification,
  powerMonitor
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { default as AutoLaunch } from 'auto-launch'
import { attach, refresh } from 'electron-as-wallpaper'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 240,
    height: 240,
    x: width - 250,
    y: height - 250,
    alwaysOnTop: !app.isPackaged,
    resizable: false,
    show: false,
    frame: false,
    focusable: false,
    transparent: true,
    type: 'toolbar', // 不显示任务栏窗口
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    attach(mainWindow, {
      transparent: true,
      // forwardKeyboardInput: true,
      forwardMouseInput: true
    })
  })

  mainWindow.on('close', () => {
    console.log('close')
  })

  powerMonitor.on('resume', () => {
    mainWindow.webContents.send('update')
  })

  async function setContextMenu(tray: Tray) {
    const minecraftAutoLauncher = new AutoLaunch({ name: 'holiday' })
    const template = [
      {
        label: '刷新',
        click: () => {
          mainWindow.webContents.send('update')
        }
      },
      {
        label: '退出',
        click: () => {
          mainWindow.close()
        }
      }
    ]
    if (app.isPackaged) {
      const isEnabled: boolean = await minecraftAutoLauncher.isEnabled()
      if (isEnabled) {
        template.unshift({
          label: '取消开机启动',
          click: () => {
            minecraftAutoLauncher.disable()
            setContextMenu(tray)
          }
        })
      } else {
        template.unshift({
          label: '开机启动',
          click: () => {
            minecraftAutoLauncher.enable()
            setContextMenu(tray)
          }
        })
      }
    }
    const contextMenu = Menu.buildFromTemplate(template)
    tray.setContextMenu(contextMenu)
  }

  // 创建托盘图标
  const tray = new Tray(icon)
  tray.setToolTip('假期倒计时')
  setContextMenu(tray)
  tray.on('click', function () {
    if (Notification.isSupported() && globalThis.message) {
      new Notification({ title: '假期提醒', body: globalThis.message }).show()
    }
  })
  tray.on('right-click', function () {
    tray.popUpContextMenu()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('Holiday')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('message', (_, message) => {
    globalThis.message = message
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    refresh()
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
