import { aiChatT } from '..';

export class IndexedDBUtil {
  // 数据库版本
  static version: number = 1;

  // 数据库连接句柄
  static db: IDBDatabase | null = null;

  // 上一个连接
  static lastLink: IDBDatabase;

  /**
   * 检查数据库是否存在
   *
   * @param {string} storeName
   * @return {*}  {Promise<boolean>}
   * @memberof IndexedDBUtil
   */
  static async checkDataBaseExists(storeName: string): Promise<boolean> {
    try {
      const databases = await indexedDB.databases();
      return databases.some(db => db.name === storeName);
    } catch (error) {
      console.error(aiChatT('databaseCheckFailed'), error);
      return false;
    }
  }

  /**
   * 删除数据库
   *
   * @return {*}  {Promise<void>}
   * @memberof IndexedDBUtil
   */
  static async deleteDatabase(storeName: string): Promise<boolean> {
    if (IndexedDBUtil.lastLink) {
      IndexedDBUtil.lastLink.close?.();
    }
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(storeName);

      deleteRequest.onsuccess = () => {
        resolve(true);
      };

      deleteRequest.onerror = () => {
        resolve(false);
      };

      deleteRequest.onblocked = () => {
        console.warn(aiChatT('databaseDeleteBlocked', { storeName }));

        // 这里可以添加更复杂的处理逻辑
        reject(new Error(aiChatT('databaseDeleteFailed', { storeName })));
      };
    });
  }

  /**
   * 检查是否存在某个库以及库内是否存在某个表
   *
   * @param {string} storeName
   * @param {string} tableName
   * @return {*}
   * @memberof IndexedDBUtil
   */
  static async checkTableExists(
    storeName: string,
    tableName: string,
  ): Promise<boolean> {
    const storeExists = await IndexedDBUtil.checkDataBaseExists(storeName);
    if (!storeExists) {
      return false;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(storeName);
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.version = IndexedDBUtil.db.version;
      };

      request.onsuccess = event => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.lastLink = request.result;
        const tableExists =
          IndexedDBUtil.db.objectStoreNames.contains(tableName);
        request.result.close();
        resolve(tableExists);
      };

      request.onerror = event => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  /**
   * 创建表
   *
   * @param {string} storeName 库名称
   * @param {(string | null)} keyPath 表主键
   * @param {boolean} [useAutoIncrement=false] 是否使用自增
   * @return {*}  {Promise<void>}
   * @memberof IndexedDBUtil
   */
  static async createTable(
    storeName: string,
    tableName: string,
    keyPath: string | null,
    useAutoIncrement: boolean = false,
  ): Promise<boolean> {
    // 动态创建表时，需要改变数据库版本触发onupgradeneeded事件才能改变
    return new Promise(resolve => {
      IndexedDBUtil.version += 1; // 更新本地记录的版本号
      if (IndexedDBUtil.lastLink) {
        // 新建表时先关闭上一个连接
        IndexedDBUtil.lastLink.close?.();
      }
      const upgradeRequest = indexedDB.open(storeName, IndexedDBUtil.version);
      upgradeRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        if (!IndexedDBUtil.db.objectStoreNames.contains(tableName)) {
          const options: IDBObjectStoreParameters = {};
          if (keyPath) {
            options.keyPath = keyPath;
          } else if (useAutoIncrement) {
            options.autoIncrement = true;
          }
          IndexedDBUtil.db.createObjectStore(tableName, options);
        }
      };

      upgradeRequest.onsuccess = () => {
        IndexedDBUtil.lastLink = upgradeRequest.result;
        upgradeRequest.result.close();
        resolve(true);
      };

      upgradeRequest.onerror = () => {
        resolve(false);
      };
    });
  }

  /**
   * 删除表
   *
   * @param {string} storeName 表名称
   * @return {*}  {Promise<void>}
   * @memberof IndexedDBUtil
   */
  static async deleteTable(
    storeName: string,
    tableName: string,
  ): Promise<boolean> {
    return new Promise(resolve => {
      IndexedDBUtil.version += 1; // 更新本地记录的版本号
      if (IndexedDBUtil.lastLink) {
        // 新建表时先关闭上一个连接
        IndexedDBUtil.lastLink.close?.();
      }
      const request = indexedDB.open(storeName, IndexedDBUtil.version);
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.lastLink = request.result;
        if (IndexedDBUtil.db.objectStoreNames.contains(tableName)) {
          IndexedDBUtil.db.deleteObjectStore(tableName);
        }
      };
      request.onsuccess = event => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.lastLink = request.result;
        request.result.close();
        resolve(true);
      };
      request.onerror = () => {
        request.result.close();
        resolve(false);
      };
    });
  }

  /**
   * 新增数据
   *
   * @param {string} storeName 表名称
   * @param {*} data 新增数据
   * @return {*}  {Promise<void>}
   * @memberof IndexedDBUtil
   */
  static async addData(
    storeName: string,
    tableName: string,
    data: object,
  ): Promise<object | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(storeName);
      request.onsuccess = event => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.lastLink = request.result;
        if (IndexedDBUtil.db.objectStoreNames.contains(tableName)) {
          const transaction = IndexedDBUtil.db.transaction(
            [tableName],
            'readwrite',
          );
          const objectStore = transaction.objectStore(tableName);
          const res = objectStore.add(data);

          res.onsuccess = (_res: object) => {
            resolve(data);
          };

          res.onerror = () => {
            resolve(null);
          };
        }
        request.result.close();
      };
      request.onerror = () => {
        request.result.close();
        reject();
      };
    });
  }

  /**
   * 删除数据
   *
   * @param {string} storeName 表名称
   * @param {IDBValidKey} key 数据键
   * @return {*}  {Promise<void>}
   * @memberof IndexedDBUtil
   */
  static async deleteData(
    storeName: string,
    tableName: string,
    key: IDBValidKey,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(storeName);
      request.onsuccess = event => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.lastLink = request.result;
        if (IndexedDBUtil.db.objectStoreNames.contains(tableName)) {
          const transaction = IndexedDBUtil.db.transaction(
            [tableName],
            'readwrite',
          );
          const objectStore = transaction.objectStore(tableName);
          const res = objectStore.delete(key);

          res.onsuccess = (_res: object) => {
            resolve(true);
          };

          res.onerror = () => {
            resolve(false);
          };
        }
        request.result.close();
      };
      request.onerror = () => {
        request.result.close();
        reject();
      };
    });
  }

  /**
   * 修改数据
   *
   * @param {string} storeName 表名称
   * @param {*} data 需要修改的数据
   * @return {*}  {Promise<void>}
   * @memberof IndexedDBUtil
   */
  static async updateData(
    storeName: string,
    tableName: string,
    data: object,
  ): Promise<object> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(storeName);
      request.onsuccess = event => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.lastLink = request.result;
        if (IndexedDBUtil.db.objectStoreNames.contains(tableName)) {
          const transaction = IndexedDBUtil.db.transaction(
            [tableName],
            'readwrite',
          );
          const objectStore = transaction.objectStore(tableName);
          const res = objectStore.put(data);

          res.onsuccess = (_res: object) => {
            resolve(data);
          };

          res.onerror = () => {
            resolve(data);
          };
        }
        request.result.close();
      };
      request.onerror = () => {
        request.result.close();
        reject();
      };
    });
  }

  /**
   * 读取单条数据
   *
   * @param {string} storeName 表名称
   * @param {IDBValidKey} key 数据主键
   * @return {*}  {Promise<any>}
   * @memberof IndexedDBUtil
   */
  static async getData(
    storeName: string,
    tableName: string,
    key: IDBValidKey,
  ): Promise<object> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(storeName);
      request.onsuccess = event => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.lastLink = request.result;
        if (IndexedDBUtil.db.objectStoreNames.contains(tableName)) {
          const transaction = IndexedDBUtil.db.transaction(
            [tableName],
            'readonly',
          );
          const objectStore = transaction.objectStore(tableName);
          const res = objectStore.get(key);

          res.onsuccess = (_res: object) => {
            resolve(res.result);
          };

          res.onerror = () => {
            reject(new Error(aiChatT('dataNotFound', { key })));
          };
        }
        request.result.close();
      };
      request.onerror = () => {
        request.result.close();
        reject();
      };
    });
  }

  /**
   * 读取所有数据
   *
   * @param {string} storeName 表名称
   * @return {*}  {Promise<any[]>}
   * @memberof IndexedDBUtil
   */
  static async getAllData(
    storeName: string,
    tableName: string,
  ): Promise<object[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(storeName);
      request.onsuccess = event => {
        IndexedDBUtil.db = (event.target as IDBOpenDBRequest).result;
        IndexedDBUtil.lastLink = request.result;
        if (IndexedDBUtil.db.objectStoreNames.contains(tableName)) {
          const transaction = IndexedDBUtil.db.transaction(
            [tableName],
            'readonly',
          );
          const objectStore = transaction.objectStore(tableName);
          const res = objectStore.getAll();

          res.onsuccess = (_res: object) => {
            resolve(res.result);
          };

          res.onerror = () => {
            resolve([]);
          };
        }
        request.result.close();
      };
      request.onerror = () => {
        request.result.close();
        reject();
      };
    });
  }
}
