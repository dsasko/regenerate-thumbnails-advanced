jQuery(document).ready(function ($) {
    //no js error
    $('#no-js').addClass('hidden');
    $('#js-works').removeClass('hidden');

    //the main script
    var err_arr = [];
    var errors_obj = $('#rta .errors');
    var pbar = $("#rta #progressbar");

//    if the progressbar id exists
    if (pbar[0]) {
//        set the initial value to 0
        pbar.progressbar({
            value: 0
        });
    }
    var rta_butt = $('.button.RTA');

    var period = $('#rta_period');
    var fromTo = $('.fromTo');
    if (period[0] && fromTo[0]) {
        var datepickerInputs = $('.datepicker');
        if (datepickerInputs[0]) {
            datepickerInputs.datepicker({
                onSelect: function (valTo) {//min/max dates set
                    var dateStart = $('.datepicker.start');
                    var dateEnd = $('.datepicker.end');
                    if ($(this).hasClass('start')) {
                        dateEnd.datepicker("change", {minDate: valTo});
                    } else {
                        dateStart.datepicker("change", {maxDate: valTo});
                    }
                }
            });
        }
        period.change(function (value) {
            //if the date from-to option is selected
            if (parseInt($(this).val()) === 4) {
                fromTo.removeClass('hidden');//show the fields
            } else {
                fromTo.addClass('hidden');//Hide fields / keep the fields hidden
            }
        });
    }

    if (rta_butt[0]) {
        var logstatus = $('#rta .logstatus');
        var errstatus = $('#rta .errors');

        rta_butt.click(submit_ajax_call);
        //
        //LOOP REQUEST ... ajax request to call when the button is pressed
        //
        function submit_ajax_call() {
            logstatus.html('Processing...');
            errstatus.html('Processing...');
            err_arr = [];
            var period = $('#rta_period');
            var startTime = new Date().getTime();

            var dateStart = $('.datepicker.start');
            var dateEnd = $('.datepicker.end');
            var fromTo = '';
            if (dateStart.val() !== '' || dateEnd.val() !== '') {
                fromTo = dateStart.val() + '-' + dateEnd.val();
            }

            //    First Time Request
            loop_ajax_request('general', 0, -1, period.val(), startTime, fromTo);


        }
        //
        //
        // Main ajax call
        //
        //
        function loop_ajax_request(type, offset, tCount, period, startTime, fromTo) {

            //tha ajax data
            var data = {
                'action': 'rta_ajax',
                'type': type,
                'startTime': startTime,
                'period': period,
                'offset': offset,
                'fromTo': fromTo
            };
            // since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
            $.post(ajaxurl, data, function (response) {

                //var err_arr = new Array();
                //json response
                console.log(response);
                var json = JSON.parse(response);
                
//                console.log(json);
                var startTime = json.startTime;
                var offset = 0;
                var tCount = 0;
                
                var rta_total = $('#rta .info .total');
                var type = json.type;

                switch (type) {
                    case 'general':
                        
                        var period = $('#rta_period');
                        var rta_total = $('#rta .info .total');
                        var rta_processed = $('#rta .info .processed');
                        if (rta_total[0]) {
                            var json = JSON.parse(response);
                            rta_total.html(json.pCount);
                            rta_processed.html("0");
                        }

                        if (rta_total[0]) {
                            tCount = rta_total.html();
                        }
                        var startTime = new Date().getTime();
                        var fromTo = json.fromTo;
                        loop_ajax_request('submit', offset, tCount, json.period, startTime, fromTo);

                        break;
                    case 'submit':
                        if (rta_total[0]) {
                            tCount = rta_total.html();
                        }
                        var processed = $('#rta .info .processed');

                        var progressbar_percentage = $('#progressbar .progress-label');
                        if (processed[0] && rta_total.html() != 0) {
                            processed.html(json.offset);
                        }
                        tCount = parseInt(tCount);
                        response = parseInt(json.offset);
                        if (tCount >= response) {
                            offset = response;
                            var lPercentage = offset / tCount * 100;
                            if (pbar[0]) {
                                if (progressbar_percentage[0]) {
                                }
//                                set the initial value to 0
                                pbar.progressbar({
                                    value: lPercentage
                                });
                                lPercentage = Math.floor(lPercentage) + '%';
                                progressbar_percentage.html(lPercentage);
                            }
                            var processTime = new Date().getTime() - startTime;
                            processTime = processTime / 1000;
                            //Add to log
                            var logstatus = $('#rta .logstatus');
                            if (json.logstatus !== null && logstatus[0]) {
                                logstatus.append(json.logstatus + ' - in ' + processTime + ' seconds');
                            }
                            //call function again
                            if (tCount > response) {
                                //append unique errors
                                unique_arr_append(json.error);
                                //make a new request to the ajax call
                                var startTime = new Date().getTime();
                                fromTo = json.fromTo;
                                loop_ajax_request(type, offset, tCount, json.period, startTime, fromTo);
                            } else {
                                console.log('Processing Completed!');
                                var errStatus = $('#rta .errors');
                                var logstatus = $('#rta .logstatus');
                                logstatus.append('<br/>Completed !')
                                if (errStatus.html() == "Processing...") {
                                    errStatus.html('No Errors.');
                                }
                                //the loop ended show errors and messages
                                $.each(err_arr, function (index, value) {
                                    var final_val = '<div class="ui-state-error">' + value + '</div>';
                                    errors_obj.html(errors_obj.html() + final_val);
                                });

                            }
                        } else {
                            unique_arr_append(json.error);
                            //the loop ended show errors and messages
                            $.each(err_arr, function (index, value) {
                                var final_val = '<div class="ui-state-error">' + value + '</div>';
                                errors_obj.html(errors_obj.html() + final_val);
                            });
                        }
                        break;
                }
            });
        }
        // Append only unique array values
        function unique_arr_append(val) {
            var unique = true;
            var i = 0;
            var y = 0;
            while (val[i]) {
                unique = true;
                y = 0;
                while (err_arr[y]) {
                    if (err_arr[y] == val[i]) {
//                        console.log(err_arr[i]);
                        unique = false;
                        break;
                    }
                    y++;
                }
                if (unique) {
                    err_arr.push(val[i]);
                }
                i++;
            }

        }
    }
});