<?php

header("Content-type:application/json");

$api_schoolName = "Oekumenisches-Gymnasium";

$api_date = date("Ymd");

$api_dateOffset = 0;
if(isset($_GET["dateOffset"])) {
    $api_dateOffset = $_GET["dateOffset"];

    if (filter_var($api_dateOffset, FILTER_VALIDATE_INT) === false ) {
        $api_dateOffset = 0;
    }
}

$api_URL = "https://ajax.webuntis.com/WebUntis/monitor/substitution/data?school=$api_schoolName";

$api_json = "{
	\"formatName\": \"Vertretungsplan Flur\",
	\"schoolName\": \"$api_schoolName\",
	\"date\": $api_date,
	\"dateOffset\": $api_dateOffset,
	\"strikethrough\": false,
	\"mergeBlocks\": true,
	\"showOnlyFutureSub\": false,
	\"showBreakSupervisions\": true,
	\"showTeacher\": true,
	\"showClass\": true,
	\"showHour\": true,
	\"showInfo\": true,
	\"showRoom\": true,
	\"showSubject\": true,
	\"groupBy\": 1,
	\"hideAbsent\": false,
	\"departmentIds\": [],
	\"departmentElementType\": -1,
	\"hideCancelWithSubstitution\": true,
	\"hideCancelCausedByEvent\": false,
	\"showTime\": false,
	\"showSubstText\": true,
	\"showAbsentElements\": [
		1
	],
	\"showAffectedElements\": [
		1
	],
	\"showUnitTime\": true,
	\"showMessages\": true,
	\"showStudentgroup\": true,
	\"enableSubstitutionFrom\": false,
	\"showSubstitutionFrom\": 1615,
	\"showTeacherOnEvent\": true,
	\"showAbsentTeacher\": true,
	\"strikethroughAbsentTeacher\": true,
	\"activityTypeIds\": [
		2,
		3
	],
	\"showEvent\": true,
	\"showCancel\": true,
	\"showOnlyCancel\": false,
	\"showSubstTypeColor\": true,
	\"showExamSupervision\": true,
	\"showUnheraldedExams\": true
}";

$context = stream_context_create(
    array(
        'http' => array(
            'method'  => 'POST', // Request Method
            'header'  => 'Content-type: application/json', // Request Headers
            'content' => $api_json // Request Content
        )
    )
);

$contents = file_get_contents($api_URL, false, $context);

echo $contents;

?>