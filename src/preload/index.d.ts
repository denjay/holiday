import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onUpdate: (callback: (event) => void) => void
    }
  }
}
