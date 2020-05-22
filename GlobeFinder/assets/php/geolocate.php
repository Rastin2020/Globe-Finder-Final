<?php
	$apiKey = "26b718918a77458a892aed782e8e6016";

	$query = "https://api.opencagedata.com/geocode/v1/json/?q=".$_POST["latitude"]."%2C%20".$_POST["longitude"]."&key=".$apiKey."&language=en&pretty=1";
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