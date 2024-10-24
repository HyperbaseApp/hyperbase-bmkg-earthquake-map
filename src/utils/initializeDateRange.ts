export function initializeDateRange(): [Date, Date] {
    const today = new Date()

    const prevDate = new Date(today)
    prevDate.setMonth(today.getMonth() - 1)

    return [prevDate, today]
}