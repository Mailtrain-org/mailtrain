/* eslint-env browser */
/* eslint prefer-arrow-callback: 0, object-shorthand: 0, new-cap: 0, no-invalid-this: 0, no-var: 0*/
/* globals $: false, moment: false */

'use strict';

(function() {
    function refreshTargets(data) {
        for (var target in data) {
            var newContent = $(data[target]);

            $(target).replaceWith(newContent);
            installHandlers(newContent.parent());
        }
    }

    function getAjaxUrl(self) {
        var topicId = self.data('topicId');
        var topicUrl = self.data('topicUrl');

        return topicUrl + '/ajax/' + topicId;
    }

    function setupAjaxRefresh() {
        var self = $(this);
        var ajaxUrl = getAjaxUrl(self);

        var interval = Number(self.data('interval')) || 60;

        setTimeout(function () {
            $.get(ajaxUrl, function(data) {
                refreshTargets(data);
            });

        }, interval * 1000);
    }

    function setupAjaxAction() {
        var self = $(this);
        var ajaxUrl = getAjaxUrl(self);

        var processing = false;

        self.click(function () {
            if (!processing) {
                $.get(ajaxUrl, function (data) {
                    refreshTargets(data);
                });

                processing = true;
            }

            return false;
        });
    }

    function setupDatestring() {
        var self = $(this);
        self.html(moment(self.data('date')).fromNow());
    }


    function getDataTableOptions(elem) {
        var rowSort = $(elem).data('rowSort') || false;

        var columns = false;

        var sortColumn = $(elem).data('sortColumn') === undefined ? 1 : Number($(elem).data('sortColumn'));
        var sortOrder = ($(elem).data('sortOrder') || 'asc').toString().trim().toLowerCase();

        var paging = $(elem).data('paging') === false ? false : true;

        // allow only asc and desc
        if (sortOrder !== 'desc') {
            sortOrder = 'asc';
        }

        var columnsCount = 0;
        var columnsSort = []

        if (rowSort) {
            columns = rowSort.split(',').map(function (sort) {
                return {
                    orderable: sort === '1'
                };
            });
        }

        var opts = {
            scrollX: true,
            order: [
                [sortColumn, sortOrder]
            ],
            columns: columns,
            paging: paging,
            info: paging, /* This controls the "Showing 1 to 16 of 16 entries" */
            pageLength: 50
        };

        if ($(elem).hasClass('data-table-selectable') || $(elem).hasClass('data-table-multiselectable')) {
            var isMulti = $(elem).hasClass('data-table-multiselectable');

            var dataElem = $(elem).siblings("input").first();

            opts.rowCallback = function( row, data ) {
                var selected = dataElem.val() == '' ? [] : dataElem.val().split(',').map(function(item) { return Number(item); });

                if (!isMulti && selected.length > 0) {
                    selected = [selected[0]];
                }

                if ($.inArray(data.DT_RowId, selected) !== -1) {
                    $(row).addClass('selected');
                }
            }

            $(elem).on('click', 'tbody tr', function () {
                var id = this.id;
                var selected = dataElem.val() == '' ? [] : dataElem.val().split(',');

                var index = $.inArray(id, selected);

                if (isMulti) {
                    if ( index === -1 ) {
                        selected.push(id);
                    } else {
                        selected.splice(index, 1);
                    }

                    $(this).toggleClass('selected');
                } else {
                    for (var selIdx=0; selIdx < selected.length; selIdx++) {
                        if (selected[selIdx] != id) {
                            $('#' + selected[selIdx], elem).removeClass('selected');
                        }
                    }

                    $('#' + id, elem).addClass('selected');

                    selected = [id];
                }

                dataElem.val(selected.join(','));
            } );
        }

        return opts;
    }


    function installHandlers(elem) {
        $('.ajax-refresh', elem).each(setupAjaxRefresh);
        $('.ajax-action', elem).each(setupAjaxAction);
        $('.datestring', elem).each(setupDatestring);
    }

    installHandlers($(document));

    $('.data-table').each(function () {
        var opts = getDataTableOptions(this);
        $(this).DataTable(opts);
    });

    $('.data-table-ajax').each(function () {
        var topicUrl = $(this).data('topicUrl') || '/lists';
        var topicArgs = $(this).data('topicArgs') || false;
        var topicId = $(this).data('topicId') || '';

        var ajaxUrl = topicUrl + '/ajax/' + topicId + (topicArgs ? '?' + topicArgs : '');

        var opts = getDataTableOptions(this);
        opts.ajax = {
            url: ajaxUrl,
            type: 'POST'
        };
        opts.serverSide = true;
        opts.processing = true;

        opts.createdRow = function( row, data, dataIndex ) {
            installHandlers($(row));
        }

        $(this).DataTable(opts).on('draw', function () {
            $('.datestring').each(setupDatestring);
        });
    });

    $('.data-stats-pie-chart').each(function () {
        var column = $(this).data('column') || 'country';
        var limit = $(this).data('limit') || 20;
        var topicId = $(this).data('topicId');
        var topicUrl = $(this).data('topicUrl') || '/campaigns/clicked';
        var ajaxUrl = topicUrl + '/ajax/' + topicId + '/stats';
        var self = $(this);

        $.post(ajaxUrl, {column: column, limit: limit}, function(data) {
          google.charts.load('current', {'packages':['corechart']});
          google.charts.setOnLoadCallback(drawChart);

          function drawChart() {
            var gTable = new google.visualization.DataTable();
            gTable.addColumn('string', 'Column');
            gTable.addColumn('number', 'Value');
            gTable.addRows(data.data);

            var options = {'width':500, 'height':400};
            var chart = new google.visualization.PieChart(self[0]);
            chart.draw(gTable, options);
          }
        });
    });

    $('.datestring').each(function () {
        $(this).html(moment($(this).data('date')).fromNow());
    });

    $('.delete-form,.confirm-submit').on('submit', function (e) {
        if (!confirm($(this).data('confirmMessage') || 'Are you sure? This action can not be undone')) {
            e.preventDefault();
        }
    });

    $('.fm-date-us.date').datepicker({
        format: 'mm/dd/yyyy',
        weekStart: 0,
        autoclose: true
    });

    $('.fm-date-eur.date').datepicker({
        format: 'dd/mm/yyyy',
        weekStart: 1,
        autoclose: true
    });

    $('.fm-date-generic.date').datepicker({
        format: 'yyyy-mm-dd',
        weekStart: 1,
        autoclose: true
    });

    $('.fm-birthday-us.date').datepicker({
        format: 'mm/dd',
        weekStart: 0,
        autoclose: true
    });

    $('.fm-birthday-eur.date').datepicker({
        format: 'dd/mm',
        weekStart: 1,
        autoclose: true
    });

    $('.fm-birthday-generic.date').datepicker({
        format: 'mm-dd',
        weekStart: 1,
        autoclose: true
    });

    $('.page-refresh').each(function () {
        var interval = Number($(this).data('interval')) || 60;
        setTimeout(function () {
            window.location.reload();
        }, interval * 1000);
    });


    $('.click-select').on('click', function () {
        $(this).select();
    });

    if (typeof moment.tz !== 'undefined') {
        (function () {
            var tz = moment.tz.guess();
            if (tz) {
                $('.tz-detect').val(tz);
            }
        })();
    }

    // setup SMTP check
    var smtpForm = document.querySelector('form#smtp-verify');
    if (smtpForm) {
        smtpForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var form = document.getElementById('settings-form');
            var formData = new FormData(form);
            var result = fetch('/settings/smtp-verify', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            var $btn = $('#verify-button').button('loading');

            result.then(function (res) {
                return res.json();
            }).then(function (data) {
                alert(data.error ? 'Invalid Mailer settings\n' + data.error : data.message);
                $btn.button('reset');
            }).catch(function (err) {
                alert(err.message);
                $btn.button('reset');
            });

        });
    }

})();

