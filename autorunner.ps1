Start-Process node "c:\Users\scraperToBackendV3.js"
$processId = (Get-Process node).id

$browserProcess = Start-Process chrome.exe '-new-window http://localhost:3000' -PassThru

$browserProcess.WaitForExit()

Read-Host "Please press enter to exit"

Stop-Process -Id $processId
