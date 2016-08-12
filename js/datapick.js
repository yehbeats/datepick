/**
 * Created by i-zhangshuai on 2016/8/9.
 */

/*
* 默认的基础设置
* targetInput：目标文本
* beginYear：开始年份
* endYear：结束年份
* type：日期显示格式
* firDayOfWeek：一周以周几开始显示 {1:'周一', 2:'周二', 3:'周三', 4:'周四', 5:'周五', 6:'周六', 0:'周日'}
* */
var defaultConf = {
    targetInput : '',
    beginYear: 1901,
    endYear: 2099,
    type: 'yyyy-mm-dd',
    firDayOfWeek: 1,
    language: {
        year: '年',
        month: '月',
        monthList: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        weekList:[ '日', '一', '二', '三', '四', '五', '六'],
        time: '时间',
        today: '今天',
        clear: '清除'
    }
};

function Calendar(options) {
    this.options = this.extend(defaultConf, options);
    this.targetInput = this.options.targetInput;
    this.date = new Date();   //this.date存储用户所选的值，若没有，则默认今天
    this.now = new Date();
    this.doms = {};          //存储需要交互的dom节点
    this.init();
    this.bindEvent();
}

Calendar.prototype = {
    /**
     * @description 日期面板初始化
     */
    init: function () {
        this.renderPanel();
        this.hide();
    },

    /**
     * @description 构造整个日期面板
     */
    renderPanel: function () {
        var options = this.options;
        var self = this;

        //判断输入框是否有日期，被选中日期用白色背景显示
        if(this.targetInput.value.length > 0) {
            this.date = this.dateParse(this.targetInput.value);
        }

        var YEAR = this.date.getFullYear(),
            MONTH = this.date.getMonth() + 1,
            DAY = this.date.getDate();

        var saturday = 6 - options.firDayOfWeek,
            sunday = (7 - options.firDayOfWeek) >= 7 ? 0 : (7 - options.firDayOfWeek);

        //创建主面板
        var calendarPane = document.createElement('div');
        calendarPane.id = 'calendar';
        calendarPane.className = 'calendar';

        //创建header
        var header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = '<a class="circle fl" id="preMonth"><span class="triangle-left center"></span></a>' +
            '<a class="circle fr" id="nextMonth"><span class="triangle-right center"></span></a>';

        //创建两个select的option选项 分别是month 和 year
        var monthHtml = '',
            yearHtml = '';
        options.language.monthList.forEach(function (item, i) {
            monthHtml += '<option value="'+i+'">'+item+'</option>';
        });

        for(var i = options.beginYear; i <= options.endYear; i++) {
            yearHtml += '<option value="'+i+'">'+i+'</option>';
        }

        //创建date-pick
        var datePick = document.createElement('div');
        datePick.className = 'date-pick';
        datePick.id = 'picker';
        datePick.innerHTML = '<select class="month-pick" id="pickMonth">'+monthHtml+'</select><select class="year-pick" id="pickYear">'+yearHtml+'</select>';

        //创建table
        var table = document.createElement('table');
        table.className = 'calendar-dis';
        var tableHtml = '<thead><tr>';
        for(var i = 0; i < 7; i++) {
            tableHtml += '<th>';
            var tmp = i + options.firDayOfWeek;
            tableHtml += tmp < 7 ? options.language.weekList[tmp] : options.language.weekList[tmp - 7];
            tableHtml += '</th>';
        }
        tableHtml += '</tr><thead><tbody></tbody></tbody>';
        table.innerHTML = tableHtml;

        //创建footer
        var footer = document.createElement('div');
        footer.className = 'footer';
        footer.innerHTML = '<div class="date-time"><span class="time-label">'+options.language.time+'</span><span class="time-dis">00 : 00 : 00</span> </div> ' +
            '<div class="date-opr"><a class="date-today">'+options.language.today+'</a><a class="date-clear">'+options.language.clear+'</a> </div>';

        //组装各个元素
        header.appendChild(datePick);
        calendarPane.appendChild(header);
        calendarPane.appendChild(table);
        calendarPane.appendChild(footer);

        document.body.appendChild(calendarPane);

        this.doms.calendarPane = calendarPane;

        //渲染时间
        setInterval(this.renderTime.bind(this), 1000);

        //渲染table所需的各种值
        this.saturday = saturday;
        this.sunday = sunday;
        this.doms.tbody = calendarPane.getElementsByTagName('tbody')[0];
        this.doms.preMonth = document.getElementById('preMonth');
        this.doms.nextMonth = document.getElementById('nextMonth');
        this.doms.picker = document.getElementById('picker');
        this.doms.pickMonth = document.getElementById('pickMonth');
        this.doms.pickYear = document.getElementById('pickYear');
        this.doms.timeShow = calendarPane.getElementsByClassName('time-dis')[0];
        this.doms.dateOpr = calendarPane.getElementsByClassName('date-opr')[0];

        this.YEAR = YEAR;
        this.MONTH = MONTH;

        console.log('renderPane'+this.MONTH+':'+this.YEAR);

        this.renderTable(MONTH, YEAR);
    },

    /**
     * @description 根据月份和年份渲染面板的主要结构日期显示部分
     * @param {Number} month
     * @param {Number} year
     */
    renderTable: function (month, year) {
        console.log(year + " : " + month);
        if(month < 1) {
            year --;
            month = 12;
        }else if(month > 12) {
            year ++;
            month = 1;
        }
        this.renderSelector(month, year);

        this.YEAR = year;
        this.MONTH = month;

        var currentMonth = month --,
            currentDays = this.getDaysOfMonth(year, currentMonth),
            preMonth = currentMonth - 1,
            preDays = this.getDaysOfMonth(year, preMonth),
            nextMonth = currentMonth + 1;

        var firstDay = this.getPositionOfBeginRender(year, month);
        // var rows = Math.ceil((firstDay + currentDays) / 7);
        var rows = 6;
        var tdNum,
            dayNum;
        var classMonth = '',
            classDay = 'state-default';
        var tmpHtml = '';
        for(var i = 0; i < rows; i++) {
            tmpHtml += '<tr>';
            for(var j = 0; j < 7; j++) {
                tdNum = i * 7 + j;
                dayNum = tdNum - firstDay + 1;
                if(dayNum <= 0) {
                    dayNum += preDays;
                    classMonth = 'pre-month';
                }else if(dayNum > currentDays) {
                    dayNum -= currentDays;
                    classMonth = 'next-month';
                }else {
                    classMonth = 'now-month';
                    if(dayNum === this.date.getDate() && year === this.date.getFullYear() && currentMonth === (this.date.getMonth() + 1)) {
                        classDay = 'state-choose';
                    }
                    if(dayNum === this.now.getDate() && year === this.now.getFullYear() && currentMonth === (this.now.getMonth() + 1)) {
                        classDay = 'state-active';
                    }
                }

                if(j === this.saturday || j === this.sunday) {
                    classDay = classDay + ' week';
                }
                tmpHtml += '<td class="'+classMonth+'"><a class="'+classDay+'">'+dayNum+'</a></td>';

                classDay = 'state-default';
            }
            tmpHtml += '</tr>';
        }
        this.doms.tbody.innerHTML = tmpHtml;
    },

    /**
     * @description 将输入框中的字符串变为Date对象
     * @param {String} dateStr  用户输入框中的格式化的日期字符串
     * @return {Date} 根据字符串生成的日期对象
     */
    dateParse: function (dateStr) {
        dateStr = dateStr.replace(/-/g, '/');
        return new Date(Date.parse(dateStr));
    },

    /**
     * @description 判断是否为闰年
     * @param {Number} year  传入需要判断的年份
     * @return {Number} 返回1或0
     * @example isLeapYear(2016) ==> 1
     */
    isLeapYear: function (year) {
        return ((year % 100 !== 0 && year % 4 === 0) || year % 400 === 0) ? 1 : 0;
    },

    /**
     * @description 根据年份和月份得到该月的天数
     * @param {Number} year  年份
     * @param {Number} month  月份
     * @return {Number} 天数
     * @example getDaysOfMonth(2016， 8) ==> 31
     */
    getDaysOfMonth: function (year, month) {
        var d = new Date(year, month, 0);
        return d.getDate();
    },

    /**
     * @description 开始table渲染的位置，得到这个月第一天是周几，再根据用户设置的以周几开始渲染
     * @param {Number} year  年份
     * @param {Number} month  月份
     * @return {Number} 位置 0-6
     * @example getPositionOfBeginRender(2016， 8) ==> 0 <用户设置为1，8月第一天是周一，所以从0处开始渲染>
     */
    getPositionOfBeginRender: function (year, month) {
        var tmpDate = new Date(year, month, 1);
        var firstDay = tmpDate.getDay();
        var firDayOfWeek = this.options.firDayOfWeek;

        //根据设置每周第一天是周几，来判断出第一天应该在的位置,即从哪里开始渲染
        return firstDay - firDayOfWeek < 0 ? ((firstDay - firDayOfWeek) + 7) : (firstDay - firDayOfWeek);
    },


    //根据日期和年份取得该月的天数
    getDaysOfMonthNowYear: function (year, month) {
        var days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return month === 2 ? (this.isLeapYear(year) + days[month]) : days[month];
    },

    /**
     * @description 绑定各种事件
     */
    bindEvent: function () {
        var options = this.options,
            doms = this.doms,
            self = this;

        //阻止整个面板click事件向上冒泡
        doms.calendarPane.onclick = function (e) {
            e.stopPropagation();
        };

        options.targetInput.onclick = function (e) {
            e.stopPropagation();
            self.show();
        };
        document.onclick = function () {
            self.hide();
        };

        //事件代理，对tbody添加监听，选择日期事件
        doms.tbody.onclick = function (e) {

            var node = e.target;
            var day,
                dateStr;
            if(node.parentNode.className.indexOf('now-month') !== -1) {
                day = Number(node.text);
                self.updateDate(self.YEAR, self.MONTH, day);
                dateStr = self.parseDate(day);
                self.targetInput.value = dateStr;
                self.renderTable(self.MONTH, self.YEAR);
                self.hide();
            }
        };

        //上一月事件
        doms.preMonth.onclick = function (e) {

            self.MONTH --;
            self.renderTable(self.MONTH, self.YEAR);
        };

        //下一月事件
        doms.nextMonth.onclick = function (e) {

            self.MONTH ++;
            self.renderTable(self.MONTH, self.YEAR);
        };

        //事件代理，月份selector/年份selector
        doms.picker.onchange = function (e) {
            e.stopPropagation();
            var node = e.target;
            if(node.id === 'pickMonth') {
                self.MONTH = Number(node.value) + 1;
            }else if(node.id === 'pickYear') {
                self.YEAR = Number(node.value);
            }
            self.renderTable(self.MONTH, self.YEAR);
        };


        //事件代理，日期操作
        doms.dateOpr.onclick = function (e) {

            var node = e.target;
            if(node.className.indexOf('today') !== -1) {
                self.date = self.now;
                self.YEAR = self.date.getFullYear();
                self.MONTH = self.date.getMonth() + 1;
                self.renderTable(self.MONTH, self.YEAR);
            }else if(node.className.indexOf('clear') !== -1) {
                self.targetInput.value = '';
            }
        }
    },

    updateDate: function (year, month, day) {
        this.date = new Date(year, month - 1, day);
    },


    parseDate: function (day) {
        var options = this.options;
        var year = this.YEAR,
            month = this.MONTH < 10 ? ('0' + this.MONTH) : (''+this.MONTH),
            day = day < 10 ? ('0' + day) : ('' + day);
        if(options.type === 'yyyy-mm-dd') {
            return year + '-' + month + '-' + day;
        }else if(options.type === 'dd-mm-yy') {
            return day + '-' + month + '-' + year;
        }

    },

    //返回时间
    dateTime: function (date) {
        var hour = date.getHours(),
            minute = date.getMinutes(),
            second = date.getSeconds();
        hour = hour < 10 ? '0'+hour : ''+hour;
        minute = minute < 10 ? '0'+minute : ''+minute;
        second = second < 10 ? '0'+second : ''+second;

        return hour + ' : ' + minute + ' : ' + second;
    },

    /**
     * @description 整个日期面板的显示，根据输入框input距文档顶部和左部的偏移量，来确定日期面板的显示位置
     */
    show: function () {
        var options = this.options,
            doms = this.doms;
        var inputTop = options.targetInput.offsetTop,
            inputLeft = options.targetInput.offsetLeft,
            inputHeight = options.targetInput.offsetHeight;

        var panelTop = inputTop + inputHeight + 2,
            panelLeft = inputLeft;

        doms.calendarPane.style.display = 'block';
        doms.calendarPane.style.top = panelTop + 'px';
        doms.calendarPane.style.left = panelLeft + 'px';
        // this.renderTime();
    },

    /**
     * @description 隐藏日期面板
     */
    hide: function () {
        var doms = this.doms;
        doms.calendarPane.style.display = 'none';
    },

    renderSelector: function (month, year) {
        var doms = this.doms;
        doms.pickMonth.options[month - 1].selected = true;
        doms.pickYear.options[year - this.options.beginYear].selected = true;
    },

    renderTime: function () {
        var doms = this.doms;
        var now = new Date();
        var timeStr = this.dateTime(now);
        doms.timeShow.innerHTML = timeStr;
    },

    extend: function (target, options) {

        function type(obj) {
            return Object.prototype.toString.call(obj).toLowerCase().slice(8, -1);
        }

        for (var item in options) {
            var src = target[item],
                copy = options[item];
            var clone;
            if(target === copy) {
                continue;
            }

            if (type(copy) === 'array') {
                clone = (type(src) === 'array') ? src : [];
                target[item] = this.extend(clone, copy);
            } else if (type(copy) === 'object') {
                clone = (type(src) === 'object') ? src : {};
                target[item] = this.extend(clone, copy);
            } else {
                target[item] = options[item];
            }
        }
        return target;
    }
};
