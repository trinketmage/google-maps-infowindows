const raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout
export function nextFrame (fn) {
  raf(() => {
    raf(fn)
  })
}
const getGoogleClass = () => {
  return google.maps.OverlayView//eslint-disable-line
}
const createAnchor = () => {
  const anchor = document.createElement('div')
  anchor.classList.add('infowindow-tip-anchor')
  const contentBox = document.createElement('div')
  contentBox.classList.add('infowindow-gabarit')
  anchor.appendChild(contentBox)
  return anchor
}
export default class GoogleMapsInfoWindow extends getGoogleClass() {
  constructor(opts) {
    super(opts)
    if (typeof google === 'undefined') {
      console.warn('Google Maps is not defined') //eslint-disable-line
      return
    }
    this.marker = opts.marker
    this.map_ = opts.marker.getMap()
    this.position = opts.marker.position
    this.openened = false
    this.anchor = createAnchor()
    this.anchor.firstChild.appendChild(opts.content)
    this.stopEventPropagation()
    google.maps.event.addListener(this.marker, 'click', () => { //eslint-disable-line
      !this.map ? this.open() : this.close()
    })
    this.animated = opts.animated
  }
  panMap() {
    var map = this.map_
    var bounds = map.getBounds()
    if (!bounds) return
    const { position } = this
    if (bounds.contains(position)) {
      setTimeout(() => {
        const mapDiv = map.getDiv()
        const bounding = this.anchor
          .getBoundingClientRect()
        let y = 0
        let x = 0
        if (bounding.top - bounding.height - 30 < 0) {
          y = bounding.top - bounding.height - 30
        } else if (bounding.bottom > mapDiv.offsetHeight) {
          y = bounding.top - mapDiv.offsetHeight + 110
        }
        if (bounding.left < 0) {
          x = bounding.left - 20
        } else if (bounding.right > mapDiv.offsetWidth) {
          x = bounding.left - mapDiv.offsetWidth + bounding.width + 20
        }
        if (x !== 0 || y !== 0) {
          map.panBy(x, y)
        }
      }, 0)
    } else {
      map.panTo(position)
    }
  }
  open() {
    if (this.animated) {
      this.anchor.classList.add('enter')
      this.anchor.addEventListener('animationend', this.enterDone.bind(this), {
        once: true
      })
    }
    this.setMap(this.map_)
  }
  enterDone() {
    // this.anchor.classList.remove('enter')
  }
  close() {
    const { anchor } = this
    anchor.classList.remove('enter')
    anchor.classList.add('leave')
    const end = () => {
      anchor.removeEventListener('animationend', onEnd) //eslint-disable-line
      this.closeDone()
    }
    const onEnd = e => {
      if (e.target === anchor) {
        end()
      }
    }
    if (this.animated) {
      this.anchor.addEventListener('animationend', onEnd)
    } else {
      this.closeDone()
    }
  }
  closeDone(e) {
    this.anchor.classList.remove('leave')
    this.setMap(null)
  }
  onAdd() {
    this.openened = true
    this.getPanes().floatPane.appendChild(this.anchor)
    this.panMap()
  }
  onRemove() {
    this.openened = false
    if (this.anchor.parentElement) {
      this.anchor.parentElement.removeChild(this.anchor)
    }
  }
  draw() {
    var divPosition = this.getProjection().fromLatLngToDivPixel(this.position)
    var display =
      Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
        ? 'block'
        : 'none'
    if (display === 'block') {
      this.anchor.style.left = divPosition.x + 'px'
      this.anchor.style.top = divPosition.y + 'px'
    }
    if (this.anchor.style.display !== display) {
      this.anchor.style.display = display
    }
  }
  stopEventPropagation() {
    const { anchor } = this
    anchor.style.cursor = 'auto'
    ;[
      'click',
      'dblclick',
      'contextmenu',
      'wheel',
      'mousedown',
      'touchstart',
      'pointerdown'
    ].forEach(event => {
      anchor.addEventListener(event, function(e) {
        e.stopPropagation()
      })
    })
  }
}
