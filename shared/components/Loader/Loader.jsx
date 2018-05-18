import React from 'react'
import './Loader.scss'

export default function Loader() {
  return (
    <div className="overlay">
      <div className="loader center">
        <div className="loader1" />
        <div className="loader2" />
        <div className="loader3" />
      </div>
    </div>
  )
}
