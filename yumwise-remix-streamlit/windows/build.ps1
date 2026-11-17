param([Parameter(Mandatory = $true)][string]$OutputDirectory)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$stage = [IO.Path]::GetFullPath($OutputDirectory)
$runtime = Join-Path $stage "runtime"
$pythonVersion = "3.14.10"
$archive = Join-Path $env:TEMP "python-$pythonVersion-embed-amd64.zip"

if (Test-Path -LiteralPath $stage) { throw "Use a new directory for the Windows build." }
New-Item -ItemType Directory -Path $stage, $runtime, "$stage/.streamlit", "$stage/frontend" | Out-Null
$pythonAbi = & python -c "import struct, sys; print(f'{sys.version_info.major}.{sys.version_info.minor}-{struct.calcsize(chr(80))*8}')"
if ($LASTEXITCODE -ne 0 -or $pythonAbi -ne "3.14-64") { throw "The build uses 64-bit Python 3.14 to install Windows wheels." }

Invoke-WebRequest -Uri "https://www.python.org/ftp/python/$pythonVersion/python-$pythonVersion-embed-amd64.zip" -OutFile $archive
$expectedHash = "90905e64a840557d8c1bc4f5b74db3d7ee85e3ffb217611cac1c7813acea4159"
if ((Get-FileHash $archive -Algorithm SHA256).Hash -ne $expectedHash) { throw "Python runtime checksum mismatch." }
Expand-Archive -LiteralPath $archive -DestinationPath $runtime
@("python314.zip", ".", "Lib\site-packages", "import site") |
    Set-Content -LiteralPath "$runtime/python314._pth" -Encoding Ascii
& python -m pip install --disable-pip-version-check --only-binary=:all: --target "$runtime/Lib/site-packages" -r "$root/requirements.txt"
if ($LASTEXITCODE -ne 0) { throw "Installing the Windows dependencies failed." }

Copy-Item -LiteralPath "$root/app.py", "$root/README.md" -Destination $stage
Copy-Item -LiteralPath "$root/.streamlit/config.toml" -Destination "$stage/.streamlit"
Copy-Item -LiteralPath "$root/frontend/dist" -Destination "$stage/frontend" -Recurse
$compiler = Join-Path $env:WINDIR "Microsoft.NET/Framework64/v4.0.30319/csc.exe"
$launcherSource = (Resolve-Path -LiteralPath (Join-Path $root "windows\Launcher.cs")).ProviderPath
$launcherExecutable = Join-Path $stage "YumWise.exe"
& $compiler /nologo /codepage:65001 /target:winexe /platform:x64 "/out:$launcherExecutable" /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Security.dll $launcherSource
if ($LASTEXITCODE -ne 0) { throw "Compiling YumWise.exe failed." }

Push-Location -LiteralPath $stage
try {
    & "$runtime/python.exe" -c "import runpy; runpy.run_path('app.py')"
    if ($LASTEXITCODE -ne 0) { throw "The packaged Python could not load YumWise." }
    $check = Start-Process -FilePath "$stage/YumWise.exe" -ArgumentList "--smoke-test" -PassThru
    if (-not $check.WaitForExit(50000)) {
        $check.Kill()
        throw "The launcher smoke test timed out."
    }
    if ($check.ExitCode -ne 0) { throw "The launcher smoke test failed (exit $($check.ExitCode))." }
} finally {
    Pop-Location
}
