<?php

$apiKey = "45e3f3fb7629975143d9b05b953ea52b"; 
$query = "https://api.openweathermap.org/data/2.5/weather?lat=".$_POST["latitude"]."&lon=".$_POST["longitude"]."&appid=".$apiKey;

		$ch = curl_init();
        $options = [
            CURLOPT_TIMEOUT => 10,
            CURLOPT_URL => $query,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ];
        curl_setopt_array($ch, $options);
        $ret = curl_exec($ch);
		$ret_decoded = json_decode($ret, true);
		header('Content-Type: application/json');

		echo json_encode($ret_decoded);
?>