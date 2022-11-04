export default function isWheelDown(event) {
  event.gEvent.preventDefault()
  return event.gEvent.originalEvent.deltaY < 0
}
