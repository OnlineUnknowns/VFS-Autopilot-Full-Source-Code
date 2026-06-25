declare module 'tauri-plugin-store-api' {
  export class Store {
    constructor(path: string);
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any>;
    save(): Promise<void>;
  }
}
