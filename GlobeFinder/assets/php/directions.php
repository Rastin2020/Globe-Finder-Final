<?php
	$query = "https://api.openrouteservice.org/v2/directions/foot-walking?api_key=5b3ce3597851110001cf624821d7e2b50c0c451ead00f829658913bf&start=".$_POST["longitude1"].",".$_POST["latitude1"]."&end=".$_POST["longitude2"].",".$_POST["latitude2"];

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