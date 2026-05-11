param(
    [string]$Source = (Join-Path $PSScriptRoot "..\public\IMG_0425.JPG"),
    [string]$Dest   = (Join-Path $PSScriptRoot "..\public\og-image.jpg"),
    [int]$Width  = 1200,
    [int]$Height = 630,
    [long]$Quality = 85
)

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Image]::FromFile($Source)
try {
    $srcRatio = $src.Width / [double]$src.Height
    $dstRatio = $Width / [double]$Height

    # Cover-fit: scale so the image fills the canvas, then crop excess
    if ($srcRatio -gt $dstRatio) {
        # source wider than canvas — match height, crop width
        $scaledH = $Height
        $scaledW = [int][math]::Round($Height * $srcRatio)
    } else {
        # source taller/narrower than canvas — match width, crop height
        $scaledW = $Width
        $scaledH = [int][math]::Round($Width / $srcRatio)
    }
    $offsetX = [int][math]::Round(($Width  - $scaledW) / 2)
    $offsetY = [int][math]::Round(($Height - $scaledH) / 2)

    $bmp = New-Object System.Drawing.Bitmap $Width, $Height
    try {
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $g.DrawImage($src, $offsetX, $offsetY, $scaledW, $scaledH)
        } finally { $g.Dispose() }

        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
            Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, $Quality
        )

        $tmp = "$Dest.tmp"
        $bmp.Save($tmp, $jpegCodec, $encoderParams)
        Move-Item -LiteralPath $tmp -Destination $Dest -Force
    } finally { $bmp.Dispose() }
} finally { $src.Dispose() }

$size = [math]::Round((Get-Item $Dest).Length / 1KB, 1)
Write-Output ("OK  og-image.jpg  ${Width}x${Height}  ${size} KB")
