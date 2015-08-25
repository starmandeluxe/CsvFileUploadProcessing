<script type="text/javascript">


AJS.toInit(function() {
	var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    //if IE, don't allow
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        $('#iemessage').show();
        //disable all input fields
        $('#csvFile').prop("disabled", true);
        $('#csvControls').hide();
    }

    //check file extension on upload
    $('#csvFile').change(function(e) {

        var ext = this.value.split(".");

        if( ext.length === 1 || ( ext[0] === "" && ext.length === 2 ) ) {
            alert('Only CSV files are allowed to be uploaded.');
            //disable all controls if not CSV
            this.value='';
            $('#csvControls').hide();
            $('#createcsv').prop('disabled',true);
            return;
        }
        else {
            ext = ext.pop();
        }

        switch(ext)
        {
            case 'csv':
                //if it is a csv, determine how many columns it has
                //then add available columns to dropdown
                //and show all controls
                if (e.target.files != undefined) {

                    //first set the filename text to the label next to the upload button
                    $('#fname').html(e.target.files[0].name);
                    var r = new FileReader();

                    //parse the first line from the file to check num of columns
                    r.onload = function (e) {
                        // clear out all options in the dropdown
                        document.getElementById('colFilter').options.length = 0;
                        //add the "All" value
                        $('#colFilter').append($('<option/>', { value: "All", text : "All"}));

                        var firstLine = e.target.result.substr(0, e.target.result.indexOf("\n"));
                        //split by comma to count the number of columns in the file
                        var firstLineArray = firstLine.split(",");

                        for (var i = 0; i < firstLineArray.length; i++) {
                            //convert index to Excel letter
                            var value = colName(i).toUpperCase();
                            //add select box option each column in the csv
                            $('#colFilter').append($('<option/>', { value: value, text : value}));
                        }

                    };
                    r.readAsText(e.target.files[0]);
                    $('#csvControls').show();
                    $('#createcsv').prop('disabled',false);

                }
                break;
            default:
                //disable all controls if not CSV
                alert('Only CSV files are allowed to be uploaded.');
                this.value='';
                $('#fname').html("");
                $('#csvControls').hide();
                $('#createcsv').prop('disabled',true);
        }
    });

    //when the button is clicked, do the logic
    $('#createcsv').click(function() {
        var resultFlag = false;

        //get the file if it was uploaded and check it
        var f = document.getElementById('csvFile').files[0];
        var filter = $("input[name=filter]").val();


    	if (f == undefined) {
    		alert ("Please upload a CSV file first");
    	} else if (filter == "") {
    		alert("Please select or type in a filter!");
    	} else {
            //setup the output CSV to download
            var outputCsv = "data:text/csv;charset=utf-8,";
    		//read in the user-uploaded CSV
    		var reader = new FileReader();

            //check which encoding was selected, if any
            var encoding = $('input[type=radio]:checked').val();

            if (encoding == undefined) {
                alert("Please select the button for your file's correct encoding.");
                return;
            } else if (encoding == "Shift-JIS") {
                reader.readAsText(f, "Shift-JIS");
            } else if (encoding == "UTF-8") {
                reader.readAsText(f);
            }


    		reader.onload = function(event) {
                //read in all lines into an array
				var fileLines = event.target.result.split("\n");

				for (var i = 0; i < fileLines.length; i++) {
                    //if there is nothing in the line, break
                    if (fileLines[i] == "") {
                        break;
                    }
                    //create an array from each line in the file
                    var line = fileLines[i].split(',');



                    //check which column to filter on
                    var col = $('#colFilter').prop("selectedIndex");
                    //if not "All"...
                    if (col != 0) {
                        //decrement because All is zero
                        col--;
                        //if the csv line has the filter in it, write to output
                        if (line[col].indexOf(filter) > -1) {
                            resultFlag = true;
                            //construct the csv data with comma delimited values
                            var dataString = line.join(",");
                            outputCsv += i < fileLines.length ? dataString + "\n" : dataString;
                        }
                    }
                    else {
                        //check all columns for the filter text
                        for (var j = 0; j < line.length; j++) {
                            if (line[j].indexOf(filter) > -1) {
                                resultFlag = true;
                                //construct the csv data with comma delimited values
                                var dataString = line.join(",");
                                outputCsv += i < fileLines.length ? dataString + "\n" : dataString;
                            }
                        }
                    }
				}

                if (resultFlag) {
                    //create the CSV file
                    var encodedUri = encodeURI(outputCsv);
                    //create a ghost link to click on
                    //so we can download the file
                    var link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    var outFileName = "csvFilter_" + filter + ".csv";
                    link.setAttribute("download", outFileName);
                    document.body.appendChild(link);
                    link.click();
                }
                else {
                    alert("Nothing matched your filter. Please check your encoding.");
                }
    	   };
        }
    });
});

function colName(n) {
    var s = "";
    while(n >= 0) {
        s = String.fromCharCode(n % 26 + 97) + s;
        n = Math.floor(n / 26) - 1;
    }
    return s;
}

</script>