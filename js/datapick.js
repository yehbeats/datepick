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
var input = document.getElementById('in');
var defaultConf = {
    targetInput : input,
    beginYear: 1901,
    endYear: 2099,
    type: 'yyyy-mm-dd',
    firDayOfWeek: 1,
    language: {
        year: '年',
        month: '月',
        monthList: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        weekList:[ '日', '一', '二', '三', '四', '五', '六']
    }
};

function Calendar(options) {
    this.options = defaultConf;
    this.targetInput = this.options.targetInput;
    this.date = new Date();   //this.date存储用户所选的值，若没有，则默认今天

    this.init();
    this.bindEvent();
}

Calendar.prototype = {
    //渲染面板
    init: function () {
        this.renderPanel();
        this.hide();
    },

    /*初始化整个面板
    * 包括在渲染table时所需的值都在初始化面板时求出，这样可以增加table的渲染效率*/
    renderPanel: function () {
        var options = this.options;

        //判断输入框是否有日期，被选中日期用白色背景显示
        if(this.targetInput.value.length > 0) {
            this.date = this.dateParse(this.targetInput.value);
        }

        var YEAR = this.date.getFullYear(),
            MONTH = this.date.getMonth() + 1,
            DAY = this.date.getDate();

        console.log('===========DAY:'+DAY);

        var saturday = 6 - options.firDayOfWeek,
            sunday = (7 - options.firDayOfWeek) >= 7 ? 0 : (7 - options.firDayOfWeek);

        //创建主面板
        var calendarPane = document.createElement('div');
        calendarPane.id = 'calendar';
        calendarPane.className = 'calendar';

        //创建header
        var header = document.createElement('div');
        header.className = 'header';
        header.innerHTML = '<a class="circle fl"><span class="triangle-left center"></span></a>' +
            '<a class="circle fr"><span class="triangle-right center"></span></a>';

        //创建两个select的option选项 分别是month 和 year
        var monthHtml = '',
            yearHtml = '';
        options.language.monthList.forEach(function (item, i) {
            monthHtml += '<option value="'+i+'">'+item+'</option>';
        });

        for(var i = options.beginYear; i < options.endYear; i++) {
            yearHtml += '<option value="'+i+'">'+i+'</option>';
        }

        //创建date-pick
        var datePick = document.createElement('div');
        datePick.className = 'date-pick';
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
        footer.innerHTML = '<div class="date-time"><span class="time-label">时间</span><span class="time-dis">17 : 53 : 00</span> </div> ' +
            '<div class="date-opr"><a class="date-today">今天</a><a class="date-clear">清空</a> </div>';

        //组装各个元素
        header.appendChild(datePick);
        calendarPane.appendChild(header);
        calendarPane.appendChild(table);
        calendarPane.appendChild(footer);

        document.body.appendChild(calendarPane);

        this.calendarPane = calendarPane;

        //渲染table所需的各种值
        this.saturday = saturday;
        this.sunday = sunday;
        this.tbody = calendarPane.getElementsByTagName('tbody')[0];

        this.now = new Date();
        this.YEAR = YEAR;
        this.MONTH = MONTH;
        this.DAY = DAY;
        this.renderTable(YEAR, MONTH);
    },

    //渲染table  比如 2016/8
    renderTable: function (year, month) {
        console.log(year + " : " + month);
        if(month < 1) {
            year --;
            month = 12;
        }else if(month > 12) {
            year ++;
            month = 1;
        }

        var currentMonth = month --,
            currentDays = this.getDaysOfMonth(year, currentMonth),
            preMonth = currentMonth - 1,
            preDays = this.getDaysOfMonth(year, preMonth),
            nextMonth = currentMonth + 1,
            nextDays = this.getDaysOfMonth(year, nextMonth);

        var firstDay = this.getPositionOfBeginRender(year, month);
        var rows = Math.ceil((firstDay + currentDays) / 7);

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
                    console.log(dayNum+":"+month+":"+year);
                    if(dayNum === this.now.getDate() && year === this.now.getFullYear() && currentMonth === (this.now.getMonth() + 1)) {
                        classDay = 'state-active';
                    }
                    if(dayNum === this.DAY && year === this.YEAR && currentMonth === this.MONTH) {
                        classDay = 'state-choose';
                    }
                }

                if(j === this.saturday || j === this.sunday) {
                    classDay = classDay + ' week';
                }
                console.log(classMonth);
                tmpHtml += '<td class="'+classMonth+'"><a class="'+classDay+'">'+dayNum+'</a></td>';

                classDay = 'state-default';
            }
            tmpHtml += '</tr>';
        }
        this.tbody.innerHTML += tmpHtml;
    },

    //将输入框中的字符串变为Date对象
    dateParse: function (dateStr) {
        dateStr = dateStr.replace(/-/g, '/');
        return new Date(Date.parse(dateStr));
    },
    
    isLeapYear: function (year) {
        return ((year % 100 !== 0 && year % 4 === 0) || year % 400 === 0) ? 1 : 0;
    },

    getDaysOfMonth: function (year, month) {
        var d = new Date(year, month, 0);
        return d.getDate();
    },

    /*得到这个月第一天是周几，再根据用户设置的以周几开始渲染，得到开始渲染的位置
    * 如8月第一天是周一，用户设置firDayOfWeek为1，表示从周一开始，结果返回为0，表示从0位置开始渲染
    * */
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

    //绑定各种事件
    bindEvent: function () {
        var options = this.options,
            self = this;
        options.targetInput.onclick = function (e) {
            self.show();
            e.stopPropagation();
        };
        document.onclick = function () {
            self.hide();
        };


    },

    //整个日期面板的显示，根据输入框input距文档顶部和左部的偏移量，来确定日期面板的显示位置
    show: function () {
        console.log('execute');
        var options = this.options;
        var inputTop = options.targetInput.offsetTop,
            inputLeft = options.targetInput.offsetLeft,
            inputHeight = options.targetInput.offsetHeight;

        var panelTop = inputTop + inputHeight + 2,
            panelLeft = inputLeft;

        this.calendarPane.style.display = 'block';
        this.calendarPane.style.top = panelTop + 'px';
        this.calendarPane.style.left = panelLeft + 'px';
    },

    //隐藏日期面板
    hide: function () {
        this.calendarPane.style.display = 'none';
    }
};
