$(document).ready(function () {
    $('#jqxSwitchButton').jqxSwitchButton({ height: 25, width: 61, checked: true });
    $('#jqxSwitchButton').on('change', function (event) {
        console.log(event.args.check);
    });
});