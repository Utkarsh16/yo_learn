import React, { useState } from 'react';
import './carousel.scss';

// custom carousel implementation

function Carousel({
  id,
  children = [],
  arrow = false,
  dots = true,
  infinite = true,
  itemsPerPage = 3,
  slidesToScroll = 3
}) {
  let itemCount = children.length;
  let upperLimit = itemCount > itemsPerPage ? parseInt(itemCount / itemsPerPage) : itemCount;
  upperLimit = itemCount % itemsPerPage === 0 ? upperLimit - 1 : upperLimit;

  let dotsCount = slidesToScroll === itemsPerPage ? upperLimit : parseInt(itemCount / slidesToScroll) - 1;
  dotsCount = itemCount <= itemsPerPage ? 0 : dotsCount;

  const [currentFocusedItem, setCurrentFocusedItem] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStartLocation, setTouchStartLocation] = useState({});

  const getNavigationDots = () => {
    if (dotsCount === 0) return [];
    let dots = [];
    // on dots click to be implemented
    for (let index = 0; index <= dotsCount; index++) {
      dots.push(
        <div key={`__dot__${index}`} className={`dot ${index === currentPage ? "active" : ""}`} onClick={() => { }} />
      )
    }
    return dots;
  }

  const onPrev = () => {
    let itemsToScroll = slidesToScroll;
    let prevRow = currentFocusedItem - itemsToScroll;
    if ((currentFocusedItem + 1) < itemsPerPage) prevRow = currentFocusedItem - 1;
    if (infinite && currentFocusedItem === 0) prevRow = itemCount - itemsPerPage;
    setCurrentFocusedItem(prevRow < 0 ? 0 : prevRow);
    setCurrentPage(currentPage - 1 < 0 ? dotsCount : currentPage - 1)
  }

  const onNext = () => {
    let itemsToScroll = slidesToScroll;
    let leftOverItems = itemCount - currentFocusedItem - itemsPerPage;
    if (leftOverItems < itemsPerPage && leftOverItems < slidesToScroll) itemsToScroll = leftOverItems;
    let nextRow = currentFocusedItem + itemsToScroll;
    if (infinite && itemsToScroll === 0) nextRow = 0;
    setCurrentFocusedItem(nextRow)
    setCurrentPage(currentPage + 1 > dotsCount ? 0 : currentPage + 1)
  }

  const onTouchStart = (event) => {
    const firstTouch = event.touches[0];
    setTouchStartLocation({
      x: firstTouch.clientX,
      y: firstTouch.clientY,
    })
  }

  const onTouchEnd = (event) => {
    const firstTouch = event.changedTouches[0];
    const loc = {
      x: firstTouch.clientX,
      y: firstTouch.clientY,
    };
    const diff = {
      x: touchStartLocation.x - loc.x,
      y: touchStartLocation.y - loc.y
    }
    if (diff.x > 0 && Math.abs(diff.x) > 50) onNext()
    else if (diff.x < 0 && Math.abs(diff.x) > 50) onPrev()
  }

  return (
    <div id={`__Carousel__${id}`} className="slider-root">
      <div className="content" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {arrow && <div className="prev arrow" onClick={onPrev}><i className="left" /></div>}
        {
          children.map((rowArr, index) =>
            <div
              key={`__row__${index}`}
              className={`row`}
              style={{
                left: parseInt(window.innerWidth / itemsPerPage) * (index - currentFocusedItem),
                width: parseInt(window.innerWidth / itemsPerPage)
              }}
            >
              {rowArr}
            </div>
          )
        }
        {arrow && <div className="next arrow" onClick={onNext}><i className="right" /></div>}
      </div>
      {
        dots &&
        <div className="dots">
          {getNavigationDots()}
        </div>
      }
    </div>
  )
}

export default Carousel;
