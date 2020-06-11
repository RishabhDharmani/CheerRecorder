<?php

header("Content-Type: application/json"); 

$requestPayload = file_get_contents("php://input");

$object = json_encode($requestPayload, true);

var_dump($object);

?>
