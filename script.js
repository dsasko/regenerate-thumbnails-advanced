jQuery(document).ready(function ($) {
    var pbar = $("#rta #progressbar");
//    When the page first loads
    loop_ajax_request('general', 0, -1, 0);
//    if the progressbar id exists
    if (pbar[0]) {
//        set the initial value to 0
        pbar.progressbar({
            value: 0
        });
    }
    var rta_butt = $('.button.RTA');
    if (rta_butt[0]) {
        rta_butt.click(submit_ajax_call);
        //
        //LOOP REQUEST ... ajax request to call when the button is pressed
        //
        function submit_ajax_call() {
            var offset = 0;
            var period = $('#rta_period');
            var rta_total = $('#rta .info .total');
            var tCount = 0;
            if (rta_total[0]) {
                tCount = rta_total.html();
            }
            loop_ajax_request('submit', offset, tCount, period.val());
        }
        //
        //
        // Main ajax call
        //
        //
        function loop_ajax_request(type, offset, tCount, period) {
            //tha ajax data
            var data = {
                'action': 'rta_ajax',
                'type': type,
                'period': period,
                'offset': offset
            };
            // since 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php
            $.post(ajaxurl, data, function (response) {

                switch (type) {
                    case 'general':
                        var rta_total = $('#rta .info .total');
                        if (rta_total[0]) {
                            var json = JSON.parse(response);
                            rta_total.html(json.pCount);
                        }
                        break;
                    case 'submit':
                        var processed = $('#rta .info .processed');
                        var progressbar_percentage = $('#progressbar .progress-label');
                        if (processed[0]) {
                            processed.html(response);
                        }
                        if (tCount > response) {
                            offset = response;

                            var lPercentage = offset / tCount * 100;
                            lPercentage = Math.round(lPercentage)+'%';
                            if (pbar[0]) {
                                if(progressbar_percentage[0]){
                                    progressbar_percentage.html(lPercentage);
                                }
//                                set the initial value to 0
                                pbar.progressbar({
                                    value: lPercentage
                                });
                            }
                            //call function again
                            loop_ajax_request(type, offset, tCount, period);
                        }
                        break;
                }
            });
        }
    }
});