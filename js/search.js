var tableState = {pageNum:0, numPerPage:12, pagesInPaginator: 5, isLoaded: false};


// Number Format
// (123456789.12345).number_format(2, '.', ' ') => 123 456 789.12
// (123456789.12345).formatMoney(2, '.', ' ') => 123 456 789.12
Number.prototype.number_format = function (c, d, t) {
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

// Wraper to display all prices in on standard
function money_format(money) {
    value = parseFloat(money);
    return value.number_format(2, '.', " ");
}


// set range value in txt fields from Range controll
function getVals() {
    // Get slider values
    var parent = this.parentNode;
    var slides = parent.getElementsByTagName("input");
    var slide1 = parseFloat(slides[0].value);
    var slide2 = parseFloat(slides[1].value);
    // Neither slider will clip the other, so make sure we determine which is larger
    if (slide1 > slide2) {
        var tmp = slide2;
        slide2 = slide1;
        slide1 = tmp;
    }

    //var displayElement = parent.getElementsByClassName("rangeValues")[0];
    //displayElement.innerHTML = slide1 + " - " + slide2;

    // specify text field for each ragne group
    if (slides[0].id == "rangeAreaMin") {
        document.getElementsByClassName("areaMin")[0].value = slide1;
        document.getElementsByClassName("areaMax")[0].value = slide2;
    }
    if (slides[0].id == "priceHaFrom") {
        document.getElementsByClassName("priceHaFrom")[0].value = slide1;
        document.getElementsByClassName("priceHaTo")[0].value = slide2;
    }
    if (slides[0].id == "priceFrom") {
        document.getElementsByClassName("priceFrom")[0].value = slide1;
        document.getElementsByClassName("priceTo")[0].value = slide2;
    }

}
// will init when loading and after form reset
function initSliders(){
    var sliderSections = document.getElementsByClassName("range-slider");
    for (var x = 0; x < sliderSections.length; x++) {
        var sliders = sliderSections[x].getElementsByTagName("input");
        for (var y = 0; y < sliders.length; y++) {
            if (sliders[y].type === "range") {
                sliders[y].oninput = getVals;
                // Manually trigger event first time to display values
                sliders[y].oninput();
            }
        }
    }
}

$(document).ready(function () {

    // Initialize Sliders
    initSliders();

    // document.getElementsByClassName("areaMin")[0].value = document.getElementById('rangeAreaMin').value;
    // document.getElementsByClassName("areaMax")[0].value = document.getElementById('rangeAreaMax').value;

    //fill drop downs from API lists
    fillDropDowns();

    var $num_per_page = $('.num_per_page');
    //init NumPerPage
    $num_per_page.change(function (){
        tableState.numPerPage = $(this).val();
        tableState.pageNum = 0;
        $('#page_num_hf').val(0);
        // add field to resotre page after browser refresh
        // if we will storage ajax query in history we can remove it
        //$('#num_per_page').val($(this).val());
        loadTable();
    });


    // init table
    tableState.numPerPage = $num_per_page.val();
    tableState.pageNum = $('#page_num_hf').val();

    // if we will storage ajax query in history or in localstorage we can remove row below
    //$('#num_per_page').val( tableState.numPerPage  );

    // loadTable first time
    loadTable();

    // Submit form action
    $('.searchform').submit(function (ev) {
        // stop standart form submition
        ev.preventDefault();
        tableState.pageNum = 0;
        $('#page_num_hf').val("0");
        loadTable();
    })

});
//// History API
// Добавляем обработчик события popstate,
// происходящего при нажатии на кнопку назад/вперед в браузере
// window.addEventListener("popstate", function(e) {
//     // Передаем текущий URL
//     getContent(location.pathname, false);
// });
//
// function getContent(url) {
//     console.log(url);
//     console.log(history.state);
//     //fill form and load table
//
// }
// fill drop down block "Целевое назначение",  Что продается, Право до указанного года
function fillDropDowns() {
    var url = 'types_getList.json';
    $.post(url, function (result) {
        var intended_purposeStr = '';
        var rightsStr = '';
        for (var i = 0; i < result.rows.length; i++) {

            switch (result.rows[i]['typeId']) {
                case 1:
                    rightsStr += '<option value="' + result.rows[i].id + '">' + result.rows[i].name + '</option>';
                    break;
                case 2:
                    intended_purposeStr += '<option value="' + result.rows[i].id + '">' + result.rows[i].name + '</option>';
                    break;
            }
        }
        $('#rights').html('<option value="">---- выберите значенние ----</option>').append(rightsStr);
        $('#intended_purpose').html('<option value="">---- выберите значенние ----</option>').append(intended_purposeStr);
    }, 'json');

    // fill years
    var currentYear = new Date().getFullYear();
    var str = '';
    for (var i = 0; i < 100; i++) {
        str += '<option>' + (currentYear + i ) + '</option>';
    }
    $('#up_year').html("").append(str);
}

function resetForm() {
    $('.searchform')[0].reset();
    initSliders();
}

//load and display data in table
function loadTable(){


    var url = 'sales_getList_'+tableState.numPerPage+'.json';
    var $tbody = $('.table_search_result tbody');

    // remove old rows
    $tbody.hide('slow', function () {
        $('tr', $tbody).remove();
        // show LOADING message
        $tbody.append('<tr><td colspan="6" align="center" class="bg-info">loading...</td></tr>');
        $tbody.show('slow');
    });




    // make Query
    $.post(url, $('.searchform').serialize() + "&num_per_page=" + tableState.numPerPage, function (result) {

        var stateObj = { form: $('.searchform').serializeArray(), tableState: tableState };
        // History API
        // if(tableState.isLoaded) {
        //     history.pushState(stateObj, "", "?"+$('.searchform').serialize() + "&num_per_page=" + tableState.numPerPage);
        // }


        tableState.isLoaded = true;
        // remove LOADING message
        $('.table_search_result tbody').hide('slow', function () {
            $('tr', $tbody).remove();

            // display result here
            $tbody.show('slow');
            for (var i = 0; i < result.rows.length; i++) {
                // create each row
                var dt = new Date();
                dt.setTime(result.rows[i].created);
                var dateStr = ((dt.getDate() < 10) ? "0" : "") + dt.getDate() + '.' + ( ((dt.getMonth() + 1 < 10) ? "0" : "") + (dt.getMonth() + 1) ) + '.' + dt.getFullYear();
                var type = (result.rows[i].typeId == 1) ? "Покупка" : "Продажа";
                var row = '<tr>\
                                <td>' + dateStr + '</td>\
                                <td>' + result.rows[i].uid + '</td>\
                                <td>' + type + '</td>\
                                <td>' + result.rows[i].place + '</td>\
                                <td>' + money_format(result.rows[i].haPrice) + '</td>\
                                <td>' + money_format(result.rows[i].price) + '</td>\
                            </tr>';
                $tbody.append(row);
            }
        });

        //show pagenator
        var countOfPages = Math.ceil( result.found/tableState.numPerPage );


        $paginator = '';
        if(tableState.pageNum==0) {
            $paginator = '<li><span>Первая</span></li>';
        }else {
            $paginator = '<li><a href="#" onclick="return false;" data-num="0">Первая</a></li>';
        }
        var pageNumFrom = 0,
            pageNumTo = tableState.pagesInPaginator;
        if(countOfPages<tableState.pagesInPaginator) {
            pageNumTo = countOfPages;
        }else if(tableState.pageNum<= (tableState.pagesInPaginator/2) ) {
            pageNumFrom = 0;
            pageNumTo = tableState.pagesInPaginator;

        }else if(tableState.pageNum>=countOfPages-Math.ceil(tableState.pagesInPaginator/2)) {
            pageNumFrom = countOfPages-tableState.pagesInPaginator;
            pageNumTo = countOfPages;
        }else {
            pageNumFrom = tableState.pageNum - parseInt(tableState.pagesInPaginator/2);
            pageNumTo = pageNumFrom + tableState.pagesInPaginator;
        }

        for(var i=pageNumFrom; i<pageNumTo; i++) {
            if(tableState.pageNum==i) {
                $paginator += '<li><span>'+ (i+1) + '</span></li>';
            }else {
                $paginator += '<li><a href="#" onclick="return false;"  data-num="'+i+'">'+ (i+1) + '</a></li>';
            }
        }
        if(tableState.pageNum==countOfPages-1) {
            $paginator += '<li><span>Последняя</span></li>';
        }else {
            $paginator += '<li><a href="#" onclick="return false;" data-num="'+(countOfPages-1)+'">Последняя</a></li>';
        }
        $('.pagination').html($paginator);
        $('.pagination a').click(function (){
            tableState.pageNum = $(this).data('num');
            $('#page_num_hf').val( tableState.pageNum );
            loadTable();
        });

        // show record found from total
        var total = parseInt(result.total);
        if (typeof total == "undefined") total = 0;
        $('.records-total').html(total.number_format(0, '.', ' '));
        $('.records-found').html(result.found);


    }, 'json').fail(function () {
        // remove LOADING message
        $tbody.hide('slow', function () {
            $('tr', $tbody).remove();
            // display  error message
            $tbody.append('<tr><td colspan="6" class="bg-danger">Sorry, Error connection. Please try later.</td></tr>');
            $tbody.show('slow');
        });
    });
}