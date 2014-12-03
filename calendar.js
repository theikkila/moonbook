angular.module('moonbook.calendar',  []).directive('moonbookCalendar', function ($parse) {
  return {
    restrict: 'AEC',
    templateUrl: 'calendarTemplate.html',
    scope: {
        multiple: '=',
        selected: '=',
        imonth: '=month',
        year: '=',
        readOnly: '=',
        baseprice: '=',
        days: '='
    },

    link: function (scope, element, attr) {
        // SetUP
        scope.month = [];
        var isMouseDown = false;
        element.on('mouseup', function(){
            isMouseDown = false;
        });
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var days_lib = {};
        function dateT(dt) {
            return dt.getUTCFullYear() + '-' + (dt.getUTCMonth() + 1) + '-' + (dt.getUTCDate());
        }
        function generateUUID(){
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        };
        function weekCount(year, month_number) {
            // month_number is in the range 1..12
            var firstOfMonth = new Date(year, month_number-1, 1);
            var lastOfMonth = new Date(year, month_number, 0);
            var used = firstOfMonth.getDay() + lastOfMonth.getDate();
            return Math.ceil( used / 7);
        }
        function buildMonth(year, month_number) {
            scope.month = [];
            var firstDay = new Date(year, month_number-1, 1).getDay()-1;
            var lastDay = new Date(year, month_number, 0).getDate();
            var d = 0;
            for (var i = 0; i < weekCount(year, month_number); i++) {
                scope.month[i] = [];
                for (var c = 0; c < 7; c++) {
                    if ((c < firstDay && d == 0) || d >= lastDay) {
                        scope.month[i][c] = {notmonth: true, id: generateUUID()};
                    } else {
                        d++;
                        var dt = new Date(year, month_number-1, d)
                        var dt_text = dateT(dt);
                        scope.month[i][c] = {notmonth: false, dayOfMonth: d, date: dt, id: generateUUID()};
                        var dobj = days_lib[dt_text];
                        scope.month[i][c].available = true;
                        scope.month[i][c].title = scope.baseprice + '€';
                        if (!dobj) { continue; }
                        scope.month[i][c].title = ((dobj.price == null) ? scope.baseprice : dobj.price)+'€';
                        scope.month[i][c].na = !((dobj.bookable == null) ? false : dobj.bookable);
                        if (scope.month[i][c].na) {
                            scope.month[i][c].title = "Not available";
                        }
                        if (dobj.booked) {
                            scope.month[i][c].booked = true;
                            scope.month[i][c].available = false;
                            scope.month[i][c].na = false;
                            scope.month[i][c].title = "Booked";
                            scope.month[i][c].misc = dobj;
                        };
                        scope.month[i][c].available = !scope.month[i][c].na;

                    }
                };
            };
        } 
        scope.$watch('baseprice', function() {
            buildMonth(parseInt(scope.year), parseInt(scope.imonth));
        });
        scope.$watch('days', function () {
            days_lib = {};
            for (var i = scope.days.length - 1; i >= 0; i--) {
                (function(day){
                    var dt = new Date(scope.days[i].date*1000);
                    var date = dateT(dt);
                    if (days_lib[date]) {
                        if ('order' in scope.days[i]) {
                            days_lib[date].booked = scope.days[i].booked
                            days_lib[date].order = scope.days[i].order
                            days_lib[date].deal_id = scope.days[i].id
                            days_lib[date].booker_id = scope.days[i].booker_id
                            days_lib[date].artist_id = scope.days[i].artist_id
                            days_lib[date].status = scope.days[i].status
                        }
                    } else {
                        days_lib[date] = {price: scope.days[i].price, order: scope.days[i].order, deal_id: scope.days[i].id, booker_id: scope.days[i].booker_id, artist_id: scope.days[i].artist_id, status: scope.days[i].status, booked: scope.days[i].booked, bookable: scope.days[i].bookable};    
                    }
                })(scope.days[i]);
            };
            buildMonth(parseInt(scope.year), parseInt(scope.imonth));
        });
        scope.$watch('imonth', function(){
            scope.monthName = monthNames[scope.imonth-1];
            buildMonth(parseInt(scope.year), parseInt(scope.imonth));

        });
        scope.$watch('year', function(){
            buildMonth(parseInt(scope.year), parseInt(scope.imonth));
        });
        scope.$watch('multiple', function(){
            scope.selected = [];
            buildMonth(parseInt(scope.year), parseInt(scope.imonth));
        });
        // Watch for selected
        scope.$watch('selected', function (selected, oldselected) {
            for (var i = oldselected.length - 1; i >= 0; i--) {
                el = document.getElementById(oldselected[i].element);
                el.classList.remove('selected');
                el.dataset['selected'] = false;
            };
            for (var i = scope.selected.length - 1; i >= 0; i--) {
                el = document.getElementById(selected[i].element);
                el.classList.add('selected');
                el.dataset['selected'] = true;
            };
        }, true);
        scope.mousedown = function ($event) {

            isMouseDown = true;
            $event.preventDefault();
            scope.select($event);
        }
        scope.mouseover = function ($event) {
            if (isMouseDown) {
                scope.select($event);
            }
        }
        // onClick event handler
        scope.select = function ($event) {
            //console.log($event.currentTarget, $event.target);
            var trg = $event.currentTarget;
            if (trg.dataset['notmonth'] === "true") { return; };
            if (scope.readOnly && trg.dataset['url'] !== '') {
                window.location = trg.dataset['url'];
            }
            if (scope.readOnly) {
                return;
            };
            if (trg.dataset['selected'] && trg.dataset['selected'] === "true") {
                // unselect
                var day = trg;
                _.remove(scope.selected, function(obj) {
                    return (new Date(obj.day)).getTime() == (new Date(day.dataset['date'].replace(/\"/g, ''))).getTime();
                });
            } else {
                trg.classList.add('selected');
                trg.dataset['selected'] = true;
                var that = trg;
                if (!scope.multiple) {
                    for (var i = scope.selected.length - 1; i >= 0; i--) {
                        el = document.getElementById(scope.selected[i].element);
                        el.dataset['selected'] = false;
                        el.classList.remove('selected');
                    };
                    scope.selected = [];
                }
                scope.selected.push({day: new Date(that.dataset['date'].replace(/\"/g, '')), element: that.id});
            }
        };
    }
}
});
