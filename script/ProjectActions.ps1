$projectRoot = Split-Path -Parent $PSScriptRoot

function Test-ProjectEnvironment {
    $node = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $node) {
        Write-Host '[检查] 需要在 PATH 中提供 Node.js 24 或更新版本。'
        return 1
    }
    $version = & $node.Source --version
    if ($LASTEXITCODE -ne 0 -or $version -notmatch '^v([0-9]+)\.' -or [int]$Matches[1] -lt 24) {
        Write-Host "[检查] Node.js 版本检查失败：$version，需要 24 或更新版本。"
        return 1
    }
    foreach ($file in @(
        'script/serve.mjs',
        'script/workspace-store.mjs',
        'prototypes/workspace-recovery/index.html',
        'prototypes/workspace-recovery/gantt.html',
        'prototypes/workspace-recovery/workspace-data.js',
        'prototypes/workspace-recovery/workspace-storage.js',
        'prototypes/workspace-recovery/workspace-scroll.js',
        'prototypes/workspace-recovery/workspace-scroll.css'
    )) {
        if (-not (Test-Path -LiteralPath (Join-Path $projectRoot $file) -PathType Leaf)) {
            Write-Host "[检查] 缺少随插件交付的文件：$file"
            return 1
        }
    }
    Write-Host "[检查] Node.js $version 与 RINGS 原型文件已就绪。"
    return 0
}

function Start-ProjectApplication {
    param([string]$HostAddress, [int]$Port)

    & node.exe (Join-Path $PSScriptRoot 'serve.mjs') $HostAddress $Port | Out-Host
    return $LASTEXITCODE
}
