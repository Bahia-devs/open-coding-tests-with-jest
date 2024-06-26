import {randomUUID} from "node:crypto"
import * as fs from "node:fs/promises"
import {env} from "../env"
import { resolve } from "node:path"

const databasePath = resolve(__dirname, `./${env.DATABASE_FILE}`)

export class Database{
  #database = {}

  constructor(){
    // Updating local database
    fs.readFile(databasePath, "utf8").then(data=>{
      this.#database = JSON.parse(data)
    }).catch(()=>{
      this.#persist()
    })
  }

  #fetch = async ()=>{
    try{
      // Updating local database
      const data = await fs.readFile(databasePath, "utf8")
      this.#database = JSON.parse(data)
    }catch(e){
      this.#database = {}
      this.#persist()
      
    }
  }

  async #persist(){
    // persisting local database to file
    await fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2))
  }

  /**
   * Function to insert data to database table
   */
  insert = async (table, data)=>{
    await this.#fetch()
    // Creating task
    const task = {
      id: randomUUID(),
      title: data.title,
      a: data.a,
      b: data.b,
      operation: data.operation,
      created_at: new Date(),
      updated_at: new Date()
    }

    // Persisting task
    if(Array.isArray(this.#database[table])){
      this.#database[table].push(task)
    }else{
      this.#database[table] = [task]
    }
    await this.#persist()

    return task
  }

  /**
   * Function to update a registry on database
   */
  update = async (table, id, data)=>{
    await this.#fetch()
    if(!this.#database[table]){
      throw new Error("Invalid table")
    }

    // Selecting task from database
    let task = this.#database[table].find(task=>{
      return task.id === id
    })
    if(!task) {
      throw new Error("Task not found")
    }

    // Updating task
    task.title = data.title ?? task.title, 
    task.description = data.description ?? task.description,
    task.completed_at = data.completed_at ?? task.completed_at,
    task.updated_at = new Date(),
    

    // Persisting updates
    await this.#persist()
  }

  /**
   * Function to select data from database table
   */
  select = async (table, where)=>{
    await this.#fetch()
    if(!this.#database[table]){
      throw new Error("Invalid table")
    }
    
    if(where && where.id){
      const task = this.#database[table].filter(task=>{
        return task.id === where.id
      })

      if(!task) return null

      return task
    }

    return this.#database[table]
  }
}