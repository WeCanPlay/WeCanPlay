<?php

$path = $_GET['file'];
if ($_GET['type'] == 'gif') {
	header("Content-type: image/gif");
    print(file_get_contents($path));
	usleep(rand(2000000, 5000000));
} else if ($_GET['type'] == 'ogg') {
	header("Content-type: audio/ogg");
    print(file_get_contents($path));
	usleep(rand(2000000, 5000000));
} else if ($_GET['type'] == 'mp3') {
	header("Content-type: audio/mpeg");
    print(file_get_contents($path));
	usleep(rand(2000000, 5000000));
}