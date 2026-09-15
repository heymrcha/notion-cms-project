// Date 객체를 거치면 서버·브라우저 타임존 차이로 월이 하루 어긋날 수 있어 ISO 문자열의 앞 7자만 잘라 쓴다
function toYearMonth(iso: string): string {
  return iso.slice(0, 7).replace("-", ".")
}

export function formatPeriod(start: string, end: string | null): string {
  const endLabel = end === null ? "진행 중" : toYearMonth(end)
  return `${toYearMonth(start)} – ${endLabel}`
}
