# Giữ nguyên bản ảnh nhà thờ được người dùng chọn; chỉ xuất JPEG nhẹ hơn cho web.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$sourceImage = [Drawing.Image]::FromFile((Join-Path $PSScriptRoot 'nha-tho-to-chi-bo.png'))
$jpeg = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [Drawing.Imaging.EncoderParameter]::new([Drawing.Imaging.Encoder]::Quality, [long]86)
try {
    foreach ($width in @(800, 1600)) {
        $height = [int][Math]::Round($sourceImage.Height * $width / $sourceImage.Width)
        $bitmap = [Drawing.Bitmap]::new($width, $height)
        $graphics = [Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
            $bitmap.Save((Join-Path $PSScriptRoot "../images/nha-tho-to-$width.jpg"), $jpeg, $parameters)
        } finally { $graphics.Dispose(); $bitmap.Dispose() }
    }
} finally { $parameters.Dispose(); $sourceImage.Dispose() }
