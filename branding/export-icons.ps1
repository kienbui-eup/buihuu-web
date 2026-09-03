# Xuất kích thước web từ ảnh gốc ImageGen, không thay đổi thiết kế.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$assetDirectory = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../images'))

function Export-IconPng([string]$Source, [string]$Name, [int]$Size) {
    $sourceImage = [Drawing.Image]::FromFile((Join-Path $PSScriptRoot $Source))
    $bitmap = [Drawing.Bitmap]::new($Size, $Size)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.CompositingQuality = [Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.DrawImage($sourceImage, 0, 0, $Size, $Size)
        $bitmap.Save((Join-Path $assetDirectory $Name), [Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
        $sourceImage.Dispose()
    }
}

Export-IconPng 'logo-bui-huu-master.png' 'logo-bui-huu.png' 256
Export-IconPng 'logo-bui-huu-master.png' 'icon-bui-huu-192.png' 192
Export-IconPng 'logo-bui-huu-master.png' 'icon-bui-huu-512.png' 512
Export-IconPng 'logo-bui-huu-master.png' 'apple-touch-bui-huu.png' 180
$iconSizes = @(16, 32, 48)
foreach ($size in $iconSizes) {
    Export-IconPng 'favicon-bui-huu-master.png' "favicon-bui-huu-$size.png" $size
}

# ICO chứa ba PNG 16/32/48 px để trình duyệt chọn theo mật độ màn hình.
$iconStream = [IO.File]::Create((Join-Path $assetDirectory 'favicon-bui-huu.ico'))
$writer = [IO.BinaryWriter]::new($iconStream)
try {
    $writer.Write([uint16]0)
    $writer.Write([uint16]1)
    $writer.Write([uint16]$iconSizes.Count)
    $offset = 6 + 16 * $iconSizes.Count
    foreach ($size in $iconSizes) {
        $png = [IO.File]::ReadAllBytes((Join-Path $assetDirectory "favicon-bui-huu-$size.png"))
        $writer.Write([byte]$size)
        $writer.Write([byte]$size)
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([uint16]1)
        $writer.Write([uint16]32)
        $writer.Write([uint32]$png.Length)
        $writer.Write([uint32]$offset)
        $offset += $png.Length
    }
    foreach ($size in $iconSizes) {
        $writer.Write([IO.File]::ReadAllBytes((Join-Path $assetDirectory "favicon-bui-huu-$size.png")))
    }
} finally {
    $writer.Dispose()
}

# Đồng bộ cả đường dẫn cũ mà trình duyệt hoặc bản cài PWA có thể còn giữ.
Copy-Item -LiteralPath (Join-Path $assetDirectory 'favicon-bui-huu.ico') -Destination (Join-Path $assetDirectory 'favicon.ico')
Copy-Item -LiteralPath (Join-Path $assetDirectory 'icon-bui-huu-192.png') -Destination (Join-Path $assetDirectory 'icon192.png')
Copy-Item -LiteralPath (Join-Path $assetDirectory 'icon-bui-huu-512.png') -Destination (Join-Path $assetDirectory 'icon512.png')
