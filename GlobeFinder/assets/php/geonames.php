<?php
	$query = "http://api.geonames.org/findNearbyWikipediaJSON?formatted=true&lat=".$_POST["latitude"]."&lng=".$_POST["longitude"]."&username=rastino2020&style=full";

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