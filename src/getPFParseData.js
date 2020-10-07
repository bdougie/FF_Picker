//import getCSVData from './getCSVData'
const fs = require('fs').promises;
const path = require('path')
const nicknames = require('./nicknames.json')

const playersFilename = 'pfW3bPlayers.csv'
const teamOffenseFilename = 'pfW3bTeamOffense.csv'
const teamDefenseFilename = 'pfW3bTeamDefense.csv'
const scheduleFilename = 'pfSchedule.csv'
const ignoreColumns = [];

const extractPlayerName = (cols, columns) => cols[columns['Player']].split('\\')[0]
const extractPlayerId = (cols, columns) => cols[columns['Player']].split('\\')[1]
const extractPositionColumns = (player, positionColumns, cols, columns) => {
    for (const outputColumn in positionColumns) {
        /**
         * This is probably some premature optimization but what I am doing
         * here is defining the columns to look for in qbCols 
         */
        let lookupColumn = positionColumns[outputColumn]
        let lookupIndex = columns[lookupColumn]
        player[outputColumn] = cols[lookupIndex]
    }0
    return player;
}
const qbCols = {
    'Completions': 'Cmp',
    'Attempts': 'Att',
    'Yards':'Yds',
    'Touchdowns': 'Td',
    'Int': 'Int'
}

const rbCols = {
    'Attempts': 'Att_1',
    'Yards': 'Yds_1',
    'Average': 'Y/A',
    'Touchdowns': 'TD_1'
}

const recieverCols = {
    'Targets':'Tgt',
    'Receptions': 'Rec',
    'Yards': 'Yds_2',
    'Average': 'Y/R',
    'Touchdowns': 'TD_2'
}

const parsePlayerData = (data) => {
    let lines = data.split('\n')
    let columns = {};
    let players = [];
    let matchups = {}
    let qbs = [];
    let rbs = [];
    let wrs = [];
    let tes = [];

    lines.map((line, index) => {
        // the first line contains the keys
        const cols = line.split(',')
        if(index < 1) {
            cols.map((col, colIndex) => {
                let tempColName = col
                let colNameCounter = 0

                /**  
                 * Because the name of a column can appear multiple times in the list of columns
                 * this logic will append a suffix to the column if it is already in the list of columns
                 * */ 
                while(columns[`${tempColName}`]) {
                    colNameCounter += 1
                    tempColName = `${tempColName.replace(`_${colNameCounter - 1}`, '')}_${colNameCounter}`             
                } 
                columns[tempColName ] = colIndex
            })
            // console.log(columns)
            return
        } else { 
            //use the columns to create an object for each player and push into array
            let player = {}
            // cols.map((col, index) => {
            //     if(ignoreColumns.includes(columns[index])) return
            //     //player[columns[index]] = col 
            //     player   
            // })

            let newPlayer = {}
            newPlayer['Name'] = extractPlayerName(cols, columns)
            newPlayer['Id'] = extractPlayerId(cols, columns)
            newPlayer['Position'] = cols[columns['FantPos']]
            newPlayer['FantasyPoints'] = cols[columns['FantPt']]

            if(newPlayer['Position'] === 'QB') {         
                // for (const outputColumn in qbCols) {
                //     /**
                //      * This is probably some premature optimization but what I am doing
                //      * here is defining the columns to look for in qbCols 
                //      */
                //     newPlayer[outputColumn] = cols[columns[qbCols[outputColumn]]]
                // }
                // qbs.push(newPlayer)
                qbs.push(
                    extractPositionColumns(newPlayer, qbCols, cols, columns)
                )
                return;
            }

            if(newPlayer['Position'] === 'RB') {         
                rbs.push(
                    extractPositionColumns(newPlayer, rbCols, cols, columns)
                )
                return;
            }

            if(newPlayer['Position'] === 'WR') {         
                wrs.push(
                    extractPositionColumns(newPlayer, recieverCols, cols, columns)
                )
                return;
            }

            if(newPlayer['Position'] === 'TE') {         
                tes.push(
                    extractPositionColumns(newPlayer, recieverCols, cols, columns)
                )
                return;
            }

            // // this will create the opponent by parsing a very specific string of T1@T2<space>DateTime
            // const opp = player['Game Info'] 
            //     ? player['Game Info'].replace(player['TeamAbbrev'], '').replace('@', '').split(' ')[0] 
            //     : "TBA"
            // player['Opponent'] = opp;
            // players.push(player)

            // // if the matchup doesn't exist then create the object and add current player
            // if(!matchups[player['TeamAbbrev']]) matchups[player['TeamAbbrev']] = {}
            // //matchups[player['TeamAbbrev']].push(player)
            // if(!matchups[player['TeamAbbrev']][player['Position']]) matchups[player['TeamAbbrev']][player['Position']] = []
            // matchups[player['TeamAbbrev']][player['Position']].push(index)

        }
})
    return {qbs, rbs, wrs, tes}
}

const parseOffensiveData = (data) => {
    let lines = data.split('\n')
    let columns = {};
    let offenses = [];

    lines.map((line, index) => {
        // the first line contains the keys
        const cols = line.split(',')
        if(index < 1) {
            cols.map((col, colIndex) => {
                let tempColName = col
                let colNameCounter = 0

                /**  
                 * Because the name of a column can appear multiple times in the list of columns
                 * this logic will append a suffix to the column if it is already in the list of columns
                 * */ 
                while(columns[`${tempColName}`]) {
                    colNameCounter += 1
                    tempColName = `${tempColName.replace(`_${colNameCounter - 1}`, '')}_${colNameCounter}`             
                } 
                columns[tempColName ] = colIndex
            })
            console.log(columns)
            return
        } else { 
            let newOffense = {}
            newOffense['Team'] = cols[columns['Tm']]
            newOffense['PassingCompletions'] = cols[columns['Cmp']]
            newOffense['PassingAttempts'] = cols[columns['Att']]
            newOffense['PassingYards'] = cols[columns['Yds_1']]
            newOffense['PassingTouchdowns'] = cols[columns['TD']]
            newOffense['Interceptions'] = cols[columns['Int']]
            newOffense['RushingAttempts'] = cols[columns['Att_1']]
            newOffense['RushingYards'] = cols[columns['Yds_2']]
            newOffense['RushingTouchdowns'] = cols[columns['TD_1']]
            offenses.push(newOffense)
        }
    })
    return offenses
}

const parseDefensiveData = (data) => {
    let lines = data.split('\n')
    let columns = {};
    let defenses = [];

    lines.map((line, index) => {
        // the first line contains the keys
        const cols = line.split(',')
        if(index < 1) {
            cols.map((col, colIndex) => {
                let tempColName = col
                let colNameCounter = 0

                /**  
                 * Because the name of a column can appear multiple times in the list of columns
                 * this logic will append a suffix to the column if it is already in the list of columns
                 * */ 
                while(columns[`${tempColName}`]) {
                    colNameCounter += 1
                    tempColName = `${tempColName.replace(`_${colNameCounter - 1}`, '')}_${colNameCounter}`             
                } 
                columns[tempColName ] = colIndex
            })
            console.log(columns)
            return
        } else { 
            let newDefense = {}
            newDefense['Team'] = cols[columns['Tm']]
            newDefense['PointsAllowed'] = cols[columns['PF']]
            newDefense['TotalYards'] = cols[columns['Yds']]
            newDefense['TakeAways'] = cols[columns['TO']]
            newDefense['Fumbles'] = cols[columns['FL']]
            newDefense['PassingAttempts'] = cols[columns['Att']]
            newDefense['Interceptions'] = cols[columns['Int']]
            newDefense['PassingYards'] = cols[columns['Yds_1']]
            newDefense['PassingTouchdowns'] = cols[columns['TD']]
            newDefense['RushingAttempts'] = cols[columns['Att_1']]
            newDefense['RushingYards'] = cols[columns['Yds_2']]
            newDefense['RushingTouchdowns'] = cols[columns['TD_1']]
            defenses.push(newDefense)
        }
    })
    return defenses
}

const parseSchedule = data => {
    const lines = data.split('\n')
    const games = [];
    lines.map((line, index) => {
        const cols = line.split(',')
        if(cols[0] != '4') {
            return
        }
        
        games.push({
            home: cols[4],
            away: cols[6]
        })
        // cols.map((column) => {
            
        // })    
    })
    return games
}

const getCSVData =  async (filename, callback) => {
    const filepath = path.join(process.cwd(), 'data', filename)
    return await fs.readFile(filepath, 'utf8')
}

const getPlayers =  () => getCSVData(playersFilename).then(data => parsePlayerData(data));
const getOffense = () => getCSVData(teamOffenseFilename).then(data => parseOffensiveData(data));
const getDeffense = () => getCSVData(teamDefenseFilename).then(data => parseDefensiveData(data));
const getSchedule = () => getCSVData(scheduleFilename).then(data => parseSchedule(data));

exports.getData = async () => ({
    players: await getPlayers().then(data => data),
    offense: await getOffense().then(data => data),
    defense: await getDeffense().then(data => data),
    schedule: await getSchedule().then(data => data),
    nicknames: nicknames
})