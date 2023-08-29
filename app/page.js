'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

import * as Figma from 'figma-api';

export default function Home() {

  const [accessToken, setAccessToken] = useState('')
  // const [connected, setConnected] = (false)
  const [fileHistory, setFileHistory] = useState([])

  let api
  let user
  let userRecord = localStorage.getItem("user")

  const getUser = async (e) => {
    e.preventDefault()
    api = new Figma.Api({ personalAccessToken: accessToken });
    user = await api.getMe()

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('user', user.handle)

    // user ? setConnected(true) : setConnected(false)

    console.log(`user: `,user)
  }

  const getHistory = async () => {
    const fileHistory = await api.getVersions('file id')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {
        userRecord ? 
          <p>{userRecord}</p>
         : 
          <form className="flex flex-col items-center justify-center" onSubmit={getUser}>
            <input type="text" palceholder="Your personal access token" value={accessToken} onChange={e => setAccessToken(e.target.value)}></input>
            <button>Connect</button>
          </form>
        
      }
    </main>
  )
}