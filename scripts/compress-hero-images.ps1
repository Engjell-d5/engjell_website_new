param(
    [int]$MaxWidth = 2400,
    [long]$Quality = 80,
    [string]$PublicDir = (Join-Path $PSScriptRoot "..\public"),
    [string]$BackupDir = (Join-Path $PSScriptRoot "..\public\_originals_backup")
)

# Hero images flagged in audit
$targets = @(
    'IMG_0425.JPG',
    'IMG_0456 (1).JPG',
    'IMG_0466.JPG',
    '_DSC0037.JPG',
    '_DSC0048.JPG',
    '_DSC0112.JPG',
    '_DSC0124.JPG',
    '_DSC0142.JPG'
)

Add-Type -AssemblyName System.Drawing

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, $Quality
)

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$totalBefore = 0L
$totalAfter = 0L

foreach ($name in $targets) {
    $srcPath = Join-Path $PublicDir $name
    if (-not (Test-Path $srcPath)) {
        Write-Output "SKIP (missing): $name"
        continue
    }

    $backupPath = Join-Path $BackupDir $name
    if (-not (Test-Path $backupPath)) {
        Copy-Item -LiteralPath $srcPath -Destination $backupPath
    }

    $sizeBefore = (Get-Item -LiteralPath $srcPath).Length
    $totalBefore += $sizeBefore

    # Load from backup to preserve original quality
    $img = [System.Drawing.Image]::FromFile($backupPath)
    try {
        $origW = $img.Width
        $origH = $img.Height

        if ($origW -le $MaxWidth) {
            $newW = $origW
            $newH = $origH
        } else {
            $ratio = $MaxWidth / [double]$origW
            $newW = [int]$MaxWidth
            $newH = [int][math]::Round($origH * $ratio)
        }

        $bmp = New-Object System.Drawing.Bitmap $newW, $newH
        try {
            $bmp.SetResolution($img.HorizontalResolution, $img.VerticalResolution)
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            try {
                $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $g.DrawImage($img, 0, 0, $newW, $newH)
            } finally { $g.Dispose() }

            # Write to a temp file, then move into place
            $tmp = "$srcPath.tmp"
            $bmp.Save($tmp, $jpegCodec, $encoderParams)
            Move-Item -LiteralPath $tmp -Destination $srcPath -Force
        } finally { $bmp.Dispose() }
    } finally { $img.Dispose() }

    $sizeAfter = (Get-Item -LiteralPath $srcPath).Length
    $totalAfter += $sizeAfter

    $beforeMB = [math]::Round($sizeBefore / 1MB, 2)
    $afterMB  = [math]::Round($sizeAfter / 1MB, 2)
    $pct      = [math]::Round((1 - ($sizeAfter / [double]$sizeBefore)) * 100, 1)
    Write-Output ("OK  {0,-22}  {1,6} MB -> {2,5} MB  ({3}% smaller)" -f $name, $beforeMB, $afterMB, $pct)
}

$totalBeforeMB = [math]::Round($totalBefore / 1MB, 2)
$totalAfterMB  = [math]::Round($totalAfter  / 1MB, 2)
Write-Output ""
Write-Output ("TOTAL: {0} MB -> {1} MB (saved {2} MB)" -f $totalBeforeMB, $totalAfterMB, ([math]::Round(($totalBefore - $totalAfter) / 1MB, 2)))
