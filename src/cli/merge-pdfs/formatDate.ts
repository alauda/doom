export function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const paddedMonth = `00${month}`.slice(-2)
  const paddedDay = `00${day}`.slice(-2)
  const paddedHour = `00${hour}`.slice(-2)
  const paddedMinute = `00${minute}`.slice(-2)
  const paddedSecond = `00${second}`.slice(-2)

  const str = `D:${year}${paddedMonth}${paddedDay}${paddedHour}${paddedMinute}${paddedSecond}`

  let offset = date.getTimezoneOffset()
  const rel = offset === 0 ? 'Z' : offset > 0 ? '-' : '+'
  offset = Math.abs(offset)
  const hoursOffset = Math.floor(offset / 60)
  const minutesOffset = offset - hoursOffset * 60
  const paddedHoursOffset = `00${hoursOffset}`.slice(-2)
  const paddedMinutesOffset = `00${minutesOffset}`.slice(-2)

  // D:YYYYMMDDHHmmSSOHH'mm'
  return `${str}${rel}${paddedHoursOffset}'${paddedMinutesOffset}'`
}
