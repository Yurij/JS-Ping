<?php
$arr == array();
$minfo = json_decode(file_get_contents('php://input'), true);
if($_GET['a'] === 'resolv'){
	if($ip = gethostbyname($minfo['ip'])){
		if(!filter_var($ip, FILTER_VALIDATE_IP)){
			$arr['error'] = 1;
		}
	}
	$arr['host'] = $ip ? $ip : htmlspecialchars($minfo['ip']);
	if(!$arr['host']){
		$arr['error'] = 1;
	}
}
else{
	if(filter_var($minfo['ip'], FILTER_VALIDATE_IP)){
		ob_start();
		system("ping -c 1 -W 2000 ".$minfo['ip']." | awk '/time=/{split($7,a,/\=/);x=a[2]} END{print x}'");
		$buffer = ob_get_contents();
		ob_end_clean();
		if(!trim($buffer)){
			$arr['error'] = 2;
		}
		else{
			$arr['bytes'] = '64';
			$arr['ttl'] = '58';
			$arr['time'] = floatval($buffer);
		}
		//sleep(1);
	}
}
header('Content-Type: application/json');
echo json_encode($arr);
