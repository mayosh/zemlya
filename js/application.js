$(document).ready(function () {

    // initCardnumber
    var $cadnuminput = $('.id_number input').mask('0000000000:00:000:0000');
        // we can use $(document).on('keypress', '.id_number input', function(){ });
    // but I dont like it so I use explicit bind event
    function initCadnum($element) {
        $element.on('keypress',function(){
            var charCount = $(this).val().length;
            var $new_elem = $('<input type="text" name="cadnum" placeholder="0000000000:00:000:0000" class="cadnum" />');
            if(charCount >= 21) {
                $(".id_number").append( $new_elem );
                $new_elem.trigger('focus');
                initCadnum($new_elem);
            }
        });
    }
    initCadnum( $cadnuminput );


    // fill block "Целевое назначение",  Что продается, Право до указанного года
    // list filled in JSP file
    initLists();

    // init navigation buttons
    $('.collapsecustom a').click(function(ev){
        ev.preventDefault();
        $('.collapsecustom li').removeClass('active');
        $(this).parent().addClass('active');
        $('.' + $(this).data('area')).hide();
        $('#' + $(this).data('target')).show();
    });

    initSellForm();
    iniBuyForm();

});

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {

        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            if(this.name.indexOf('[]')===-1) {
                o[this.name] = this.value || '';
            }else {
                o[this.name] = [this.value || '']
            }

        }
    });
    return o;
};


function initSellForm() {
    //url = './_sales/create'
    url = '../server/create.php';
    $('#form_sell_item').submit(function (ev){
        ev.preventDefault();
        var $form = $(this);
        var data = $form.serializeObject();


        // some field will send in specific structure
        var sendData = {
            rights: [],  //[{id: 1, "year":2015}, {id:2}, {id:8, txt: "txt_other"}} } ]
            rights_other: "",
            places:[],
            purposes: [], //[{id:1}, {id:2}, {id:3, txt_other}]
            purpose_other: "",
            cadnum: [],// ["1111111111:11:111:1111", "2222222222:22:222:2222", "3333334342:34:234:2342"]
            addServiceRequire: []
        };

        // Fill Rights
        if(typeof data["right_id"]=="string") {
            data["right_id"] = [].concat(data["right_id"]);
        }
        $.each(data["right_id"], function (i, item) {
            var rightItem = {};
            rightItem.id = item;
            // add upYear value to obj
            if (typeof data['upYear[' + item + ']'] != "undefined") {
                rightItem.upYear = data['upYear[' + item + ']'];
                delete data['upYear['+ item +']'];
            }
            sendData.rights.push(rightItem);
        });

        delete data["right_id"];

        // add other field
        if(typeof data["right_id_other"]!="undefined") {
            sendData.rights_other = data['rights'];
            delete data["rights"];
            delete data["right_id_other"];
        }

        // add places
        if(typeof data['place']=="string") {
            data['place'] = [].concat(data['place']);
        }
        sendData.places = data['place'];
        delete data["place"];
        // add purpose
        if(typeof data['purposeId']=="string") {
            data['purposeId'] = [].concat(data['purposeId']);
        }
        sendData.purposes = data["purposeId"];
        delete data["purposeId"];
        // add other field
        if(typeof data["purposeId_other"]!="undefined") {
            sendData.purpose_other =  data['purpose'];
            delete data["purposeId_other"];
        }
        delete data["purpose"];

        // add cadnum
        if(typeof data["cadnum"]=="string") {
            data["cadnum"] = [].concat(data["cadnum"]);
        }
        $.each(data['cadnum'], function (i, item){
            if(item!="") sendData.cadnum.push(item);
        });
        delete data['cadnum'];

        if(typeof data["addServiceRequire"]=="string") {
            data["addServiceRequire"] = [].concat(data["addServiceRequire"]);
        }
        $.each(data['addServiceRequire'], function (i, item){
            sendData.addServiceRequire.push(item);
        });
        delete data['addServiceRequire'];



        data = $.extend({}, sendData, data);

        $('#sendeddata').html('sended data: ' +  JSON.stringify(data));

        // use class thow section tag not work in old browsers
        $(this).parents('.formarea').hide('slow', function (){
            $('.forminprocess').show('slow', function(){
                // send data
                $.post(url, {data: JSON.stringify(data)}, function(result) {
                    $('.forminprocess').hide('slow', function(){
                        $('.formresult').show('slow', function(){
                            $form.trigger('reset');//.reset();
                            resetHtml5Validation();
                        });

                    });
                }).fail(function (){

                    $('.forminprocess').hide('slow', function(){
                        $('.formresult').append('TODO: set message CONNECTION ERROR')
                                        .show('slow', function(){

                        });
                    });
                });
            });
        });
        return false;
    });
}

function iniBuyForm(){
    $('#form_buy_item').submit(function (ev){
        ev.preventDefault();
        var $form = $(this);
        var data = $form.serializeObject();
        // some field will send in specific structure
        var sendData = {
            rights: [],  //[{id: 1, "year":2015}, {id:2}, {id:8, txt: "txt_other"}} } ]
            rights_other: "",
            places:[],
            addServiceRequire:[]
            // purposes: [], //[{id:1}, {id:2}, {id:3, txt_other}]
            // purpose_other: "",
            // cadnum: []// ["1111111111:11:111:1111", "2222222222:22:222:2222", "3333334342:34:234:2342"]
        };
        // add places
        sendData.places = data['place[]'];
        delete data["place"];
        // Fill Rights

        if(typeof data["right_id"]=="string") {
            data["right_id"] = [].concat(data["right_id"]);
        }
        $.each(data["right_id"], function (i, item) {
            var rightItem = {};
            rightItem.id = item;
            // add upYear value to obj
            if (typeof data['upYear[' + item + ']'] != "undefined") {
                rightItem.upYear = data['upYear[' + item + ']'];
                delete data['upYear['+ item +']'];
            }
            sendData.rights.push(rightItem);
        });
        delete data["right_id"];

        // add other field
        if(typeof data["right_id_other"]!="undefined") {
            sendData.rights_other = data['rights'];
            delete data["rights"];
            delete data["right_id_other"];
        }
        if(typeof data["addServiceRequire"]=="string") {
            data["addServiceRequire"] = [].concat(data["addServiceRequire"]);
        }
        $.each(data['addServiceRequire'], function (i, item){
            sendData.addServiceRequire.push(item);
        });
        delete data['addServiceRequire'];


        data = $.extend({}, sendData, data);

        $('#sendeddata').html('sended data: ' +  JSON.stringify(data));


        // use class thow section tag not work in old browsers
        $(this).parents('.formarea').hide('slow', function (){
            $('.forminprocess').show('slow', function(){
                // send data
                $.post(url, {data: JSON.stringify(data)}, function(result) {
                    $('.forminprocess').hide('slow', function(){
                        $('.formresult').show('slow', function(){
                            $form.trigger('reset');//.reset();
                            resetHtml5Validation();
                        });
                    });
                }).fail(function (){
                    $('.forminprocess').hide('slow', function(){
                        $('.formresult').show('slow', function(){
                            $('.formresult').append('TODO: set message CONNECTION ERROR')
                        });
                    });
                });

            });
        });


        return false;
    });

}



function resetHtml5Validation() {
    $('.right_id_buy, .right_id_sell, .purpose, .place_sell, .place_buy').each(function(){
        // reset inner field
        if($(this).is(':checked')) {
            // situation not posible
            console.log('situation not posible');
            if($(this).next().children().prop('required', true).prop('disabled', false).size()==0) {
                $(this).next().prop('required', true).prop('disabled', false).focus();
            }
        }else {
            // search first sub fields in tags
            if($(this).next().children().prop('required', false).prop('disabled', true).size()==0) {
                $(this).next().prop('required', false).prop('disabled', true);
            }
        }
        $(this).prop('required', true);
    });
}

function initLists(){


        var url = 'types_getList.json';
        $.post(url, function (result) {
            var intended_purposeStr = '';

            var rightsSellStr = '';
            var rightsBuyStr = '';
            for (var i = 0; i < result.rows.length; i++) {
                // separate onlist by types
                switch (result.rows[i]['typeId']) {
                    case 1: //  rightslist
                        // this logic in jsp

                        // for custom solution
                        switch(result.rows[i].name.toLowerCase() ) {
                            case "другое":
                                //$('#rights_sell_other').attr('name', 'right_id["other"]').attr('value',  result.rows[i].id);
                                //$('#rights_buy_other').attr('name', 'right_id["other"]').attr('value',  result.rows[i].id);
                            break;
                            case "право постоянного пользования":
                            case "право собственности":
                            case "отвод государственной (коммунальной) земли":
                                // without text field
                                // rightsSellStr   +=  '<label for="right_id_sell_['+result.rows[i].id+']">\
                                //                         <input type="checkbox" id="right_id_sell_['+result.rows[i].id+']" name="right_id['+result.rows[i].id+']" class="right_id" value="'+result.rows[i].id+'" />' + result.rows[i].name + '\
                                //                 </label>';
                                rightsSellStr   +=  '<label for="right_id_sell_'+result.rows[i].id+'">\
                                                        <input type="checkbox" id="right_id_sell_'+result.rows[i].id+'" name="right_id" class="right_id_sell" value="'+result.rows[i].id+'" required />' + result.rows[i].name + '\
                                                </label>';

                                rightsBuyStr += '<label for="right_id_buy_'+result.rows[i].id+'">\
                                                    <input type="checkbox" id="right_id_buy_'+result.rows[i].id+'" name="right_id" value="'+result.rows[i].id+'" class="right_id_buy" required>' + result.rows[i].name + '\
                                                </label>';

                                break;
                            case "нужна консультация":
                                rightsBuyStr += '<label for="right_id_buy_'+result.rows[i].id+'">\
                                                <input type="checkbox" id="right_id_buy_'+result.rows[i].id+'" name="right_id" value="'+result.rows[i].id+'" class="right_id_buy" required>' + result.rows[i].name + '\
                                                </label>';
                                break;
                            default:
                                // rightsSellStr   +=  '<label class="ifchecked"  for="right_id_sell_['+result.rows[i].id+']"><input type="checkbox" id="right_id_sell_['+result.rows[i].id+']" name="right_id['+result.rows[i].id+']" value="'+result.rows[i].id+'" class="right_id" />' + result.rows[i].name + '\
                                //                         <input type="text" class="right_year" name="upYear['+result.rows[i].id+']" placeholder="до какого года?">\
                                //                     </label>';
                                rightsSellStr   +=  '<label class="ifchecked"  for="right_id_sell_'+result.rows[i].id+'"><input type="checkbox" id="right_id_sell_'+result.rows[i].id+'" name="right_id" value="'+result.rows[i].id+'" class="right_id_sell" required />' + result.rows[i].name + '\
                                                        <input type="text" class="right_year" name="upYear['+result.rows[i].id+']" placeholder="до какого года?" disabled >\
                                                    </label>';

                                rightsBuyStr    +=  '<label class="ifchecked" for="right_id_buy_'+result.rows[i].id+'">\
                                                        <input type="checkbox" id="right_id_buy_'+result.rows[i].id+'" name="right_id" value="'+result.rows[i].id+'" class="right_id_buy" required >' + result.rows[i].name + '\
                                                        <span>min. до какого года: <input type="date" class="right_year" name="upYear['+result.rows[i].id+']"  disabled /></span>\
                                                        </label>';
                        }

                        break;
                    case 2: // intended_purpose_list
                        switch(result.rows[i].name.toLowerCase() ) {
                            case "другое":
                                //$('#intended_purpose_other').attr('name', 'purposeId["other"]').attr('value', result.rows[i].id);
                                break;
                            default:
                                intended_purposeStr += ' <label for="purposeId_' + result.rows[i].id + '"><input type="checkbox" name="purposeId" id="purposeId_' + result.rows[i].id + '" value="' + result.rows[i].id + '" class="purpose" required />' + result.rows[i].name + '</label>';
                        }
                        break;
                }
            }
            $('.rightselllist').html(rightsSellStr);
            $('.rightbuylist').html(rightsBuyStr);
            $('.intended_purpose_list').html(intended_purposeStr);

            $('.right_id_buy, .right_id_sell, .purpose, .place_sell, .place_buy').click(function (){
                // change state for current item
                if($(this).is(':checked')) {
                    // search first sub fields in tags
                    if($(this).next().children().prop('required', true).prop('disabled', false).focus().size()==0) {
                        $(this).next().prop('required', true).prop('disabled', false).focus();
                    }
                }else {
                    // search first sub fields in tags
                    if($(this).next().children().prop('required', false).prop('disabled', true).size()==0) {
                        $(this).next().prop('required', false).prop('disabled', true);
                    };

                }

                // change state for all items in group
                if($('.' + $(this).prop('class') + ':checked').size()>0) {
                    $('.' + $(this).prop('class')).prop('required',false);
                }else {
                    $('.' + $(this).prop('class')).prop('required',true);
                }
            });

            // its work for after refresh browser if some fields already checked
            $('.right_id_buy:checked, .right_id_sell:checked, .purpose:checked, .place_sell:checked, .place_buy:checked').each(function (){
                if($(this).is(':checked')) {
                    // search first sub fields in tags
                    if($(this).next().children().prop('required', true).prop('disabled', false).focus().size()==0) {
                        $(this).next().prop('required', true).prop('disabled', false).focus();
                    }
                }else {
                    // search first sub fields in tags
                    if($(this).next().children().prop('required', false).prop('disabled', true).size()==0) {
                        $(this).next().prop('required', false).prop('disabled', true);
                    }
                }

                if($('.' + $(this).prop('class') + ':checked').size()>0) {
                    $('.' + $(this).prop('class')).prop('required',false);
                }else {
                    $('.' + $(this).prop('class')).prop('required',true);
                }
            });
        }, 'json');

        // // fill years
        // var currentYear = new Date().getFullYear();
        // var str = '';
        // for (var i = 0; i < 100; i++) {
        //     str += '<option>' + (currentYear + i ) + '</option>';
        // }
        // $('#up_year').html("").append(str);
}
