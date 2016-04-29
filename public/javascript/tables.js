/* eslint-env browser */
/* eslint prefer-arrow-callback: 0, object-shorthand: 0, new-cap: 0, no-invalid-this: 0, no-var: 0*/
/* globals $: false, moment: false */

'use strict';

$('.data-table').each(function () {
    var rowSort = $(this).data('rowSort') || false;
    var columns = false;

    if (rowSort) {
        columns = rowSort.split(',').map(function (sort) {
            return {
                orderable: sort === '1'
            };
        });
    }

    $(this).DataTable({
        scrollX: true,
        order: [
            [1, 'asc']
        ],
        columns: columns,
        pageLength: 50
    });
});

$('.data-table-ajax').each(function () {
    var rowSort = $(this).data('rowSort') || false;
    var columns = false;

    var topicUrl = $(this).data('topicUrl') || '/lists';
    var topicArgs = $(this).data('topicArgs') || false;
    var topicId = $(this).data('topicId') || '';

    var sortColumn = Number($(this).data('sortColumn')) || 1;
    var sortOrder = ($(this).data('sortOrder') || 'asc').toString().trim().toLowerCase();

    // allow only asc and desc
    if (sortOrder !== 'desc') {
        sortOrder = 'asc';
    }

    var ajaxUrl = topicUrl + '/ajax/' + topicId + (topicArgs ? '?' + topicArgs : '');

    if (rowSort) {
        columns = rowSort.split(',').map(function (sort) {
            return {
                orderable: sort === '1'
            };
        });
    }

    $(this).DataTable({
        scrollX: true,
        serverSide: true,
        ajax: {
            url: ajaxUrl,
            type: 'POST'
        },
        order: [
            [sortColumn, sortOrder]
        ],
        columns: columns,
        pageLength: 50,
        processing: true
    }).on('draw', function () {
        $('.datestring').each(function () {
            $(this).html(moment($(this).data('date')).fromNow());
        });
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
