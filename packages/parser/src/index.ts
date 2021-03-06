// const fs = require('fs')
// const path = require('path')
// import pfData = require('./getPFParseData')
import fs from 'fs'
import path from 'path'
import {getData} from './getPFParseData'

let args = process.argv
console.log(args)

getData()
    .then(({players, teams, games}) => {
        console.log(`creating data files`)
        fs.writeFile(path.join(__dirname, '../public/players.json'), JSON.stringify(players), (error) => {
            if(error) console.log(`there was an error writing to file: ${error}`)
        })

        fs.writeFile(path.join(__dirname, '../public/teams.json'), JSON.stringify(teams), (error) => {
            if(error) console.log(`there was an error writing to file: ${error}`)
        })

        fs.writeFile(path.join(__dirname, '../public/games.json'), JSON.stringify(games), (error) => {
            if(error) console.log(`there was an error writing to file: ${error}`)
        })
    })
    .catch(error => 
        console.log(`There was an error: ${error}`)
    )