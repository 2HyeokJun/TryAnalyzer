import {request, gql} from 'graphql-request'
import https from 'https'
import axios from 'redaxios'
import { sampleActors } from './data/actors.js'
import { sampleDebuffs } from './data/debuff.js'
import fs from 'fs/promises'
import { sampleEvents } from './data/events/events.js'

// ACCESS_TOKEN 발급
const encodedCredentials = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64')

const postRequestHeaders = {
    Authorization: `Basic ${encodedCredentials}`
}
const postRequestBody = {
    "grant_type": "client_credentials"
}

// const token = (await axios.post(process.env.TOKEN_SERVER, postRequestBody, {headers: postRequestHeaders})).data.access_token
const token = process.env.ACCESS_TOKEN
// graphQL

const API_SERVER = process.env.API_SERVER
const headers = {
    Authorization: `Bearer ${token}`
}

const graphQLVariables = {
    code: "XGFVK2hpkMZY984r"
}


// 1. 전투시간 / ID 조회
const combatTimeQuery = gql`
    query ($code: String!) {
        fightData: reportData {
            report(code: $code) {
                fights(translate: false, fightIDs: [4]) {
                id
                difficulty
                name
                startTime
                endTime
                }
            }
        }
    
        masterData: reportData {
            report(code: $code) {
                masterData {
                    actors {
                        id
                        name
                        type
                        subType
                    }
                }
            }
        }
    }
`
// const response = await request(API_SERVER, combatTimeQuery, graphQLVariables, headers)
// const {startTime, endTime} = response?.fightData?.report?.fights[0]
// const {actors} = response?.masterData?.report?.masterData
const {startTime, endTime} = {startTime: 781898, endTime: 918267}
const actors = sampleActors
// console.log(actors)

// 2. 디버프 조회
graphQLVariables.startTime = startTime
graphQLVariables.endTime = endTime
const debuffQuery = gql`
    query($code: String!, $startTime: Float!, $endTime: Float!) {
        reportData {
            report(code: $code) {
                events(
                    startTime: $startTime
                    endTime: $endTime
                    dataType: Debuffs
                    hostilityType: Friendlies,
                ) {
                    data
                    nextPageTimestamp
                }
            }
        }
    }
`
// let everyDebuffDataArray = []
// let hasNextPage = true
// while (hasNextPage) {
//     let debuffResponse = await request(API_SERVER, debuffQuery, graphQLVariables, headers)
//     const { data, nextPageTimestamp } = debuffResponse.reportData.report.events;

//     everyDebuffDataArray = [...everyDebuffDataArray, ...data];
//     graphQLVariables.startTime = nextPageTimestamp;

//     hasNextPage = nextPageTimestamp !== null;
// }
// console.log(JSON.stringify(everyDebuffDataArray))

// let debuffArray = sampleDebuffs.reportData.report.events.data
// let 화염균열 = debuffArray.filter(e => e.abilityGameID === 390715 && e.type === 'applydebuff')

// let object = {}
// let targetUserArray = []
// let initialTimestamp = null
// for (const data of 화염균열) {
//     let {timestamp, targetID} = data
//     if (!initialTimestamp) {
//         initialTimestamp = timestamp
//     }
//     if (targetUserArray.length < 5) {
//         let targetUserName = sampleActors.find(e => e.id === targetID)
//         targetUserArray.push(targetUserName)
//     }
//     if (targetUserArray.length === 5) {
//         object[initialTimestamp] = targetUserArray
//         initialTimestamp = null
//         targetUserArray = []
//     }
// }
// console.log(object)

// 3. allDataType 조회
const eventsQuery = gql`
    query ($code: String!, $startTime: Float!, $endTime: Float!) {
        reportData {
            report(code: $code) {
                events(
                    dataType: All
                    useAbilityIDs: true
                    includeResources: true
                    startTime: $startTime
                    endTime: $endTime
                ) {
                    data
                    nextPageTimestamp
                }
            }
        }
    }
`
let everyEventsDataArray = []
let hasNextPage = true
let i = 1
while (hasNextPage) {
    console.log(i)
    let eventsResponse = await request(API_SERVER, eventsQuery, graphQLVariables, headers)
    const { data, nextPageTimestamp } = eventsResponse.reportData.report.events;

    everyEventsDataArray = [...everyEventsDataArray, ...data];
    graphQLVariables.startTime = nextPageTimestamp;

    hasNextPage = nextPageTimestamp !== null;
    i += 1
}
try {
    await fs.writeFile('./events.json', JSON.stringify(everyEventsDataArray, null, 2));
    console.log('everyEventsDataArray가 events.json 파일로 저장되었습니다.');
} catch (error) {
    console.error('events.json 파일 저장 중 오류가 발생했습니다:', error);
}

// let eranogEvent = sampleEvents.filter(e => e.sourceID === 80)
// try {
//     await fs.writeFile('./eranog.json', JSON.stringify(eranogEvent, null, 2));
//     console.log('everyEventsDataArray가 events.json 파일로 저장되었습니다.');
// } catch (error) {
//     console.error('events.json 파일 저장 중 오류가 발생했습니다:', error);
// }

// let events = sampleEvents.find(e => e.type == 'cast' && e.abilityGameID === 157982)
// console.log(events)

// 82.198seconds (864885 - 781898)
// 1m 22.198seconds (api)
// 1m 22.987seconds (site)