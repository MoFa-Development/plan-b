<?php
error_reporting(E_ALL);

header("Content-type:application/json");

$api_URL = "https://pastebin.com/raw/xKxxgzMv";


$contents = file_get_contents($api_URL, false);

echo $contents;

?>