<?php

	$apiKey = "1bce843edcb8402884b00db54a410d79";
	$query = "https://openexchangerates.org/api/latest.json?app_id=".$apiKey;

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