import customOpenDatabase from "websql/custom";
import SQLiteDatabase from "./SQLiteDatabase";

var openDB = customOpenDatabase(SQLiteDatabase);

function SQLitePlugin() {}

/**
 This function provides direct execution of SQL statements without requiring
 the use of the WebSQL transaction interface.  One use of this function is in 
 queries that update PRAGMA values, i.e. 'PRAGMA user_version=<new version>'.

 Parameters:
 query - string containing the query to be executed.
 args - array of arguments.  Use empty array if the query has no arguments
 readOnly - true or false depending on whether the query is read only or will update information in the database
 */
function executeSql(query, args, readOnly) {
  const db = this._db;

  return new Promise(function (resolve, reject) {
    function callback(error, results) {
      if (error !== null) reject(error);
      resolve(results);
    }
    db.exec([{ sql: query, args: args }], readOnly, callback);
  });
}

function openDatabase(name, version, description, size, callback) {
  if (name && typeof name === "object") {
    // accept SQLite Plugin 1-style object here
    callback = version;
    size = name.size;
    description = name.description;
    version = name.version;
    name = name.name;
  }
  if (!size) {
    size = 1;
  }
  if (!description) {
    description = name;
  }
  if (!version) {
    version = "1.0";
  }
  if (typeof name === "undefined") {
    throw new Error('please be sure to call: openDatabase("myname.db")');
  }

  const db = openDB(name, version, description, size, callback);

  db.executeSql = executeSql.bind(db);
  return db;
}

SQLitePlugin.prototype.openDatabase = openDatabase;

export default new SQLitePlugin();
