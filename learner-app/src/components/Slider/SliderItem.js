import React from 'react'
import "./index.css"

export default function SliderItem({
  title, imageUrl
}) {
  return (
    <div key={title} className="row-item">
      <img src={imageUrl} alt={title} />
      <div>{title}</div>
    </div>
  )
}
