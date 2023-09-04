'use client'

// React
import { useEffect, useState } from 'react'

// Firebase
import firebase_app from '../../config/firebase'
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore"

// Figma
import * as Figma from 'figma-api'

export default function Connect() {

  // User
  const [accessToken, setAccessToken] = useState('')
  const [userRecord, setUserRecord] = useState('')
  const [parsedUserRecord, setParsedUserRecord] = useState('')

  let api
  let user

  const db = getFirestore(firebase_app)

  useEffect(() => {

    setUserRecord(localStorage.getItem("user"))
    setParsedUserRecord(JSON.parse(localStorage.getItem("user")))

  }, [userRecord])

  const connect = async (e) => {

    e.preventDefault()

    // Connect to Figma
    api = new Figma.Api({ personalAccessToken: accessToken });
    user = await api.getMe()

    // Save user data to localStorage
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    setUserRecord(localStorage.getItem("user"))
    setParsedUserRecord(JSON.parse(localStorage.getItem("user")))

    // Write user data to Firestore
    await addDoc(collection(db, "users"), {
      handle: user.handle,
      email: user.email,
      imgUrl: user.img_url,
      files: [],
      history: [],
      created: 1815
    });
  }

  const disconnect = async (e) => {
    // e.preventDefault()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    // In case there are any other localStorage items, remove them here
    localStorage.removeItem('fileVersions')
    setUserRecord('')
    setParsedUserRecord('')
    console.log('Logged out')
  }

  return (
    <main className="flex min-h-screen flex-col text-white">
      {
        userRecord ? 
          <div className="connect-card flex flex-col flex-container align-middle w-fit py-8 px-6 bg-zinc-800/60 mx-auto">
            <p className="text-zinc-400 text-sm text-center">Logged in ✔</p>
            <h1 className="text-zinc-50 text-3xl text-center">{parsedUserRecord.handle}</h1>
            <h4 className="text-zinc-400 text-sm text-center">{parsedUserRecord.email}</h4>
            <div className="text-black self-center w-fit mx-auto" id="chart"></div>
            <button className="w-auto text-zinc-50 py-1 px-4 bg-zinc-600 rounded-md m-auto text-center" onClick={disconnect}>Log out</button>
          </div>
        : 
          <form className="flex flex-col items-center justify-center" onSubmit={connect}>
            <input type="text" name="personal-access-token" id="personal-access-token" palceholder="Your personal access token" value={accessToken} onChange={e => setAccessToken(e.target.value)}></input>
            <button>Connect your Figma account</button>
          </form>
      }
    </main>
  )
}