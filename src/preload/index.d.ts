import { ElectronAPI } from "@electron-toolkit/preload";
import type { KiboApi } from "../shared/types";

declare global {
  interface Window {
    electron: ElectronAPI;
    kibo: KiboApi;
  }
}
