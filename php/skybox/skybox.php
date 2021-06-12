<?php 
if ((isset($_GET["h"])) && (!empty($_GET["h"]))){
    $hue = intval($_GET["h"]);
}else{
    $hue = 0;
}

if ((isset($_GET["s"])) && (!empty($_GET["s"]))){
    $sat = intval($_GET["s"]);
}else{
    $sat = 0;
}

$lit = 50;


function tintImage($r, $g, $b) {
    $a = 1;
    $handle = fopen('INERTIA_OUTERSPACE.png', 'rb');
    $imagick = new Imagick();
    $imagick->readImageFile($handle);
    $tint = new \ImagickPixel("rgb($r, $g, $b)");
    $opacity = new \ImagickPixel("rgb(255, 255, 255, $a)");
    $imagick->tintImage($tint, $opacity);
    $imagick->setImageFormat('png');
    header("Content-Type: image/png");
    echo $imagick->getImageBlob();
}

function hsl2rgb($h, $s, $l) {
    
    $h /= 60;
    if ($h < 0) {
        $h = 6 - fmod(-$h, 6);
    }
    $h = fmod($h, 6);

    $s = max(0, min(1, $s / 100));
    $l = max(0, min(1, $l / 100));

    $c = (1 - abs((2 * $l) - 1)) * $s;
    $x = $c * (1 - abs(fmod($h, 2) - 1));

    if ($h < 1) {
        $r = $c;
        $g = $x;
        $b = 0;
    } elseif ($h < 2) {
        $r = $x;
        $g = $c;
        $b = 0;
    } elseif ($h < 3) {
        $r = 0;
        $g = $c;
        $b = $x;
    } elseif ($h < 4) {
        $r = 0;
        $g = $x;
        $b = $c;
    } elseif ($h < 5) {
        $r = $x;
        $g = 0;
        $b = $c;
    } else {
        $r = $c;
        $g = 0;
        $b = $x;
    }

    $m = $l - $c / 2;
    $r = round(($r + $m) * 255);
    $g = round(($g + $m) * 255);
    $b = round(($b + $m) * 255);
    
    tintImage($r, $g, $b);


}

$color = hsl2rgb($hue, $sat, $lit);

?>