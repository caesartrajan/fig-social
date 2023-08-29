'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

import * as Figma from 'figma-api'

export default function Home() {

  const [accessToken, setAccessToken] = useState('')
  const [userRecord, setUserRecord] = useState('')
  const [parsedUserRecord, setParsedUserRecord] = useState('')

  // File
  const [fileKey, setFileKey] = useState('')
  const [fileHistory, setFileHistory] = useState()
  const [parsedFileHistory, setParsedFileHistory] = useState('')

  let api
  let user
  let fileVersions
  let rawHistoricalTimestamps = []

  useEffect(() => {

    setUserRecord(localStorage.getItem("user"))
    setParsedUserRecord(JSON.parse(localStorage.getItem("user")))

    setFileHistory(localStorage.getItem("fileVersions"))
    setParsedFileHistory(JSON.parse(localStorage.getItem("fileVersions")))

    userRecord ?
      console.log(`userRecord present: `,parsedUserRecord.id)
    :
      console.log('no userRecord present')

    fileHistory ?
      console.log(parsedFileHistory)
    :
      console.log('no fileHistory present')

  }, [userRecord, fileVersions])

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
    console.log(fileVersions)
    // const fileHistory = await api.getVersions(fileKey)
    console.log(fileHistory)
  }

  const recordHistory = (e) => {
    e.preventDefault()

    console.log(`fileHistory: `, fileHistory)
    console.log(`parsedFileHistory: `, parsedFileHistory)

    let i
    for (i=0;i<parsedFileHistory.versions.length;i++) {
      console.log(`version ${i}: `, parsedFileHistory.versions[i])
      if (parsedFileHistory.versions[i].user.id == parsedUserRecord.id) {
        console.log(`version ${i} is a match: `, parsedFileHistory.versions[i])
        rawHistoricalTimestamps.push(parsedFileHistory.versions[i])
      }
    }
    // This array only shows file versions that the authenticated user is responsible for:
    console.log(`rawHistoricalTimestamps: `, rawHistoricalTimestamps)
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
                  <p>{fileHistory}</p>
                  <button onClick={recordHistory}>Compute</button>
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