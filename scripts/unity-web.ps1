param(
    [ValidateSet('Packages', 'Setup', 'Validate', 'Build', 'Code', 'Smoke', 'Palette')][string]$Action = 'Build',
    [string]$EditorPath = $env:UNITY_EDITOR_PATH
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$project = Join-Path $repo 'unity/ClashOfErrors'
if (-not $EditorPath) {
    $versionFile = Join-Path $project 'ProjectSettings/ProjectVersion.txt'
    if (-not (Test-Path -LiteralPath $versionFile)) { throw 'Open the project in Unity 6000.6.0f1 once to finish its import.' }
    $version = ((Get-Content -LiteralPath $versionFile | Where-Object { $_ -match '^m_EditorVersion: ' }) -replace '^m_EditorVersion: ', '').Trim()
    $editors = unity editors --installed --format json | ConvertFrom-Json
    if (-not $editors.success) { throw 'Unity CLI could not list Editors. Set UNITY_EDITOR_PATH or pass -EditorPath.' }
    $EditorPath = ($editors.data | Where-Object version -eq $version | Select-Object -First 1).location
}
if (-not $EditorPath -or -not (Test-Path -LiteralPath $EditorPath)) { throw 'Matching Unity Editor unavailable. Pass -EditorPath with the Editor executable.' }
$methods = @{
    Packages = 'ClashOfErrors.Editor.PackageSetup.Install'
    Setup = 'ClashOfErrors.Editor.FoundationSetup.Prepare'
    Validate = 'ClashOfErrors.Editor.WebBuild.Validate'
    Build = 'ClashOfErrors.Editor.WebBuild.Build'
    Code = 'ClashOfErrors.Editor.CodeSetup.Configure'
    Smoke = 'ClashOfErrors.Editor.RenderSmokeTest.Render'
    Palette = 'ClashOfErrors.Editor.FoundationSetup.RepairInitialPalette'
}
$logDirectory = Join-Path $project 'Logs'
New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
$logPath = Join-Path $logDirectory ($Action.ToLowerInvariant() + '.log')
$arguments = @('-batchmode', '-projectPath', ('"' + $project + '"'), '-executeMethod', $methods[$Action], '-logFile', ('"' + $logPath + '"'))
if ($Action -ne 'Packages') { $arguments += '-quit' }
if ($Action -eq 'Build') { $arguments += @('-buildTarget', 'WebGL') }
$process = Start-Process -FilePath $EditorPath -ArgumentList $arguments -WindowStyle Hidden -PassThru
if (-not $process.WaitForExit(1800000)) { throw "Unity exceeded 30 minutes; inspect $logPath and process $($process.Id) before retrying." }
if ($process.ExitCode -ne 0) { throw "Unity $Action failed ($($process.ExitCode)). See $logPath" }
if ($Action -eq 'Build') {
    if (-not (Select-String -LiteralPath $logPath -SimpleMatch 'CLASH_WEB_BUILD_SUCCEEDED:' -Quiet)) { throw "Unity exited without a successful build report. See $logPath" }
    & node (Join-Path $PSScriptRoot 'publish-unity-build.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Unity asset publication failed.' }
}
Write-Output "Unity $Action succeeded. Log: $logPath"
