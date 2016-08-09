/**
 * Created by i-zhangshuai on 2016/8/8.
 */

/*正在编写中，还未进行封装*/
(function (window, undefined) {

    window.onload = function () {


        var table = document.getElementsByClassName("calendar-dis")[0];

        function renderCalender() {

            var defYear = 2016,
                defMonth = 6,
                defDay = 8;

            var month_day = [31, 28+isLeapYear(defYear), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var firstDay = getFirstDayOfMonth();

            var temp_html = '';
            //前面空出的格数
            var monthRows = Math.ceil((firstDay + month_day[5]) / 7);
            var td_num,
                day_num,
                diff_now,
                diff_set;
            var disabled;

            for(var i = 0; i < monthRows; i++) {
                temp_html += "<tr>";
                for(var j = 0; j < 7; j++) {
                    td_num = i * 7 + j;
                }
            }
        }

        function isLeapYear(year) {
            return ((year % 100 !== 0 && year % 4 === 0) || year % 400 === 0) ? 1 : 0;
        }
        
        /*得到这个月第一天是星期几*/
        function getFirstDayOfMonth() {
            var tmp_date = new Date(2016, 5, 1);
            var firstDay = tmp_date.getDay();

            //根据设置每周第一天是周几，来判断出第一天应该在的位置,即从哪里开始渲染
            return firstDay - 1 < 0 ? (firstDay + 7) : (firstDay - 1);
        }

        getFirstDayOfMonth();
        
    }

})(window);