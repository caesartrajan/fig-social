'use client'

// React
import { useEffect, useRef, useState } from 'react'

// Moment
import moment from 'moment'

// Figma
import * as Figma from 'figma-api'

// Observable
import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'

export default function Home() {

  // User
  const [accessToken, setAccessToken] = useState('')
  const [userRecord, setUserRecord] = useState('')
  const [parsedUserRecord, setParsedUserRecord] = useState('')

  // File
  const [fileKey, setFileKey] = useState('')
  const [fileHistory, setFileHistory] = useState()
  const [parsedFileHistory, setParsedFileHistory] = useState('')

  // History
  const [fullHistory, setFullHistory] = useState([])
  const [chart, setChart] = useState()

  let api
  let user
  let fileVersions
  let rawHistoricalTimestamps = []

  useEffect(() => {

    setUserRecord(localStorage.getItem("user"))
    setParsedUserRecord(JSON.parse(localStorage.getItem("user")))

    setFileHistory(localStorage.getItem("fileVersions"))
    setParsedFileHistory(JSON.parse(localStorage.getItem("fileVersions")))

  }, [userRecord, fileVersions, fullHistory, chart])

  const getUser = async (e) => {
    e.preventDefault()
    api = new Figma.Api({ personalAccessToken: accessToken });
    user = await api.getMe()

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    setUserRecord(localStorage.getItem("user"))
    setParsedUserRecord(JSON.parse(localStorage.getItem("user")))
  }

  const getFile = async (e) => {
    e.preventDefault()
    api = new Figma.Api({ personalAccessToken: localStorage.getItem('accessToken') });
    console.log(`fileKey: `, fileKey)
    console.log(`api: `, api)
    fileVersions = await api.getVersions(fileKey)
    localStorage.setItem('fileVersions', JSON.stringify(fileVersions))
    // setFileHistory(fileVersions)
    console.log(`file versions: `,fileVersions)
    // const fileHistory = await api.getVersions(fileKey)
    console.log(fileHistory)
  }

  const recordHistory = (e) => {
    e.preventDefault()

    // Make raw file history with just dates and counts
    let i
    for (i=0;i<parsedFileHistory.versions.length;i++) {
      // console.log(`version ${i}: `, parsedFileHistory.versions[i])
      if (parsedFileHistory.versions[i].user.id = parsedUserRecord.id) {
        console.log(`version ${i} is not a match: `, parsedFileHistory.versions[i])

        rawHistoricalTimestamps.push(parsedFileHistory.versions[i])

        // Clean timestamp
        rawHistoricalTimestamps[i].created_at = rawHistoricalTimestamps[i].created_at.substr(0,10)
        delete rawHistoricalTimestamps[i].id
        delete rawHistoricalTimestamps[i].label
        delete rawHistoricalTimestamps[i].description
        delete rawHistoricalTimestamps[i].user
        delete rawHistoricalTimestamps[i].thumbnail_url
        // console.log(`version ${i} is a match: `, parsedFileHistory.versions[i])
      } else {
        console.log(`version ${i} is not a match: `, parsedFileHistory.versions[i])
      }
    }

    // 

    // Create a trailing 365 day array
    function generateTrailing365DaysArray(endDate) {
      const dateArray = [];
      const currentDate = new Date(endDate);

      for (let i = 364; i >= 0; i--) {

        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i)
        const formattedDate = moment(date).format('YYYY-MM-DD')

        let count = 0; // Random count for demonstration

        // Iterate count based on history
        console.log(`formattedDate: `, formattedDate)
        console.log(`rawHistoricalTimestamps[1].created_at: `, rawHistoricalTimestamps[1].created_at)
        for (let j = 0; j < rawHistoricalTimestamps.length; j++) {
          if (formattedDate === rawHistoricalTimestamps[j].created_at) {
            count = count + 1
          }
        }
        dateArray.push({ Date: new Date(formattedDate), Count: count });
      }

      // Trailing 365 days with one file's history added to counts
      return dateArray;
    }

    // Calculate the current date
    const today = new Date();
    console.log(`type of today: `, typeof today)

    // Generate the array of objects for the trailing 365 days
    const trailing365DaysArray = generateTrailing365DaysArray(today);
    setFullHistory(trailing365DaysArray)
    console.log(`fullHistory: `, trailing365DaysArray)
  }

  const buildCalendar = (e) => {
    e.preventDefault()
    const plot = Plot.plot({
      y: {grid: true},
      color: {scheme: "Magma", legend: true, label: "Daily change"},
      marks: [
        Plot.cell(fullHistory, {
          x: (d) => d3.utcWeek.count(d3.utcYear(d.Date), d.Date),
          y: (d) => d.Date.getUTCDay(),
          fy: (d) => d.Date.getUTCFullYear(),
          fill: (d, i) => i > 0 ? (d.Count - fullHistory[i - 1].Count) / fullHistory[i - 1].Count : NaN,
          title: (d, i) => i > 0 ? ((d.Count - fullHistory[i - 1].Count) / fullHistory[i - 1].Count * 50).toFixed(1) : NaN,
          inset: 0.5
        })
      ]
    });
    const chartContainer = document.querySelector("#chart")
    chartContainer.appendChild(plot)
  }

  return (
    <main className="flex min-h-screen flex-col">
      {
        userRecord ? 
          <>
            <p>{parsedUserRecord.handle}</p>
            <p>{parsedUserRecord.email}</p>
            {
              fileHistory ?
                <>
                  <button onClick={recordHistory}>Compute full history</button>
                  <button onClick={buildCalendar}>Build calendar</button>
                  <div id="chart"></div>
                  <p>{JSON.stringify(fullHistory)}</p>
                </>
              :
                <form onSubmit={getFile}>
                  <input type="text" palceholder="Paste a file link here" value={fileKey} onChange={e => setFileKey(e.target.value)}></input>
                  <button>Get file history</button>
                </form>
            }
          </>
        : 
          <form className="flex flex-col items-center justify-center" onSubmit={getUser}>
            <input type="text" palceholder="Your personal access token" value={accessToken} onChange={e => setAccessToken(e.target.value)}></input>
            <button>Connect</button>
          </form>
        
      }
    </main>
  )
}