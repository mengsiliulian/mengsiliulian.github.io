try {
  $r = Invoke-RestMethod -Uri 'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Shanghai' -TimeoutSec 15
  Write-Output ('NET_TIME: ' + $r.dateTime + ' | ' + $r.timeZone)
} catch {
  Write-Output ('NET_TIME_FAIL: ' + $_.Exception.Message)
}
