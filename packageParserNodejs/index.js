var bcv_parser = require("bible-passage-reference-parser/js/en_bcv_parser").bcv_parser;
var bcv = new bcv_parser;

var inputFile = './input/dt_dump.json';

var output = [];

var lines = require('fs').readFileSync(inputFile, 'utf-8')
    .split('\n')
    .filter(Boolean);

for (var i = lines.length - 1; i >= 0; i--) {
	var strLine = lines[i].replace("\"", "");
	var line = JSON.parse(lines[i]);
	addScriptureRefs(line);
}

console.log('\n\n\n\n************completed***********\n\n\n\n');

console.log("length of message :" + "{\"id\": 1361, \"type\": \"message\"}\n\n".length);
console.log("length of response :" + "{\"id\": 2708, \"type\": \"response\"}\n\n".length);


function addScriptureRefs(i) {
	console.log("line: " + JSON.stringify(i));

	var content = i["content"];

		var question  = content.substring(content.indexOf("}\n\n")+3, content.length);
		console.log(question);
	
		bcv.parse(question);
	
		for(var e in bcv["entities"]) {
			if (bcv["entities"][e]["type"] && (bcv["entities"][e]["type"] == "bc" || bcv["entities"][e]["type"] == "bcv")) {
				var type = bcv["entities"][e]["type"];
				var start = bcv["entities"][e]["absolute_indices"][0];
				var end = bcv["entities"][e]["absolute_indices"][1];
				var text = question.substring(start,end);

				start = content.indexOf(text);
				end = start + text.length;
	
				console.log(type + " " + start + " " + end + " " + text);

				console.log("compare text: " + text  + " : " + content.substring(start,end));	

				var annotationResult = {
					label: ["scripture_reference"],
					points: [{
						start: start,
						end: end,
						text: text
					}]
				}

				console.log(JSON.stringify(annotationResult));
	
				if(!i["annotation"]){
					i["annotation"] = {}
				}
				if(!i["annotation"]["annotationResult"]){
					i["annotation"]["annotationResult"] = []
				}


				i["annotation"]["annotationResult"].push(annotationResult);
			}
		}

	output.push(JSON.stringify(i));
}


var outputString = "";

for (i in output) {
	outputString += output[i];
	outputString += '\n';
}


var fs = require('fs');

var outputFilename = './output/bcv_parser_output.json';

fs.writeFile(outputFilename, outputString, function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("JSON saved to " + outputFilename);
    }
});






