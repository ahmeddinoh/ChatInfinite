$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$electron = Join-Path $root "node_modules\electron\dist\electron.exe"

if (-not (Test-Path $electron)) {
  throw "Electron is not installed. Run npm install first."
}

function New-AppShortcut([string]$linkPath) {
  $folder = Split-Path -Parent $linkPath
  if (-not (Test-Path $folder)) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
  }
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($linkPath)
  $shortcut.TargetPath = $electron
  $shortcut.Arguments = "."
  $shortcut.WorkingDirectory = $root
  $shortcut.WindowStyle = 1
  $shortcut.Description = "Incognito ChatGPT"
  $shortcut.Save()
}

$desktop = [Environment]::GetFolderPath("Desktop")
$startMenu = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
New-AppShortcut (Join-Path $desktop "Incognito ChatGPT.lnk")
New-AppShortcut (Join-Path $startMenu "Incognito ChatGPT.lnk")

Write-Host "Pinned shortcuts:"
Write-Host "  $(Join-Path $desktop 'Incognito ChatGPT.lnk')"
Write-Host "  $(Join-Path $startMenu 'Incognito ChatGPT.lnk')"
