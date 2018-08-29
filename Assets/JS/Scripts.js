$(document).ready(function () {
    populateText();

    $('#submit').click(function () {
        //Validate inputs
        if (validateInputs() == 1) {
            return false;
        }

        //Set email fields
        var email = {};
        email.Name = $("#requester").val();
        email.email = $("#email1").val();
        email.Phone = $("#phone1").val();
        email.Name2 =  ($("#contact").val() ? $("#contact").val() : "");
        email.email2 = ($("#email2").val() ? $("#email2").val() : "");
        email.Phone2 = ($("#phone2").val() ? $("#phone2").val() : "");
        email.EventTitle = $("#eventtitle").val();
        email.EventLoc = $("#eventloc").val();
        email.EventDate = $("#eventdate").val();
        email.DeliveryTime = $("#deliverytime").val();
        email.CleanupTime = $("#cleanuptime").val();
        email.CostCenter = $("#costcenter").val();
        email.CreditCard = +$("#creditcard").prop("checked");
        email.GrandTotal = $("#grandTotal").val().split("$")[1];
        email.ToRecipient = getEmailRecipient();

        email.Items = [];

        $('input[name=Total]').each(function () {
            var str = $(this).val();
            var ID = $(this).attr("id");
            var value = str.split("$")[1];
            if (value != "") {
                //create item obj
                var item = {};
                //populate all item properties
                getOPTION   = $(this).parent(); 
                optionID    = $(getOPTION).attr("id")
                res         = optionID.split("_");
                catagory    = res[0];
                meal        = res[1];
                itemz       = (res[2]?res[2]:"");
                subItemz = (res[3] ? res[3] : "");
                //Item Name
                if (catagory.indexOf("Second") >= 0) {
                    if (itemz == "") {
                        item.Name = meals[meal].SecondTitle;
                    } else {
                        title2 = meals[meal].SecondTitle;
                        item.Name = title2+": "+meals[meal].SecondItems[itemz].SubItems[subItemz].Label;
                    }
                } else {
                    if (itemz == "") {
                        item.Name = meals[meal].Title;
                    } else {
                        item.Name = meals[meal].Items[itemz].SubItems[subItemz].Label;
                    }
                }
                //Item Price
                if (value == "NaN") {
                    value="TBD"
                }
                item.Price = value

                control = ID.split("_");
                //# of People
                numOfppl = $('input[id="' + control[0] + '_Number of People_' + control[2] + '"]').val()
                item.NumberOfPeople = (numOfppl ? numOfppl : 0);
                //Qty
                QTY = $('input[id="' + control[0] + '_Qty_' + control[2] + '"]').val()
                item.QTY = (QTY ? QTY : 0);
                //Number of Entrees
                numOfEnt = $('input[id="' + control[0] + '_# of Entrees_' + control[2] + '"]').val()
                item.NumberOfEntrees = (numOfEnt ? numOfEnt : 0);
                //SubOptions/Entrees
                item.SubOptions = [];

                $("#Cell_" + meal).find('input[type="checkbox"]:checked').each(function () {
                    
                    var subopt = {};
                    checkINFO = $(this).parent().parent().attr('id').split("_");

                    tableID = checkINFO[0];
                    checkItem = checkINFO[2];
                    checkID = $(this).val();

                    if (tableID.indexOf("Second") >= 0) {
                        title2 = meals[meal].SecondTitle;
                        subopt.Name = title2 + ": " + meals[meal].SecondItems[checkItem].SubItems[checkID].Label;
                    } else if (tableID.indexOf("Third") >= 0) {
                        title3 = meals[meal].ThirdTitle;
                        subopt.Name = title3 + ": " + meals[meal].ThirdItems[checkItem].SubItems[checkID].Label;
                    } else {
                        subopt.Name = meals[meal].Items[checkItem].SubItems[checkID].Label;
                    }
                    item.SubOptions.push(subopt)
                });
               
                $("#Cell_" + meal).find('input[name="Writing"]').each(function () {
                    var writing = $(this).val();
                    if (writing != "") {
                        var subopt = {};
                        subopt.Name = "Writing: " +writing;
                        item.SubOptions.push(subopt);
                    }
                });
                //push item to email.Items array
                email.Items.push(item);
            }
        }); //End looping of price objects

        url = "api/sendemail";
        $.ajax({
            type: "POST",
            url: url,
            data: email,
            success: function (ret) {
                //Thank you page
                window.location.replace("\Thankyou.html");
            },
            error: function (err) {
                console.log(err);
                alert("Something went wrong");
            }
        }); //End Ajax Call
        
        return false; 

    }); //End Submit Function

    var updatePrice = function () {
        var ID = $(this).attr('id');
        if (ID == "creditcard") {
            return false;
        }
        var res      = ID.split("_");
        var catagory = res[0];
        var name     = res[1];
        var row      = res[2];
        var type     = $(this).attr('type')
        if (type == 'checkbox') {
            var parentID=$(this).parent().parent().attr('id');
            var row = parentID.split("_")[1];
            var x = $('input[name=' + catagory + '_chk]:checked').length;
            $('input[id="' + catagory + '_# of Entrees_' + row + '"]').val(x);

            var price = $('input[id="' + catagory + '_Number of People_' + row + '"]').attr('price');
            if ((price == "") || (price == null)) {
                price = "TBD";
            }
            var amount = $('input[id="' + catagory + '_Number of People_' + row + '"]').val();
            if ((amount=="")||(amount==null)) {
                amount = 0;
            }
        } else {
            var price    = $(this).attr('price');
            var amount   = $(this).val();
        }
        var extra = 0;
 
        var targetID = catagory + "_Total_" + row;

        var howMany = $('input[id="' + catagory + '_# of Entrees_' + row + '"]').val();

        var extraItemPrice = $('input[id="' + catagory + '_# of Entrees_' + row + '"]').attr('extraItemPrice');
        if ((extraItemPrice !== "") || (extraItemPrice !== null)) {
            if (howMany > 1) {
                var x = howMany - 1
                var extra = x * extraItemPrice
            }
        }
        var total = ((+price + extra) * (amount));
        if (total == 0) {
            total = "";
        }
        $("#" + targetID).val("$" + total);
        if ($.isNumeric(+total)) {
            updateGrand();
        }
    }

    $('input[name="Qty"]').on('keyup', updatePrice);
    $('input[name="Number of People"]').on('keyup', updatePrice);
    $('input[type="checkbox"]').change(updatePrice);

    function updateGrand() {
        var x = $('input[name=Total]').length;
        var grandTotal = 0;
        $('input[name=Total]').each(function () {
            var str = $(this).val();
            var value = str.split("$")[1];
            if (value!="NaN") {
                grandTotal = +grandTotal + +value;
            }
        });
        $('#grandTotal').val("$"+grandTotal);
    }

    function validateInputs() {
        if ($("#requester").val() == "") {
            alert("Contact Name is required")
            $("#requester").focus();
            return 1;
        }
        if ($("#email1").val() == "") {
            alert("Contact email is required")
            $("#email1").focus();
            return 1;
        }
        if ($("#phone1").val() == "") {
            alert("Contact phone number is required")
            $("#email1").focus();
            return 1;
        }
        if ($("#eventtitle").val() == "") {
            alert("Event title is required");
            $("#eventtitle").focus();
            return 1;
        }
        if ($("#eventloc").val() == "") {
            alert("Event Location is required");
            $("#eventloc").focus();
            return 1;
        }
        if ($("#eventdate").val() == "") {
            alert("Event Date is required");
            $("#eventdate").focus();
            return 1;
        }
        if ($("#deliverytime").val() == "") {
            alert("Delivery time is required")
            $("#deliverytime").focus();
            return 1;
        }
        if ($("#cleanuptime").val() == "") {
            alert("Clean up time is required");
            $("#cleanuptime").focus();
            return 1;
        }
        if (($("#costcenter").val() =="") && (+$("#creditcard").prop("checked") == 0)) {
            alert("A payment option must be selected");
            $("#costcenter").focus();
            return 1;
        }
        return 0;
    }
})


function populateText() {
    var Category; var Title; var Price; var Placement; var CalcOptions; var Items; var ID; var Tag;
    var i = 0;
    for (i = 0; i < meals.length; i++) {
        Category  = meals[i].Category;
        Tag       = category[Category].Label;
        Title     = meals[i].Title;
        Price     = meals[i].Price;
        Placement = meals[i].Placement;
        ID = meals[i].ID;
        if (Placement == "Left") {
            var rowID="Row_"+i;
            $("#" + Tag).append("<TR id='" + rowID + "' width='100%'></TR>");
        }
        if (Price == "") {
            var displayPrice = ""
        } else {
            var displayPrice = " - $" + Price + " per person";
        }
        var cellID = "Cell_" + i;
        var tableID = "ItemTable_" + i;
        $("#" + rowID).append("<td id='" + cellID + "' width='50%' height='28' align='left' valign='top'><strong>" + Title + displayPrice + "</strong></td>");
        $("#" + cellID).append("<Table id='" + tableID + "' width='100%'></Table>");

        //Item List
        Items = meals[i].Items;
        populateItemList(Items, tableID, i, ID);
        
        //Calc Options
        CalcOptions = meals[i].CalcOptions;
        CalcAttribute = (meals[i].CalcAtt?meals[i].CalcAtt:"");
        var extraItemPrice = (meals[i].CalcPrice ? meals[i].CalcPrice : "");
        var calcID = "calcOptions_" + i
        $("#" + tableID).append("<TR><TD id='" + calcID + "' colspan='3'></TD></TR>")
        var l = 0;
        for (l = 0; l < CalcOptions.length; l++) {
            var calcValue = CalcOptions[l];
            var calcLabel = calculationOptions[calcValue].Label;
            var disabled = ""
            var val=""
            if (calcLabel=="Total") {
                disabled = "disabled='disabled'"
                val = "$"
            } else if (calcLabel=="# of Entrees") {
                disabled = "disabled='disabled'"
            }
            if (CalcAttribute == "Hidden") {
                $("#" + calcID).append("<input name='" + calcLabel + "' type='hidden' id='" + ID + "_" + calcLabel + "_" + i + "' size='4' maxlength='4' " + disabled + " price='" + Price + "' extraItemPrice='" + extraItemPrice + "' value='" + val + "'/>&nbsp")
            } else {
                $("#" + calcID).append(calcLabel + ": <input name='" + calcLabel + "' type='text' id='" + ID + "_" + calcLabel + "_" + i + "' size='4' maxlength='4' " + disabled + " price='" + Price + "' extraItemPrice='" + extraItemPrice + "' value='" + val + "'/>&nbsp")
            }
        } //Close l (CalcOptions)

        //SecondItems
        var SecondTitle = (meals[i].SecondTitle?meals[i].SecondTitle:"");
        if (SecondTitle !== "") {
            tableID = "SecondItemTable_" + i;
            var ThirdTitle = (meals[i].ThirdTitle ? meals[i].ThirdTitle : "");
            if (ThirdTitle=="") {
                width="100%"
            } else {
                width="40%"
            }
            $("#" + cellID).append("</br><Table id='" + tableID + "' width='" + width + "' class='floatedTable'><th align='left'>" + SecondTitle + "</th></Table>");
            SecondItems =  meals[i].SecondItems;
            populateItemList(SecondItems, tableID, i, ID+"Second");
            if (ThirdTitle !== "") {
               tableID = "ThirdItemTable_" + i;
               $("#" + cellID).append("<Table id='" + tableID + "' width='60%' class='floatedTable'><th align='left'>FROSTING</th></Table>");
               ThirdItems = meals[i].ThirdItems;
               populateItemList(ThirdItems, tableID, i, ID + "Third");
            }
        }
    } //Close i (meals)
}

function populateItemList(Items, tableID, i, ID) {
    var j = 0;
    for (j = 0; j < Items.length; j++) {
        var Label = Items[j].Label;
        var itemPrice = Items[j].Price; //can be null
        var isHorizontal = Items[j].isHorizontal;
        var Prefix = Items[j].Prefix;
        var itemOptions = Items[j].CalcOptions; //can be null
        var SubItems = (Items[j].SubItems ? Items[j].SubItems : "");
        var pre = "";

        if (Prefix == "bullet") { pre = "&#8226; " }
        if (Prefix == "dash") { pre = "&#45;" }
        if (Label != "") {
            $("#" + tableID).append("<TR><TD colspan='3'>" + pre + Label + "</TD></TR>")
        }
        if (isHorizontal == "true") {
            var HorzID = "HorziontalRow_" + i + "_" + j+"_0";
            $("#" + tableID).append("<TR id='" + HorzID + "'></TR>");
        }
        var k = 0;
        for (k = 0; k < SubItems.length; k++) {
            var SubLabel = SubItems[k].Label;
            var subPrefix = SubItems[k].Prefix;
            var subPrice = (SubItems[k].Price ? SubItems[k].Price : "");
            var subUnit = (SubItems[k].Unit ? SubItems[k].Unit : "");
            var subServes = (SubItems[k].Serves ? SubItems[k].Serves : "");
            var subCalcOptions = (SubItems[k].CalcOptions ? SubItems[k].CalcOptions : "");
            if (isHorizontal == "true") {
                var appendTo = HorzID;
                var width = "33%";
            } else {
                var appendTo = "subItem" + tableID + "_" + j+ "_"+k; 
                $("#" + tableID).append("<TR id='" + appendTo + "'></TR>");
                var width = "100%";
            }

            if (subPrefix == "check") {
                $("#" + appendTo).append("<TD width='" + width + "'>" + "<input name='" + ID + "_chk' type='checkbox' id='" + ID + "_chk_" + k + "' value='"+k+"' /> " + SubLabel + "</TD>");
            } else if (subPrefix == "dash") {
                $("#" + appendTo).append("<TD>" + "&#45; " + SubLabel + " &#45; $" + subPrice + " " + subUnit+"</TD>");
            } else if (SubLabel!="") {
                var value = SubLabel
                if (subServes != "") {
                    value += "<br/>(serves " + subServes + ")"
                }
                if (subPrice != "") {
                    value += " &#45; $" + subPrice + " " + subUnit
                }
                $("#" + appendTo).append("<TD>" + value + "</TD>");
            }

            var m = 0;
            for (m = 0; m < subCalcOptions.length; m++) {
                var subCalcValue = subCalcOptions[m];
                var subCalcLabel = calculationOptions[subCalcValue].Label;
                if (subCalcValue == 4) {
                    display = "<strong>" + subCalcLabel + "</strong>"
                    size = 20;
                    maxlength = 70;
                } else {
                    display = subCalcLabel
                    size = 4;
                    maxlength = 4;
                }
                var disabled = ""
                var val = ""
                if (subCalcLabel == "Total") {
                    disabled = "disabled='disabled'"
                    val = "$"
                }
                $("#" + appendTo).append("<TD id='"+ID+"_"+i+"_"+j+"_"+k+"'>" + display + ": <input name='" + subCalcLabel + "' type='text' id='" + ID + "_" + subCalcLabel + "_" + k + "' size='" + size + "' maxlength='" + maxlength + "' align='right' " + disabled + " price='" + subPrice + "' value='" + val + "'/></TD>");
            } //Close m (subCalcOptions)
        } //Close k (SubItems)
    } //Close j (Items)
}
