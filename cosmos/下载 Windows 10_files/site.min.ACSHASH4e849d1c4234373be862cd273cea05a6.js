$(document).ready(function() {


});

/*
    jQuery Masked Input Plugin
    Copyright (c) 2007 - 2014 Josh Bush (digitalbush.com)
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.4.0
*/
!function(factory) {
    "function" == typeof define && define.amd ? define([ "jquery" ], factory) : factory("object" == typeof exports ? require("jquery") : jQuery);
}(function($) {
    var caretTimeoutId, ua = navigator.userAgent, iPhone = /iphone/i.test(ua), chrome = /chrome/i.test(ua), android = /android/i.test(ua);
    $.mask = {
        definitions: {
            "9": "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    }, $.fn.extend({
        caret: function(begin, end) {
            var range;
            if (0 !== this.length && !this.is(":hidden")) return "number" == typeof begin ? (end = "number" == typeof end ? end : begin, 
            this.each(function() {
                this.setSelectionRange ? this.setSelectionRange(begin, end) : this.createTextRange && (range = this.createTextRange(), 
                range.collapse(!0), range.moveEnd("character", end), range.moveStart("character", begin), 
                range.select());
            })) : (this[0].setSelectionRange ? (begin = this[0].selectionStart, end = this[0].selectionEnd) : document.selection && document.selection.createRange && (range = document.selection.createRange(), 
            begin = 0 - range.duplicate().moveStart("character", -1e5), end = begin + range.text.length), 
            {
                begin: begin,
                end: end
            });
        },
        unmask: function() {
            return this.trigger("unmask");
        },
        mask: function(mask, settings) {
            var input, defs, tests, partialPosition, firstNonMaskPos, lastRequiredNonMaskPos, len, oldVal;
            if (!mask && this.length > 0) {
                input = $(this[0]);
                var fn = input.data($.mask.dataName);
                return fn ? fn() : void 0;
            }
            return settings = $.extend({
                autoclear: $.mask.autoclear,
                placeholder: $.mask.placeholder,
                completed: null
            }, settings), defs = $.mask.definitions, tests = [], partialPosition = len = mask.length, 
            firstNonMaskPos = null, $.each(mask.split(""), function(i, c) {
                "?" == c ? (len--, partialPosition = i) : defs[c] ? (tests.push(new RegExp(defs[c])), 
                null === firstNonMaskPos && (firstNonMaskPos = tests.length - 1), partialPosition > i && (lastRequiredNonMaskPos = tests.length - 1)) : tests.push(null);
            }), this.trigger("unmask").each(function() {
                function tryFireCompleted() {
                    if (settings.completed) {
                        for (var i = firstNonMaskPos; lastRequiredNonMaskPos >= i; i++) if (tests[i] && buffer[i] === getPlaceholder(i)) return;
                        settings.completed.call(input);
                    }
                }
                function getPlaceholder(i) {
                    return settings.placeholder.charAt(i < settings.placeholder.length ? i : 0);
                }
                function seekNext(pos) {
                    for (;++pos < len && !tests[pos]; ) ;
                    return pos;
                }
                function seekPrev(pos) {
                    for (;--pos >= 0 && !tests[pos]; ) ;
                    return pos;
                }
                function shiftL(begin, end) {
                    var i, j;
                    if (!(0 > begin)) {
                        for (i = begin, j = seekNext(end); len > i; i++) if (tests[i]) {
                            if (!(len > j && tests[i].test(buffer[j]))) break;
                            buffer[i] = buffer[j], buffer[j] = getPlaceholder(j), j = seekNext(j);
                        }
                        writeBuffer(), input.caret(Math.max(firstNonMaskPos, begin));
                    }
                }
                function shiftR(pos) {
                    var i, c, j, t;
                    for (i = pos, c = getPlaceholder(pos); len > i; i++) if (tests[i]) {
                        if (j = seekNext(i), t = buffer[i], buffer[i] = c, !(len > j && tests[j].test(t))) break;
                        c = t;
                    }
                }
                function androidInputEvent() {
                    var curVal = input.val(), pos = input.caret();
                    if (curVal.length < oldVal.length) {
                        for (checkVal(!0); pos.begin > 0 && !tests[pos.begin - 1]; ) pos.begin--;
                        if (0 === pos.begin) for (;pos.begin < firstNonMaskPos && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    } else {
                        for (checkVal(!0); pos.begin < len && !tests[pos.begin]; ) pos.begin++;
                        input.caret(pos.begin, pos.begin);
                    }
                    tryFireCompleted();
                }
                function blurEvent() {
                    checkVal(), input.val() != focusText && input.change();
                }
                function keydownEvent(e) {
                    if (!input.prop("readonly")) {
                        var pos, begin, end, k = e.which || e.keyCode;
                        oldVal = input.val(), 8 === k || 46 === k || iPhone && 127 === k ? (pos = input.caret(), 
                        begin = pos.begin, end = pos.end, end - begin === 0 && (begin = 46 !== k ? seekPrev(begin) : end = seekNext(begin - 1), 
                        end = 46 === k ? seekNext(end) : end), clearBuffer(begin, end), shiftL(begin, end - 1), 
                        e.preventDefault()) : 13 === k ? blurEvent.call(this, e) : 27 === k && (input.val(focusText), 
                        input.caret(0, checkVal()), e.preventDefault());
                    }
                }
                function keypressEvent(e) {
                    if (!input.prop("readonly")) {
                        var p, c, next, k = e.which || e.keyCode, pos = input.caret();
                        if (!(e.ctrlKey || e.altKey || e.metaKey || 32 > k) && k && 13 !== k) {
                            if (pos.end - pos.begin !== 0 && (clearBuffer(pos.begin, pos.end), shiftL(pos.begin, pos.end - 1)), 
                            p = seekNext(pos.begin - 1), len > p && (c = String.fromCharCode(k), tests[p].test(c))) {
                                if (shiftR(p), buffer[p] = c, writeBuffer(), next = seekNext(p), android) {
                                    var proxy = function() {
                                        $.proxy($.fn.caret, input, next)();
                                    };
                                    setTimeout(proxy, 0);
                                } else input.caret(next);
                                pos.begin <= lastRequiredNonMaskPos && tryFireCompleted();
                            }
                            e.preventDefault();
                        }
                    }
                }
                function clearBuffer(start, end) {
                    var i;
                    for (i = start; end > i && len > i; i++) tests[i] && (buffer[i] = getPlaceholder(i));
                }
                function writeBuffer() {
                    input.val(buffer.join(""));
                }
                function checkVal(allow) {
                    var i, c, pos, test = input.val(), lastMatch = -1;
                    for (i = 0, pos = 0; len > i; i++) if (tests[i]) {
                        for (buffer[i] = getPlaceholder(i); pos++ < test.length; ) if (c = test.charAt(pos - 1), 
                        tests[i].test(c)) {
                            buffer[i] = c, lastMatch = i;
                            break;
                        }
                        if (pos > test.length) {
                            clearBuffer(i + 1, len);
                            break;
                        }
                    } else buffer[i] === test.charAt(pos) && pos++, partialPosition > i && (lastMatch = i);
                    return allow ? writeBuffer() : partialPosition > lastMatch + 1 ? settings.autoclear || buffer.join("") === defaultBuffer ? (input.val() && input.val(""), 
                    clearBuffer(0, len)) : writeBuffer() : (writeBuffer(), input.val(input.val().substring(0, lastMatch + 1))), 
                    partialPosition ? i : firstNonMaskPos;
                }
                var input = $(this), buffer = $.map(mask.split(""), function(c, i) {
                    return "?" != c ? defs[c] ? getPlaceholder(i) : c : void 0;
                }), defaultBuffer = buffer.join(""), focusText = input.val();
                input.data($.mask.dataName, function() {
                    return $.map(buffer, function(c, i) {
                        return tests[i] && c != getPlaceholder(i) ? c : null;
                    }).join("");
                }), input.one("unmask", function() {
                    input.off(".mask").removeData($.mask.dataName);
                }).on("focus.mask", function() {
                    if (!input.prop("readonly")) {
                        clearTimeout(caretTimeoutId);
                        var pos;
                        focusText = input.val(), pos = checkVal(), caretTimeoutId = setTimeout(function() {
                            writeBuffer(), pos == mask.replace("?", "").length ? input.caret(0, pos) : input.caret(pos);
                        }, 10);
                    }
                }).on("blur.mask", blurEvent).on("keydown.mask", keydownEvent).on("keypress.mask", keypressEvent).on("input.mask paste.mask", function() {
                    input.prop("readonly") || setTimeout(function() {
                        var pos = checkVal(!0);
                        input.caret(pos), tryFireCompleted();
                    }, 0);
                }), chrome && android && input.off("input.mask").on("input.mask", androidInputEvent), 
                checkVal();
            });
        }
    });
});
var MSCom = MSCom || {};
MSCom.CMS = MSCom.CMS || {};
MSCom.CMS.Mashup = MSCom.CMS.Mashup || {};
MSCom.CMS.Mashup.ContentIncludes = MSCom.CMS.Mashup.ContentIncludes || {};

MSCom.CMS.Mashup.ContentInclude2 = function ($renderdiv, cmsURL, action) {

    if (!action) {
        action = 'html';
    }
    this._locale = $renderdiv.attr('data-urllocale');

    if (cmsURL) {
        this._url = cmsURL + '/' + this._locale + '/api/controls/contentinclude/' + action;
    }
    else {
        this._url = window.location.protocol + '//' + window.location.host + '/' + this._locale + '/api/controls/contentinclude/' + action;
    }
    // TODO: Remove the next as we are no longer calling a Servlet in Cascade
    //this._url = '/bin/microsoft/705AC061688FFD7F5721DA844D01DF85433856EAFAA8441ECE94B270685CA2DB.json';
    // But the connector instead to fetch the action specified in the original SiteMuse tag <mscom:softwarerecoveryproductinfodatasource>...:
    // this._url = "https://sds-aem-connector-ehesgceag6gscbff.westus-01.azurewebsites.net/api/";
    this._url = $('#endpoint-svc').val();
    //GetLanguagesByProductEditionId?profile=606624d44113&ProductEditionId=1050&sessionID=d51e3009-a435-4977-8cb2-01c98474ddb4;"



    // BY LUIS: SoftwareDownload_LanguageSelectionByProductEdition
    /**
     * <div id="SoftwareDownload_LanguageSelectionByProductEdition"
     *  class="mscom-ajax-contentinclude"
     *  data-defaultpageid="a8f8f489-4c7f-463a-9ca6-5cff94d8d041"
     *  data-urllocale="en-us"
     *  data-programmablecontentarea=""
     *  data-controlattributesmapping=""
     *  data-host="www.microsoft.com"
     *  data-host-segments="software-download%2cwindows11"
     *  data-host-querystring=""
     *  data-ajaxquery="">
     * </div>
     */

    this._collection = this.getQueryValue(window.location.href, 'CollectionId');
    this._dataaction = $renderdiv.attr('data-action');                                  // NEWTON: This is to specify the Backend action object to fetch
    // i.e.: GetSkuInformationByProductEdition, ValidateUserAsAmsUser
    this._pageId = $renderdiv.attr('data-defaultPageId');                               // data-defaultpageid="a8f8f489-4c7f-463a-9ca6-5cff94d8d041"
    this._ppaId = $renderdiv.attr('data-ProgrammableContentArea');                      // data-programmablecontentarea=""
    this._host = $renderdiv.attr('data-Host');                                          // data-host="www.microsoft.com"
    this._hostsegments = $renderdiv.attr('data-host-segments');                         // data-host-segments="software-download%2cwindows11"
    this._hostquery = $renderdiv.attr('data-host-querystring');                         // data-host-querystring=""
    this._controlAttributeMapping = $renderdiv.attr('data-ControlAttributesMapping');   // data-controlattributesmapping=""
    this._action = action;                                                              // 'html' if not supplied
    var ajaxQuerystring = $renderdiv.attr('data-ajaxQuery');                            // data-ajaxquery=""
    if (ajaxQuerystring) {
        this._query = JSON.parse(ajaxQuerystring);                                      // JSON form of ajaxQuerystring
    }
    this._divToRender = $renderdiv;                                                     // The div of the fragment place holder


};

MSCom.CMS.Mashup.ContentInclude2.prototype = {
    getQueryValue: function (url, key) {
        var regex = new RegExp("[\\?&]" + key + "=([^&#]*)", "gi");
        var qs = regex.exec(url);
        if (qs == null) {
            return "";
        }
        else {
            return decodeURIComponent(qs[1].replace(/\+/g, " "));
        }
    },
    render: function (successHandler, errorHandler, timeout) {
        var divToRender = this._divToRender;                    // Id to append content to
        var url = this._url + '?pageId=' + this._pageId +
            '&host=' + this._host +
            '&segments=' + this._hostsegments +
            '&query=' + this._hostquery;
        if (this._collection) {
            url += "&CollectionId=" + this._collection;
        }
        if (this._dataaction) {                                     // NEWTON: This is so that the receiving end knows what action object to fetch
            url += "&DataAction=" + this._dataaction;
        }
        if (this._ppaId) {
            url += "&ProgrammableContentArea=" + this._ppaId;
        }
        for (var name in this._query) {
            url += "&" + name + "=" + this._query[name];
        }

        // For Cascade Server side:
        n = 5;
        currentPath = window.location.pathname;
        fullPath = currentPath.substring(0, currentPath.length - n);
        type = 'sds/components/content/sdscontainer/v1/sdscontainer';


        url = this._url + this._query.action +
            '?profile=606624d44113' +
            '&ProductEditionId=' + this._query.productEditionId +
            '&SKU=' + this._query.skuId +
            '&friendlyFileName=' + this._query.friendlyFileName +
            '&Locale=' + softwareDownload.getLocale() +
            '&sessionID=' + this._query.sessionId;

        var settings = {
            url: url,
            method: "GET",
            dataType: "json",
            success: function (rsp) {
                if (rsp != null) {




                    if (successHandler) {
                        successHandler(rsp);
                    }

                }
            },
            error: function (jqXHR, textStatus, errorThrown) {





                if (errorHandler) {
                    errorHandler(jqXHR, textStatus, errorThrown);
                }
            }
        };

        if (timeout) {
            settings.timeout = timeout;
        }

        $.ajax(settings);

    }
};



//SoftwareDownload Cascade
(function (softwareDownload, $, undefined) {

    // Init - Cascade
    $('html').attr('data-lang', $('html').attr('lang'));

    $(function() {
        $('#download-links').attr('translate', 'no');
    });


    softwareDownload.cascade = softwareDownload.cascade || {};



 
    softwareDownload.cascade.isValid = function (data) {
        var evaluation = data === undefined ;        
        // var evaluation = data === null || data === undefined || data === '' ||
        //     (Array.isArray(data) && data.length === 0) ||
        //     (typeof data === 'object' && Object.keys(data).length === 0 && data.constructor === Object);

        return !evaluation;
    }


    softwareDownload.cascade.stringToBoolean = function (str) {
        if (str.toLowerCase() === 'true') {
            return true;
        } else if (str.toLowerCase() === 'false') {
            return false;
        } else {
            return null; // Or throw an error if input is invalid
        }
    }

    softwareDownload.cascade.evaluateRenderingCondition = function (node, action, data) {

        // Find divToRender's asserted div
        var divToRenderAssertion = node.find('[data-condition][data-conditionAssertion]');

        divToRenderAssertion.each(function () {
            var condition = $(this).attr('data-condition');
            var conditionAssertion = $(this).attr('data-conditionAssertion');
            if (condition.toLowerCase().includes(action.toLowerCase())) {
                var evaluation;
                var conditionHierarcy = condition.split('.');
                var value;
                switch (conditionHierarcy.length) {
                    case 1:
                        var value = data;
                        break;
                    case 2:
                        var value = data[conditionHierarcy[1]];
                        break;
                    case 3:
                        var value = data[conditionHierarcy[1]][conditionHierarcy[2]];
                        break;
                    default:
                        var value = data;
                }
                evaluation = softwareDownload.cascade.isValid(value);

                if (softwareDownload.cascade.stringToBoolean(conditionAssertion) == evaluation) {
                    $(this).show();
                }
                else {
                    $(this).hide();
                }

                // Replace value of evaluation where used:
                // TODO: Once this is replaced it stays replaced for good, need to change the strategy.
                //  Also, once the modal is dismissed, it stays dimissed for good as well.                
                // var htmlCode = $(this).html();
                // var replacedHtmlCode = htmlCode.replace("{{{Value}}}", value);
                // $(this).html(replacedHtmlCode);
                // $(this).select(".modal").show();

                var errorTags = $(this).find('#errorModalMessage');
                errorTags.each(function () {
                    //$(this).empty();  // Moved below, just used if error messages are available
                    //$(this).append(value);  // TODO: This assumes the condition under test is the error message, ALSO it maybe a list
                    var errorMessages = '';

                    if (softwareDownload.cascade.isValid(data.Errors))
                    {
                        if (data.Errors.length > 0)
                        {
                            $(this).empty();

                            data.Errors.forEach(function (currentValue, index, array) {
                                //errorMessages += currentValue.Value + '<br/>';
                                errorMessages += softwareDownload.cascade.formatMessage(currentValue) + '<br/>';
                            });
                        }
                    }
                    $(this).append(errorMessages);

                    $(this).parents(".modal").show();
                });
            }
        });

    }

    softwareDownload.cascade.formatMessage = function(data) {
        var key = data.Key;
        var formatted = data.Value;

        switch (key) {
            case 'ErrorSettings.SentinelReject':
                formatted = $('#msg-01').val() + softwareDownload.getSession() + '.';
                break;
            default:
                formatted = $('#msg-02').val();
        }

        return formatted;
    }

    softwareDownload.cascade.populateLanguages = function (node, action, data) {

        // Evaluate data for conditional rendering
        softwareDownload.cascade.evaluateRenderingCondition(node, action, data);

        // Update asserted div's HTML with response
        var dropdown = node.find('select');

        // Clean all but the first default element
        dropdown.children('option:not(:first)').remove();

        if (softwareDownload.cascade.isValid(data.Skus))
        {
            $.each(data.Skus, function (index, item) {
                //var option = $('<option></option>').attr('value', '{&quot;id&quot;:&quot;' + item.Id + '&quot;,&quot;language&quot;:&quot;' + item.Language + '&quot;}').text(item.LocalizedLanguage);
                var option = $('<option></option>').attr('value', '{"id":"' + item.Id + '","language":"' + item.Language + '"}').text(item.LocalizedLanguage);
                dropdown.append(option);
            });
        }


    }


    softwareDownload.cascade.populateDownloadLinks = function (node, action, data) {

        // Evaluate data for conditional rendering
        softwareDownload.cascade.evaluateRenderingCondition(node, action, data);
        var color = '';
        if ($('#theme-id').val() == 'emerald')
        {
            color = 'bg-green';
        }

        // Populate Localized display name:  

        if (data.ProductDownloadOptions != undefined)
        {
            var localizedDisplayNameNode = node.find('#localized-productDisplayName');
            localizedDisplayNameNode.empty();
            localizedDisplayNameNode.append(data.ProductDownloadOptions[0].LocalizedProductDisplayName);
        }

        // Populate expiration time:   
        if (data.DownloadExpirationDatetime != undefined)
        {     
            var expirationNode = node.find('#expiration-time');
            expirationNode.empty();
            expirationNode.append(data.DownloadExpirationDatetime);
        }

        // Populate download link 
        if (data.ProductDownloadOptions != undefined)
        {     
            var downloadLinksNode = node.find('#download-links');
            downloadLinksNode.empty();

            if (Array.isArray(data['ProductDownloadOptions'])) {
                var links = data['ProductDownloadOptions'];

                links.forEach(function (currentValue, index, array) {
                    // replace markups with currentValue[<MARKUP>]
                    var linkCode = `<div>
                                        <div>
                                            <a class="btn btn-primary ${color}" style="margin: 0 0 1.5em 0;" href="${currentValue.Uri}">
                                                <span class="product-download-type">${currentValue.DownloadType}</span> Download
                                            </a>
                                            <input type="hidden" class="product-download-hidden" value="{&quot;Name&quot;: &quot;${currentValue.Name}&quot;,&quot;Uri&quot;: &quot;${currentValue.Uri}&quot;,&quot;ProductDisplayName&quot;: &quot;${currentValue.ProductDisplayName}&quot;,&quot;Language&quot;: &quot;${currentValue.Language}&quot;,&quot;LocalizedLanguage&quot;: &quot;${currentValue.LocalizedLanguage}&quot;,&quot;LocalizedProductDisplayName&quot;: &quot;${currentValue.LocalizedProductDisplayName}&quot;,&quot;DownloadType&quot;: ${currentValue.DownloadType} }"></input>
                                        </div>
                                    </div>`;

                    downloadLinksNode.append(linkCode);
                });
            }
        }

    }

    
    softwareDownload.cascade.downloadLinksForFriendlyName = function (node, action, data) {

        // Evaluate data for conditional rendering
        softwareDownload.cascade.evaluateRenderingCondition(node, action, data);

        // Populate download link 
        if (data.ProductDownload != undefined && data.ProductDownload.Uri != undefined)
        {     
            let downloadLinksNode = node.find('#download-links');
            downloadLinksNode.empty();

            let scriptCode = `
            <script>
                var softwareDownload = softwareDownload || {};
                    softwareDownload.productDownload = {
                        'uri': '${data.ProductDownload.Uri}',
                        'downloadType': '${data.ProductDownload.DownloadType}'
                    };
            </script>`;
            
            downloadLinksNode.append(scriptCode);

            // if (Array.isArray(data['ProductDownloadOptions'])) {
            //     var links = data['ProductDownloadOptions'];

            //     links.forEach(function (currentValue, index, array) {
            //         // replace markups with currentValue[<MARKUP>]
            //         var linkCode = `<div>
            //                             <div>
            //                                 <a class="btn btn-primary ${color}" style="margin: 0 0 1.5em 0;" href="${currentValue.Uri}">
            //                                     <span class="product-download-type">${currentValue.DownloadType}</span> Download
            //                                 </a>
            //                                 <input type="hidden" class="product-download-hidden" value="{&quot;Name&quot;: &quot;${currentValue.Name}&quot;,&quot;Uri&quot;: &quot;${currentValue.Uri}&quot;,&quot;ProductDisplayName&quot;: &quot;${currentValue.ProductDisplayName}&quot;,&quot;Language&quot;: &quot;${currentValue.Language}&quot;,&quot;LocalizedLanguage&quot;: &quot;${currentValue.LocalizedLanguage}&quot;,&quot;LocalizedProductDisplayName&quot;: &quot;${currentValue.LocalizedProductDisplayName}&quot;,&quot;DownloadType&quot;: ${currentValue.DownloadType} }"></input>
            //                             </div>
            //                         </div>`;

            //         downloadLinksNode.append(linkCode);
            //     });
            // }
        }

    }

}(window.softwareDownload = window.softwareDownload || {}, jQuery));

(function (softwareDownload, $, undefined) {

    softwareDownload.session = softwareDownload.session || {};

    var _sessionId;

    softwareDownload.session.init = function (orgId) {

        var sessionId = softwareDownload.session.get();
        var scriptUrl = "https://vlscppe.microsoft.com/fp/tags.js?org_id=" + orgId + "&session_id=" + sessionId;
        var iframeUrl = "https://vlscppe.microsoft.com/tags?org_id=" + orgId + "&session_id=" + sessionId;

        var scriptUrlDFP = "https://ov-df.microsoft.com/mdt.js?instanceId=3540d1d7-3513-4ec3-b52a-a8617733a58c&pageId=si&session_id=" + sessionId;

        var inputElement = document.createElement("input");
        inputElement.id = "session-id";
        inputElement.type = "hidden";
        inputElement.value = sessionId;

        var scriptElement = document.createElement("script");
        scriptElement.type = 'text/javascript';
        scriptElement.src = scriptUrl;

        var scriptElementDFP = document.createElement("script");
        scriptElementDFP.type = 'text/javascript';
        scriptElementDFP.src = scriptUrlDFP;

        var noScriptElement = document.createElement("noscript");
        var iFrameElement = document.createElement("iframe");
        iFrameElement.setAttribute("class", "sFrame");
        iFrameElement.setAttribute("src", iframeUrl);
        iFrameElement.setAttribute("title", "blank");
        noScriptElement.appendChild(iFrameElement);

        document.body.insertBefore(noScriptElement, document.body.firstChild);
        document.body.insertBefore(scriptElement, document.body.firstChild);
        document.body.insertBefore(scriptElementDFP, document.body.firstChild);
        document.body.insertBefore(inputElement, document.body.firstChild);
    }

    softwareDownload.session.get = function () {

        var sesison_id_esi = $('#session-id-esi').val();

        if (_sessionId === undefined) {

            if (sesison_id_esi != undefined) {
                _sessionId = sesison_id_esi;
            }
            else {
                _sessionId = generateUUID();
            }
        }

        return _sessionId;
    }

    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };


}(window.softwareDownload = window.softwareDownload || {}, jQuery));
(function (softwareDownload, undefined) {
    softwareDownload.userAttributes = softwareDownload.userAttributes || {};

    var userAgent = navigator.userAgent;

    var platforms = [
        { name: 'Windows 10', regex: /(Windows 10.0|Windows NT 10.0)/ },
        { name: 'Windows 8.1', regex: /(Windows 8.1|Windows NT 6.3)/ },
        { name: 'Windows 8', regex: /(Windows 8|Windows NT 6.2)/ },
        { name: 'Windows 7', regex: /(Windows 7|Windows NT 6.1)/ },
        { name: 'Windows Vista', regex: /Windows NT 6.0/ },
        { name: 'Windows Server 2003', regex: /Windows NT 5.2/ },
        { name: 'Windows XP', regex: /(Windows NT 5.1|Windows XP)/ },
        { name: 'Windows 2000', regex: /(Windows NT 5.0|Windows 2000)/ },
        { name: 'Windows ME', regex: /(Win 9x 4.90|Windows ME)/ },
        { name: 'Windows 98', regex: /(Windows 98|Win98)/ },
        { name: 'Windows 95', regex: /(Windows 95|Win95|Windows_95)/ },
        { name: 'Windows NT 4.0', regex: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
        { name: 'Windows CE', regex: /Windows CE/ },
        { name: 'Windows 3.11', regex: /Win16/ },
        { name: 'Android', regex: /Android/ },
        { name: 'Open BSD', regex: /OpenBSD/ },
        { name: 'Sun OS', regex: /SunOS/ },
        { name: 'Linux', regex: /(Linux|X11)/ },
        { name: 'iOS', regex: /(iPhone|iPad|iPod)/ },
        { name: 'Mac OS X', regex: /Mac OS X/ },
        { name: 'Mac OS', regex: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
        { name: 'QNX', regex: /QNX/ },
        { name: 'UNIX', regex: /UNIX/ },
        { name: 'BeOS', regex: /BeOS/ },
        { name: 'OS/2', regex: /OS\/2/ },
        { name: 'Search Bot', regex: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
    ];

    softwareDownload.userAttributes.setUserAgent = function (value) {
        if (typeof value !== 'string') {
            throw 'value is not of type string';
        }

        userAgent = value;
    }

    softwareDownload.userAttributes.getUserAgent = function () {
        return userAgent;
    }

    softwareDownload.userAttributes.getBrowser = function () {

        var browser = {
            name: navigator.appName,
            version: '' + parseFloat(navigator.appVersion),
            major: parseInt(navigator.appVersion, 10)
        };

        if ((verOffset = userAgent.indexOf('Opera')) != -1) {
            browser.name = 'Opera';
            browser.version = userAgent.substring(verOffset + 6);
            if ((verOffset = userAgent.indexOf('Version')) != -1) {
                browser.version = userAgent.substring(verOffset + 8);
            }
        } else if ((verOffset = userAgent.indexOf('MSIE')) != -1) {
            browser.name = 'Microsoft Internet Explorer';
            browser.version = userAgent.substring(verOffset + 5);
        } else if ((verOffset = userAgent.indexOf('Chrome')) != -1) {
            browser.name = 'Chrome';
            browser.version = userAgent.substring(verOffset + 7);
        } else if ((verOffset = userAgent.indexOf('Safari')) != -1) {
            browser.name = 'Safari';
            browser.version = userAgent.substring(verOffset + 7);
            if ((verOffset = userAgent.indexOf('Version')) != -1) {
                browser.version = userAgent.substring(verOffset + 8);
            }
        } else if ((verOffset = userAgent.indexOf('Firefox')) != -1) {
            browser.name = 'Firefox';
            browser.version = userAgent.substring(verOffset + 8);
        } else if (userAgent.indexOf('Trident/') != -1) {
            browser.name = 'Microsoft Internet Explorer';
            browser.version = userAgent.substring(userAgent.indexOf('rv:') + 3);
        } else if ((nameOffset = userAgent.lastIndexOf(' ') + 1) < (verOffset = userAgent.lastIndexOf('/'))) {
            browser.name = userAgent.substring(nameOffset, verOffset);
            browser.version = userAgent.substring(verOffset + 1);
            if (browser.name.toLowerCase() == browser.name.toUpperCase()) {
                browser.name = navigator.appName;
            }
        }

        // trim the version string
        if ((ix = browser.version.indexOf(';')) != -1)
            browser.version = browser.version.substring(0, ix);
        if ((ix = browser.version.indexOf(' ')) != -1)
            browser.version = browser.version.substring(0, ix);
        if ((ix = browser.version.indexOf(')')) != -1)
            browser.version = browser.version.substring(0, ix);

        browser.major = parseInt('' + browser.version, 10);
        if (isNaN(browser.major)) {
            browser.version = '' + parseFloat(navigator.appVersion);
            browser.major = parseInt(navigator.appVersion, 10);
        }

        return browser;
    }

    softwareDownload.userAttributes.getCpu = function () {

        var cpu = {
            architecture: ''
        };

        var x64Regex = /WOW64|Win64|amd64/;

        if (x64Regex.test(userAgent)) {
            cpu.architecture = 'x64';
        } else {
            cpu.architecture = '';
        }

        return cpu;
    }

    softwareDownload.userAttributes.getOs = function () {
        var os = {
            name: '',
            version: ''
        };

        for (var key in platforms) {
            var platform = platforms[key];

            if (platform.regex.test(userAgent)) {
                os.name = platform.name;
                break;
            }
        }

        if (/Windows/.test(os.name)) {
            os.version = /Windows (.*)/.exec(os.name)[1];
            os.name = 'Windows';
        }

        var version = null;
        switch (os.name) {
            case 'Mac OS X':
                version = /Mac OS X (10[\.\_\d]+)/.exec(userAgent);
                os.version = version == null ? '' : version[1];
                break;

            case 'Android':
                version = /Android(-| )([\.\_\d]+)/.exec(userAgent);
                os.version = version == null ? '' : version[1]

                break;

            case 'iOS':
                os.version = /OS (\d+)_(\d+)_?(\d+)?/.exec(userAgent);
                os.version = version == null ? '' : os.version[1] + '.' + os.version[2] + '.' + (os.version[3] | 0);
                break;
        }

        return os;
    }

}(window.softwareDownload = window.softwareDownload || {}));
(function (softwareDownload, $, undefined) {
    softwareDownload.navigation = softwareDownload.navigation || {};

    var _selectors = {};
    var _views = {};

    var _defaultOptions = {
        showOnly: false
    };

    softwareDownload.navigation.addView = function (view) {

        addSelectors(_selectors, view.selectors);

        if (view.name !== undefined && !_views.hasOwnProperty(view.name)) {
            _views[view.name] = {
                selectors: {},
                options: getOptions(view.options)
            };

            addSelectors(_views[view.name].selectors, view.selectors);
        }
    }

    softwareDownload.navigation.showView = function (viewName) {

        var view = getView(viewName);

        if (view.options.showOnly) {
            for (var selector in view.selectors)
            {
                isVisible(selector, true);
            }
        } else {
            for (var selector in _selectors) {
                if (view.selectors[selector] === undefined) {
                    isVisible(selector, false);
                } else {
                    isVisible(selector, true);
                }
            }
        }
    }

    softwareDownload.navigation.addToView = function (viewToAdd) {

        var view = getView(viewToAdd.name);

        addSelectors(_selectors, viewToAdd.selectors);

        addSelectors(view.selectors, viewToAdd.selectors);
    }

    softwareDownload.navigation.addToAllViews = function (selectors) {

        addSelectors(_selectors, selectors);

        for (var view in _views) {
            if (_views.hasOwnProperty(view)) {
                addSelectors(_views[view].selectors, selectors);
            }
        }
    }

    function getView(viewName) {
        if (!_views.hasOwnProperty(viewName)) {
            throw 'View \'' + viewName + '\' not found.';
        }

        return _views[viewName];
    }

    function isVisible(selector, option) {
        // if (option) {
        //     $(selector).parentsUntil(".row-fluid").parent().show();
        //     $(selector).show();
        // } else {
        //     $(selector).parentsUntil(".row-fluid").parent().hide();
        // }
        // NEWTON: Visibility in SiteMuse was handled by hinding/showing the parent element with the class "row-fluid".
        //         This is not available in Cascade, hence hiding/showing the inmediate parent will be our experimental alternative
        if (option) {
            $(selector).parent().show();
            $(selector).show();
        } else {
            $(selector).parent().hide();
        }
    }

    function getOptions(options) {
        var newOptions = {};

        for (var option in _defaultOptions) {
            newOptions[option] = options !== undefined && options.hasOwnProperty(option)
                ? options[option]
                : _defaultOptions[option];
        }

        return newOptions;
    }

    function addSelectors(baseSelectors, selectorsToAdd) {
        selectorsToAdd.forEach(function (selector) {
            if (!baseSelectors.hasOwnProperty(selector)) {
                baseSelectors[selector] = selector;
            }
        });
    }

}(window.softwareDownload = window.softwareDownload || {}, jQuery));
(function (softwareDownload, $, undefined) {
    softwareDownload.siteConfiguration = softwareDownload.siteConfiguration || {};

    var _configurations = [];

    var _defaultConfiguration = {
        version: "",
        orgId: "",
        locales: [],
        pages: []
    };

    softwareDownload.siteConfiguration.add = function (configuration) {

        var newConfiguration = setConfiguration(configuration);

        _configurations.push(newConfiguration);
    }

    softwareDownload.siteConfiguration.getVersion = function (locale, page) {

        var location = getLocation(locale, page);

        var configuration = findConfiguration(location);

        return configuration.version;
    }

    softwareDownload.siteConfiguration.getOrgId = function (locale, page) {

        var location = getLocation(locale, page);

        var configuration = findConfiguration(location);

        return configuration.orgId;
    }

    function findConfiguration(location) {

        var configuration;
        var priority = 999;

        for (var i = _configurations.length - 1; i >= 0; i--) {

            var existLocale = existsIgnoreCase(_configurations[i].locales, location.locale);
            var existPage = existsIgnoreCase(_configurations[i].pages, location.page)

            var hasLocale = _configurations[i].locales.length != 0;
            var hasPage = _configurations[i].pages.length != 0;

            if (existPage && existLocale) {
                return _configurations[i];
            } else if (priority > 1 && existPage && !hasLocale) {
                configuration = _configurations[i];
                priority = 1;
            } else if (priority > 2 && existLocale && !hasPage) {
                configuration = _configurations[i];
                priority = 2;
            } else if (priority > 3 && !hasPage && !hasLocale) {
                configuration = _configurations[i];
                priority = 3;
            }
        }

        return configuration;
    }

    function setConfiguration(configuration) {
        var newConfiguration = {};

        for (var property in _defaultConfiguration) {
            newConfiguration[property] = configuration !== undefined && configuration.hasOwnProperty(property)
                ? configuration[property]
                : _defaultConfiguration[property];
        }

        return newConfiguration;
    }

    function getLocation(locale, page) {
        var defaultLocale = locale === undefined ? getLocale() : locale;
        var defaultPage = page === undefined ? getCurrentPage(window.location.pathname) : page;

        return { locale: defaultLocale, page: defaultPage };
    }

    function getLocale () {
        var sdsLocale = "";
        var splitPath = window.location.pathname.split("/");

        if (splitPath.length > 1)
            sdsLocale = splitPath[1];

        return sdsLocale;
    };

    //TODO: Reused acrossed different scripts. Consolidate in one.
    function getCurrentPage(pathname) {
        var segments = pathname.split("/");
        for (var i = segments.length - 1; i >= 0; i--) {
            if (segments[i] !== '') {
                return segments[i];
            }
        }

        return '';
    }

    function existsIgnoreCase(array, value) {
        return array.some(function (arrayValue) {
            return arrayValue.toLowerCase() === value.toLowerCase()
        });
    }

}(window.softwareDownload = window.softwareDownload || {}, jQuery));
//SoftwareDownload Controller
(function (softwareDownload, $, undefined) {

    softwareDownload.pageType = {
        unknown: 'unknown',
        other: 'other',
        wip: 'wip',
        localePicker: 'localePicker',
        systembuilder: 'systembuilder',
        dac: 'dac',
        Win10NRS3FeaturePack: 'Win10NRS3FeaturePack'
    }

    softwareDownload.eventTarget = null;

    softwareDownload.setDownloadTypeText = function () {
        $(".product-download-type").each(function () {
            var text = $(this).text();

            if (text == "0" || text.toLowerCase() == "isox86") {
                $(this).text("32-bit");
            } else if (text == "1" || text.toLowerCase() == "isox64") {
                $(this).text("64-bit");
            } else {
                $(this).parent().text("Download Now");
            }
        });
    };

    softwareDownload.isValidProductKey = function () {
        var pattern = /[\w\d]{5}-[\w\d]{5}-[\w\d]{5}-[\w\d]{5}-[\w\d]{5}/;
        return pattern.test($('#pk-input-key').val());
    };

    softwareDownload.getValueOrNull = function (selector) {
        var value = $(selector).val();
        if (value == 'null' || value == '' || value == null) {
            return null;
        } else {
            return value;
        }
    };

    softwareDownload.configureViews = function () {
        softwareDownload.navigation.addView({
            name: 'homePage',
            selectors: ['#SoftwareDownload_Introduction', '#SoftwareDownload_DownloadSteps', '#SoftwareDownload_KeyEntry', '#SoftwareDownload_EditionNotes', '#SoftwareDownload_EditionSelection', '#SoftwareDownload_EditionSelection2']
        });

        softwareDownload.navigation.addView({
            name: 'productKeyLanguage',
            selectors: ['#SoftwareDownload_Introduction', '#SoftwareDownload_DownloadSteps', '#SoftwareDownload_KeyEntry', '#SoftwareDownload_LanguageSelectionByKey']
        });

        softwareDownload.navigation.addView({
            name: 'productEditionLanguage_a',
            selectors: ['#SoftwareDownload_Introduction', '#SoftwareDownload_EditionNotes', '#SoftwareDownload_EditionSelection', '#SoftwareDownload_EditionSelection2', '#SDS_LanguageSelectionByProductEdition_a']
        });

        softwareDownload.navigation.addView({
            name: 'productEditionLanguage_b',
            selectors: ['#SoftwareDownload_Introduction', '#SoftwareDownload_EditionNotes', '#SoftwareDownload_EditionSelection', '#SoftwareDownload_EditionSelection2', '#SDS_LanguageSelectionByProductEdition_b']
        });

        softwareDownload.navigation.addView({
            name: 'productEditionLanguage',
            selectors: ['#SoftwareDownload_Introduction', '#SoftwareDownload_EditionNotes', '#SoftwareDownload_EditionSelection', '#SoftwareDownload_EditionSelection2', '#SDS_LanguageSelectionByProductEdition', '#SDS_LanguageSelectionByProductEdition_arm']
        });

        softwareDownload.navigation.addView({
            name: 'productEditionLanguage2',
            selectors: ['#SoftwareDownload_Introduction', '#SoftwareDownload_EditionNotes', '#SoftwareDownload_EditionSelection', '#SoftwareDownload_EditionSelection2', '#SDS_LanguageSelectionByProductEdition2']
        });

        softwareDownload.navigation.addView({
            name: 'productDownload_a',
            selectors: ['#SoftwareDownload_DownloadLinks_a', '#SoftwareDownload_Email', '#SoftwareDownload_Feedback']
        });

        softwareDownload.navigation.addView({
            name: 'productDownload_b',
            selectors: ['#SoftwareDownload_DownloadLinks_b', '#SoftwareDownload_Email', '#SoftwareDownload_Feedback']
        });

        softwareDownload.navigation.addView({
            name: 'productDownload',
            selectors: ['#SoftwareDownload_DownloadLinks', '#SoftwareDownload_DownloadLinkData', '#SoftwareDownload_Email', '#SoftwareDownload_Feedback']
        });

        softwareDownload.navigation.addView({
            name: 'productDownloadError',
            selectors: ['#SoftwareDownload_DownloadLinks', '#SoftwareDownload_DownloadLinkData', '#SoftwareDownload_DownloadLinks_a', '#SoftwareDownload_DownloadLinks_b'],
            options: {
                showOnly: true
            }
        });

        //Omitting the name property will always hide the selector unless specified on another view.
        softwareDownload.navigation.addView({
            selectors: ['#windows10-topBanner']
        });

        var userOs = softwareDownload.userAttributes.getOs();

        if (userOs.name.toLowerCase() == 'windows' && userOs.version == '10') {
            softwareDownload.navigation.addToAllViews(['#windows10-topBanner']);
        }
    };

    softwareDownload.getKey = function () {
        return $("#pk-input-key").val();
    };

    softwareDownload.getSession = function () {
        return $("#session-id").val();
    };

    //TODO: Reused acrossed different scripts. Consolidate in one.
    softwareDownload.getLocale1 = function () {
        var sdsLocale = "";
        var splitPath = window.location.pathname.split("/");

        if (splitPath.length > 1)
            sdsLocale = splitPath[1];

        return sdsLocale;
    };
    

    softwareDownload.getLocale = function () {
        var sdsLocale = 'en-us';
        var orignalLocale = $('html').attr('data-lang');

        if (orignalLocale != undefined)
        {
            sdsLocale = orignalLocale;
        }


        return sdsLocale;
    };

    softwareDownload.progressModalIsVisible = function (option) {
        var $modal = $("#progress-modal");

        if (option) {
            $modal.show();
        } else {
            $modal.hide();
        }
    };

    softwareDownload.getPageName = function (referrer) {
        var sdsPageName = "";
        var referrerUrl = typeof referrer !== 'undefined' ? referrer : window.location.pathname;

        if (referrerUrl) {
            var referrerPageName = getCurrentPage(referrerUrl);
            if (referrerPageName) {
                sdsPageName = referrerPageName.split("?", 1);
            }
        }

        return sdsPageName;
    };

    softwareDownload.getPageType = function (referrer) {

        if (typeof referrer === 'undefined' || referrer == null) {
            return softwareDownload.pageType.unknown;
        }

        switch (referrer.toString().toLowerCase()) {
            case "faq":
            case "home":
            case "office":
            case "vlacademic":
            case "vlacademiciso":
            case "vlacademicoffice":
            case "vlacademicwindows10":
            case "vlacademicwindows10iso":
            case "windows10":
            case "windows10iso":
            case "windows10startfresh":
            case "windows7":
            case "windows8":
            case "windows8iso":
                return softwareDownload.pageType.other;

            case "windowsinsiderpreviewadk":
            case "windowsinsiderpreviewadvanced":
            case "windowsinsiderpreviewhlk":
            case "windowsinsiderpreviewiso":
            case "windowsinsiderpreviewsdk":
            case "windowsinsiderpreviewwdk":
            case "windowsinsiderpreviewserver":
            case "windowsiot":
            case "windows10iotcore":
                return softwareDownload.pageType.wip;

            case "locale":
                return softwareDownload.pageType.localePicker;

            case "systembuilder":
                return softwareDownload.pageType.systembuilder;

            case "dac":
            case "windowsinsiderpreviewdac":
                return softwareDownload.pageType.dac;
            case "mediafeaturepack":
                return softwareDownload.pageType.Win10NRS3FeaturePack;
            default:
                return softwareDownload.pageType.unknown;
        }
    };

    softwareDownload.getUserDetails = function () {
        ;
        var signedInUserDetails = null;
        if ($("#signedin-user-details").length > 0) {
            var userData = JSON.parse($("#signedin-user-details").val());
            var pageName = softwareDownload.getPageName();
            var userDetails = {
                FirstName: userData.FirstName,
                LastName: userData.LastName,
                Puid: userData.Puid,
                Cid: userData.Cid,
                PageName: pageName
            };
            signedInUserDetails = JSON.stringify(userDetails);
        }
        return signedInUserDetails;
    };


    softwareDownload.systemBuilderAttestationModalIsVisible = function (option) {
        var $modalAttestation = $("#Systembuilder_Attestation");
        var $modalProductEdition = $("#SoftwareDownload_EditionSelection");

        if (option) {
            $modalAttestation.show();
            $modalProductEdition.hide();
        } else {
            $modalAttestation.hide();
            $modalProductEdition.show();
        }
    };

    softwareDownload.renderContent = function (action) {

        var callback;

        softwareDownload.eventTarget = action.target;

        if (action.showProgress !== undefined && action.showProgress) {
            softwareDownload.progressModalIsVisible(true);
            callback = function (response) {
                action.callback(response);

                softwareDownload.progressModalIsVisible(false);
            };
        } else {
            callback = action.callback;
        }

        if (typeof softwareDownload.siteConfiguration !== 'undefined') {
            var page = getCurrentPage(window.location.pathname);
            var locale = softwareDownload.getLocale()

            action.query["sdVersion"] = softwareDownload.siteConfiguration.getVersion(locale, page);
        }

        var $divToRender = $('#' + action.id);
        $divToRender.attr("data-ajaxQuery", JSON.stringify(action.query));

        var fragmentId = $divToRender.attr("data-defaultpageid");

        //MSCom.CMS.Mashup.ContentIncludes['_' + fragmentId] = new MSCom.CMS.Mashup.ContentInclude2($divToRender);
        var content = new MSCom.CMS.Mashup.ContentInclude2($divToRender); // This prepares (for rendering) a new MSCom.CMS.Mashup with the info from the $divToRender
        // MSCom.CMS.Mashup.ContentIncludes['_' + fragmentId].render(callback);
        content.render(callback); // Here is where the rendering is performed  

    };


    softwareDownload.renderContent1 = function (action) {
        alert('inside renderContent1');
        var callback;

        softwareDownload.eventTarget = action.target;

        if (action.showProgress !== undefined && action.showProgress) {
            alert('entering callback1');
            softwareDownload.progressModalIsVisible(true);
            alert('entering callback2');
            callback = function () {
                alert('before calling callback1');
                action.callback();

                softwareDownload.progressModalIsVisible(false);
            };
        } else {
            alert('before calling callback2');
            callback = action.callback;
        }

        alert('after calling callback1');

        if (typeof softwareDownload.siteConfiguration !== 'undefined') {
            var page = getCurrentPage(window.location.pathname);
            var locale = softwareDownload.getLocale()

            action.query["sdVersion"] = softwareDownload.siteConfiguration.getVersion(locale, page);
        }

        alert('after calling callback2');

        var $divToRender = $('#' + action.id);
        $divToRender.attr("data-ajaxQuery", JSON.stringify(action.query));

        alert($divToRender);
        alert(JSON.stringify(action.query));

        alert('after calling callback3');

        var fragmentId = $divToRender.attr("data-defaultpageid");

        alert(fragmentId);

        alert('after calling callback4');

        MSCom.CMS.Mashup.ContentIncludes['_' + fragmentId] = new MSCom.CMS.Mashup.ContentInclude2($divToRender);

        alert('after calling callback5');

        MSCom.CMS.Mashup.ContentIncludes['_' + fragmentId].render(callback);

        alert('after calling callback6');
    };

    //TODO: Extract this to its own file, so that we can configure it easily of different environments.
    softwareDownload.configureSite = function () {
        softwareDownload.siteConfiguration.add({
            version: '2',

            orgId: 'y6jn8c31'
        });
    };

    softwareDownload.parseErrorMessage = function () {

        var version = "";

        if (typeof softwareDownload.siteConfiguration !== 'undefined') {
            version = softwareDownload.siteConfiguration.getVersion();
        }

        if (version == "2") {
            var reg = /715-123130|123130-715/;
            var errorMessage = $('#errorModalMessage');

            if (reg.test(errorMessage.text())) {
                errorMessage.append(' ' + softwareDownload.getSession() + '.');
            }
        }
    };

    softwareDownload.parseProductDownload = function (version) {
        if ($("#card-info-content").length > 0) {
            softwareDownload.setDownloadTypeText();
            softwareDownload.navigation.showView(version);
        } else {
            softwareDownload.navigation.showView('productDownloadError');
        }
    };

    softwareDownload.setReferrerLinks = function (referrer) {
        if (typeof referrer !== 'undefined') {
            $(".mscom-link").each(function () {
                var currentLink = $(this);
                var path = currentLink.attr("href") + referrer;
                currentLink.attr("href", path);
            });
        }
    };

    softwareDownload.setReferrerPage = function () {
        var referrerUrl = document.referrer;
        var referrer = null;

        if (referrerUrl) {
            referrer = softwareDownload.getPageName(referrerUrl);
            var pageType = softwareDownload.getPageType(referrer);

            switch (pageType) {
                case softwareDownload.pageType.other:
                case softwareDownload.pageType.localePicker:
                    softwareDownload.setReferrerLinks(referrer);
                    break;
                case softwareDownload.pageType.wip:
                case softwareDownload.pageType.systembuilder:
                case softwareDownload.pageType.dac:
                case softwareDownload.pageType.Win10NRS3FeaturePack:
                    $("body").hide();
                    alert("This page is only available in English.");
                    window.location.replace(referrerUrl);
                    break;
            }
        }
    };

    softwareDownload.LogWipUserDetails = function () {
        var customEventProperties = null;
        if ($("#user-not-signedin").length > 0) {
            customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                "UserIsNotSignedInLandedOnWipPage",
                softwareDownload.getLocale(),
                softwareDownload.getSession(),
                JSON.stringify({ PageName: softwareDownload.getPageName() }));

            softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
        } else if ($("#user-signedin-not-insider").length > 0) {
            customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                "UserIsSignedInButNotInsider",
                softwareDownload.getLocale(),
                softwareDownload.getSession(),
                softwareDownload.getUserDetails());

            softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
        } else if ($("#windowsinsideriso-extras").length > 0) {
            customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                "UserIsValidWindowsInsider",
                softwareDownload.getLocale(),
                softwareDownload.getSession(),
                softwareDownload.getUserDetails());

            softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
        }
    }

    softwareDownload.LogDpcUserDetails = function () {
        var customEventProperties = null;
        if ($("#user-not-signedin").length > 0) {
            customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                "UserIsNotSignedInLandedOnDpcPage",
                softwareDownload.getLocale(),
                softwareDownload.getSession(),
                JSON.stringify({ PageName: softwareDownload.getPageName() }));

            softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
        } else if ($("#user-signedin-not-dpcUser").length > 0) {
            customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                "UserIsSignedInButNotDpcUser",
                softwareDownload.getLocale(),
                softwareDownload.getSession(),
                softwareDownload.getUserDetails());

            softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
        } else if ($("#dpcuser-notsigned-confidentiality").length > 0) {
            customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                "DpcUserIsSignedInButNotSignedConfidentialityClause",
                softwareDownload.getLocale(),
                softwareDownload.getSession(),
                softwareDownload.getUserDetails());

            softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
        } else if ($("#dpcuser-nothaving-validstatus").length > 0) {
            customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                "DpcUserIsSignedInButNotHavingValidStatus",
                softwareDownload.getLocale(),
                softwareDownload.getSession(),
                softwareDownload.getUserDetails());

            softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
        } else if ($("#Systembuilder_Introduction").length > 0) {
            customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                "UserIsValidDpcUser",
                softwareDownload.getLocale(),
                softwareDownload.getSession(),
                softwareDownload.getUserDetails());

            softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
        }
    }

    softwareDownload.showError = function (isVisible, validationGroup, targetSelector, errorId) {
        if (isVisible) {
            $(validationGroup).addClass('has-error');
            $(targetSelector).attr('aria-describedby', errorId);
            $(targetSelector).attr('aria-invalid', 'true');
            $(targetSelector).focus();
        } else {
            $(validationGroup).removeClass('has-error');
            $(targetSelector).removeAttr('aria-describedby');
            $(targetSelector).attr('aria-invalid', 'false');
        }
    }

    //TODO: Reused acrossed different scripts. Consolidate in one.
    function getCurrentPage(pathname) {
        var segments = pathname.split("/");
        for (var i = segments.length - 1; i >= 0; i--) {
            if (segments[i] !== '') {
                return segments[i];
            }
        }

        return '';
    }

    softwareDownload.parseSystemBuilderAttestation = function () {
        if ($("#Systembuilder_Introduction").length > 0) {
            $("#systembuilder_attestation_chkbox").prop("checked", false);
            $("#systembuilder_attestation_confirm").prop("disabled", true);
            softwareDownload.systemBuilderAttestationModalIsVisible(true);
        }
    }

    softwareDownload.checkSystemBuilderAttestation = function () {
        var pageName = softwareDownload.getPageName();
        var pageType = softwareDownload.getPageType(pageName);

        if (pageType == softwareDownload.pageType.systembuilder) {
            if ($("#systembuilder_attestation_chkbox").prop("checked") == false) {
                var customEventProperties = softwareDownload.AppInsights.getCustomEventProperties(
                    "DpcUserNotSignedTheAttestationBox",
                    softwareDownload.getLocale(),
                    softwareDownload.getSession(),
                    JSON.stringify({ PageName: softwareDownload.getPageName() }));
                softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);

                alert("Accept the terms and conditions to continue.");
                window.location.reload(true);
            }
        }
    }

}(window.softwareDownload = window.softwareDownload || {}, jQuery));

//Init
$(function () {

    softwareDownload.configureSite();
    softwareDownload.session.init(softwareDownload.siteConfiguration.getOrgId());
    softwareDownload.configureViews();

    softwareDownload.navigation.showView('homePage');

    //Check if redirection object exists because this could be removed for Debugging.
    if (typeof softwareDownload.redirection !== 'undefined') {
        softwareDownload.redirection.redirect();

        if (softwareDownload.redirection.isRedirecting === false) {
            $('body').addClass('loaded');
        }
    } else {
        $('body').addClass('loaded');
    }

    $('#pk-input-key').mask('?*****-*****-*****-*****-*****', {
        placeholder: " "
    });

    //Log page view information     
    softwareDownload.AppInsights.getAppInsights().trackPageView(null, null, { Locale: softwareDownload.getLocale() });

    var pageName = softwareDownload.getPageName();
    var pageType = softwareDownload.getPageType(pageName);
    switch (pageType) {
        case softwareDownload.pageType.wip:
            softwareDownload.LogWipUserDetails();
            break;
        case softwareDownload.pageType.localePicker:
            softwareDownload.setReferrerPage();
            break;
        case softwareDownload.pageType.systembuilder:
            softwareDownload.parseSystemBuilderAttestation();
            softwareDownload.LogDpcUserDetails();
            break;
    }

    //Improvements added 
    if (!($(".glyph_aadAccount_circle").length > 0 || $(".glyph_account_circle").length > 0) && ($("#user-not-signedin").length > 0 || $("#devcenter-user-not-signedin").length > 0)) {
        var loginDetection = setInterval(initLoginDetector, 250);

        function initLoginDetector() {
            if ($(".glyph_aadAccount_circle").length > 0 || $(".glyph_account_circle").length > 0) {
                if ($("#user-not-signedin").length > 0 || $("#devcenter-user-not-signedin").length > 0) {
                    softwareDownload.progressModalIsVisible(true);
                    location.reload(true);
                }
                clearInterval(loginDetection);
            }
        }
    }

    var replacementForSignout = setInterval(replaceSignout, 250);
    function replaceSignout() {
        if ((($(".glyph_aadAccount_circle").length > 0 || $(".glyph_account_circle").length > 0 || $(".mectrl_profilepic").length > 0)) && $("#mectrl_main_body").length > 0) {
            if (($(".glyph_account_circle").length > 0 || $(".mectrl_profilepic").length > 0) && $("#mectrl_main_body").length > 0) {
                $($("#mectrl_main_body").children().children().children()[2]).attr("href", "https://www.microsoft.com/mscomhp/onerf/signout?pcexp=True&ru=" + encodeURIComponent($(location).attr('href')))
            }
            clearInterval(replacementForSignout);
        }
    }
});

//Init to handle modal dialogues
$(function () {

    function enableTabandScroll(option) {
        if (option) {
            $(document).unbind('keydown mousewheel DOMMouseScroll');
        }
        else {
            $(document).bind('keydown mousewheel DOMMouseScroll', function (e) {
                e.preventDefault();
            });
        }

    }

    function restrictFocusOnMondal() {
        $(document).bind('keydown mousewheel DOMMouseScroll', function (e) {

            var keyCode = (window.event) ? e.which : e.keyCode;

            if (keyCode == 9) {

                e.preventDefault();
                if ($('.modal-dismiss').is(":focus"))
                    $("#faq").focus();
                else
                    $(".modal-dismiss").focus();
            }
            else if (keyCode != 13) {
                e.preventDefault();
            }

        });
    }

    function checkTabAndScrollForModal() {
        var modal = $(".modal");

        if (modal.is(":visible")) {

            if ($(".modal-dismiss").length > 0) {
                enableTabandScroll(true);
                $(".modal-dismiss").focus();
                restrictFocusOnMondal();
            }
            else {
                enableTabandScroll(false);
            }
        }
        else {
            enableTabandScroll(true);
        }
    }

    $(".modal").bind('DOMAttrModified', checkTabAndScrollForModal);

});

//Events
$(function () {
    window.onload = function () {
        window.dfp.doFpt(this.document);
    };

    //Log MCT and UpgradeNow Custom Events 
    $(document).on("click", "#windows10-upgrade-now", function () {
        var customEventProperties = softwareDownload.AppInsights.getCustomEventProperties("Windows10UpgradeNowClick", softwareDownload.getLocale(), softwareDownload.getSession());
        softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
    });

    $(document).on("click", "#windows10-downloadtool-now", function () {
        var customEventProperties = softwareDownload.AppInsights.getCustomEventProperties("Windows10MctDownloadClick", softwareDownload.getLocale(), softwareDownload.getSession());
        softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
    });

    $(document).on("click", "#windows8-downloadtool-now", function () {
        var customEventProperties = softwareDownload.AppInsights.getCustomEventProperties("Windows8MctDownloadClick", softwareDownload.getLocale(), softwareDownload.getSession());
        softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
    });

    $(document).on("click", "#vlap-downloadtool-now", function () {
        var customEventProperties = softwareDownload.AppInsights.getCustomEventProperties("VlapMctDownloadClick", softwareDownload.getLocale(), softwareDownload.getSession());
        softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
    });

    $(document).on("click", "#user-not-signedin", function () {
        var customEventProperties = softwareDownload.AppInsights.getCustomEventProperties("UserIsNotSignedInClickedOnWipSignUpPage", softwareDownload.getLocale(), softwareDownload.getSession(), JSON.stringify({ PageName: softwareDownload.getPageName() }));
        softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
    });

    $(document).on("click", "#user-signedin-not-insider", function () {
        var customEventProperties = softwareDownload.AppInsights.getCustomEventProperties("UserIsSignedInButNotInsiderClickedOnWipSignUpPage", softwareDownload.getLocale(), softwareDownload.getSession(), softwareDownload.getUserDetails());
        softwareDownload.AppInsights.getAppInsights().trackEvent("Request", customEventProperties);
    });

    $(document).on("click", "#systembuilder-extra-download", function () {
        $("#product-edition").prop('selectedIndex', 0);
        softwareDownload.navigation.showView('homePage');
    });

    $(document).on("click", "#systembuilder_attestation_chkbox", function () {
        if ($("#systembuilder_attestation_chkbox").prop('checked')) {
            $("#systembuilder_attestation_confirm").prop("disabled", false);
            $("#systembuilder_attestation_confirm").addClass('button-blue');
        } else {
            $("#systembuilder_attestation_confirm").prop("disabled", true);
            $("#systembuilder_attestation_confirm").removeClass('button-blue');
        }
    });

    $(document).on("click", "#systembuilder_attestation_confirm", function () {
        if ($("#systembuilder_attestation_chkbox").prop('checked')) {
            softwareDownload.systemBuilderAttestationModalIsVisible(false);
        }
    });

    $(document).on("click", "#submit-key", function () {

        if (!softwareDownload.isValidProductKey()) {
            softwareDownload.showError(true, '#pk-input-validation', '#pk-input-key', 'pk-input-key-error');
            return;
        } else {
            softwareDownload.showError(false, '#pk-input-validation', '#pk-input-key', 'pk-input-key-error');
        }

        nodeId = 'SoftwareDownload_LanguageSelectionByKey';
        actionName = 'GetSkuInformationByKey';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                key: softwareDownload.getKey(),
                sessionId: softwareDownload.getSession()
            },
            callback: function (response) {
                softwareDownload.parseErrorMessage();
                softwareDownload.navigation.showView('productKeyLanguage');
            },
            showProgress: true,
            target: $(this)
        });

        $('html,body').animate({
            scrollTop: $("#submit-key").offset().top
        });
    });

    $(document).on("click", "#submit-sku", function () {

        var selectValue = $('#product-languages').val();
        //if (selectValue == "") {
        if (selectValue == "null") {    // NEWTON: Because Cascade's RT component doesn't support <options> without value attribute
            softwareDownload.showError(true, '#pk-language-validation', '#product-languages', 'product-languages-error');
            return;
        } else {
            softwareDownload.showError(false, '#pk-language-validation', '#product-languages', 'product-languages-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        var selectValueJson = JSON.parse(selectValue);

        nodeId = 'SoftwareDownload_DownloadLinks';
        actionName = 'GetProductDownloadLinksBySku';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                key: softwareDownload.getKey(),
                sessionId: softwareDownload.getSession(),
                skuId: selectValueJson.id,
                language: selectValueJson.language
            },
            callback: function (response) {


                // Manipulate DOM with result from 'query' in the parameter 'response'
                softwareDownload.cascade.populateDownloadLinks($('#' + nodeId), actionName, response);




                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.parseErrorMessage();
                softwareDownload.parseProductDownload('productDownload');






                $('html,body').animate({
                    scrollTop: $("#SoftwareDownload_DownloadLinks").offset().top
                });
            },
            showProgress: true,
            target: $(this)
        });
    });


    $(document).on("click", "#submit-sku-a", function () {

        var selectValue = $('#product-languages_a').val();
        //if (selectValue == "") {
        if (selectValue == "null") {    // NEWTON: Because Cascade's RT component doesn't support <options> without value attribute
            softwareDownload.showError(true, '#pk-language-validation', '#product-languages', 'product-languages-error');
            return;
        } else {
            softwareDownload.showError(false, '#pk-language-validation', '#product-languages', 'product-languages-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        var selectValueJson = JSON.parse(selectValue);

        nodeId = 'SoftwareDownload_DownloadLinks_a';
        actionName = 'GetProductDownloadLinksBySku';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                key: softwareDownload.getKey(),
                sessionId: softwareDownload.getSession(),
                skuId: selectValueJson.id,
                language: selectValueJson.language
            },
            callback: function (response) {

                // Manipulate DOM with result from 'query' in the parameter 'response'
                softwareDownload.cascade.populateDownloadLinks($('#' + nodeId), actionName, response);

                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.parseErrorMessage();
                softwareDownload.parseProductDownload('productDownload_a');


                $('html,body').animate({
                    scrollTop: $("#SoftwareDownload_DownloadLinks_a").offset().top
                });
            },
            showProgress: true,
            target: $(this)
        });
    });


    $(document).on("click", "#submit-sku-b", function () {

        var selectValue = $('#product-languages_b').val();
        //if (selectValue == "") {
        if (selectValue == "null") {    // NEWTON: Because Cascade's RT component doesn't support <options> without value attribute
            softwareDownload.showError(true, '#pk-language-validation', '#product-languages', 'product-languages-error');
            return;
        } else {
            softwareDownload.showError(false, '#pk-language-validation', '#product-languages', 'product-languages-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        var selectValueJson = JSON.parse(selectValue);

        nodeId = 'SoftwareDownload_DownloadLinks_b';
        actionName = 'GetProductDownloadLinksBySku';
        softwareDownload.renderContent({
            id: 'SoftwareDownload_DownloadLinks_b',
            query: {
                action: 'GetProductDownloadLinksBySku',
                key: softwareDownload.getKey(),
                sessionId: softwareDownload.getSession(),
                skuId: selectValueJson.id,
                language: selectValueJson.language
            },
            callback: function (response) {

                // Manipulate DOM with result from 'query' in the parameter 'response'
                softwareDownload.cascade.populateDownloadLinks($('#' + nodeId), actionName, response);

                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.parseErrorMessage();
                softwareDownload.parseProductDownload('productDownload_b');

                $('html,body').animate({
                    scrollTop: $("#SoftwareDownload_DownloadLinks_b").offset().top
                });
            },
            showProgress: true,
            target: $(this)
        });
    });







    $(document).on("click", "#submit-sku-arm", function () {

        var selectValue = $('#product-languages').val();
        //if (selectValue == "") {
        if (selectValue == "null") {    // NEWTON: Because Cascade's RT component doesn't support <options> without value attribute
            softwareDownload.showError(true, '#pk-language-validation', '#product-languages', 'product-languages-error');
            return;
        } else {
            softwareDownload.showError(false, '#pk-language-validation', '#product-languages', 'product-languages-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        var selectValueJson = JSON.parse(selectValue);

        nodeId = 'SoftwareDownload_DownloadLinks_WithCrcHash11_Arm';
        actionName = 'GetProductDownloadLinksBySku';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                key: softwareDownload.getKey(),
                sessionId: softwareDownload.getSession(),
                skuId: selectValueJson.id,
                language: selectValueJson.language
            },
            callback: function (response) {
                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.parseErrorMessage();
                softwareDownload.parseProductDownload();

                $('html,body').animate({
                    scrollTop: $("#SoftwareDownload_DownloadLinks").offset().top
                });
            },
            showProgress: true,
            target: $(this)
        });
    });

    $(document).on("click", "#submit-sku2", function () {

        var selectValue = $('#product-languages2').val();
        //if (selectValue == "") {
        if (selectValue == "null") {    // NEWTON: Because Cascade's RT component doesn't support <options> without value attribute
            softwareDownload.showError(true, '#pk-language2-validation', '#product-languages2', 'product-languages2-error');
            return;
        } else {
            softwareDownload.showError(false, '#pk-language2-validation', '#product-languages2', 'product-languages2-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        var selectValueJson = JSON.parse(selectValue);

        nodeId = 'SoftwareDownload_DownloadLinks';
        actionName = 'GetProductDownloadLinksBySku';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                key: softwareDownload.getKey(),
                sessionId: softwareDownload.getSession(),
                skuId: selectValueJson.id,
                language: selectValueJson.language
            },
            callback: function (response) {
                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.parseErrorMessage();
                softwareDownload.parseProductDownload();

                $('html,body').animate({
                    scrollTop: $("#SoftwareDownload_DownloadLinks").offset().top
                });
            },
            showProgress: true,
            target: $(this)
        });
    });

    $(document).on("change", "#product-languages", function () {

        // If xbox icons being used, perform xbox behavior
        if (softwareDownload.xbox.xboxIconsPresent()) {
            softwareDownload.navigation.showView('productEditionLanguage');

            //For Xbox/devcenter pages using numbered icons
            softwareDownload.xbox.resetToTwo();
        }

    });

    $(document).on("click", "#submit-sku3", function () {

        var selectValue = $('#product-languages').val();
        //if (selectValue == "") {
        if (selectValue == "null") {    // NEWTON: Because Cascade's RT component doesn't support <options> without value attribute
            softwareDownload.showError(true, '#pk-language-validation', '#product-languages', 'product-languages-error');
            return;
        } else {
            softwareDownload.showError(false, '#pk-language-validation', '#product-languages', 'product-languages-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        var selectValueJson = JSON.parse(selectValue);

        nodeId = 'SoftwareDownload_DownloadLinks';
        actionName = 'GetProductDownloadLinksBySku';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                key: softwareDownload.getKey(),
                sessionId: softwareDownload.getSession(),
                skuId: selectValueJson.id,
                language: encodeURI(selectValueJson.language)
            },
            callback: function (response) {
                


                // Manipulate DOM with result from 'query' in the parameter 'response'
                softwareDownload.cascade.populateDownloadLinks($('#' + nodeId), actionName, response);


                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.parseErrorMessage();
                softwareDownload.parseProductDownload('productDownload');

                $("#linkGdk_download").focus();
                // If xbox icons being used, perform xbox behavior
                if (softwareDownload.xbox.xboxIconsPresent()) {
                    softwareDownload.xbox.resetToThree();
                }

                $('html,body').animate({
                    scrollTop: $("#SoftwareDownload_DownloadLinks").offset().top
                });
            },
            showProgress: true,
            target: $(this)
        });

        //For Xbox/devcenter pages using numbered icons
        //softwareDownload.xbox.resetToThree();
    });

    $(document).on("click", "#submit-sku4", function () {

        var selectValue = $('#product-languages').val();
        //if (selectValue == "") {
        if (selectValue == "null") {    // NEWTON: Because Cascade's RT component doesn't support <options> without value attribute
            softwareDownload.showError(true, '#pk-language-validation', '#product-languages', 'product-languages-error');
            return;
        } else {
            softwareDownload.showError(false, '#pk-language-validation', '#product-languages', 'product-languages-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        var selectValueJson = JSON.parse(selectValue);

        nodeId = 'SoftwareDownload_DownloadLinks';
        actionName = 'GetProductDownloadLinksBySku';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                key: softwareDownload.getKey(),
                sessionId: softwareDownload.getSession(),
                skuId: selectValueJson.id,
                language: selectValueJson.language
            },
            callback: function (response) {
                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.parseErrorMessage();
                softwareDownload.parseProductDownload();

                $('html,body').animate({
                    scrollTop: $("#SoftwareDownload_WindowsServer_DownloadLinks").offset().top
                });
            },
            showProgress: true,
            target: $(this)
        });
    });

    $(document).on("change", "#product-edition", function () {
        softwareDownload.navigation.showView('homePage');

        //For Xbox/devcenter pages using numbered icons
        softwareDownload.xbox.resetToOne();
    });

    $(document).on("click", "#submit-product-edition", function () {
        var productEdition = softwareDownload.getValueOrNull('#product-edition');
        if (productEdition == null) {
            softwareDownload.showError(true, '#productEdition-validation', '#product-edition', 'product-edition-error');
            return;
        } else {
            softwareDownload.showError(false, '#productEdition-validation', '#product-edition', 'product-edition-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        nodeId = 'SDS_LanguageSelectionByProductEdition';
        actionName = 'getskuinformationbyproductedition';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                sessionId: softwareDownload.getSession(),
                productEditionId: productEdition
            },
            callback: function (response) {

                // Manipulate DOM with result from 'query' in the parameter 'response'
                softwareDownload.cascade.populateLanguages($('#' + nodeId), actionName, response);

                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.navigation.showView('productEditionLanguage');
                $("#product-languages").focus();


                // If xbox icons being used, perform xbox behavior
                if (softwareDownload.xbox.xboxIconsPresent()) {
                    softwareDownload.xbox.resetToTwo();
                }
            },
            showProgress: true,
            target: $(this)
        });

        $('html,body').animate({
            scrollTop: $("#product-edition").offset().top
        });
        //For Xbox/devcenter pages using numbered icons
        //softwareDownload.xbox.resetToTwo();
    });


    $(document).on("click", "#submit-product-edition-a", function () {
        var productEdition = softwareDownload.getValueOrNull('#product-edition-a');
        if (productEdition == null) {
            softwareDownload.showError(true, '#productEdition-validation-a', '#product-edition-a', 'product-edition-error-a');
            return;
        } else {
            softwareDownload.showError(false, '#productEdition-validation-a', '#product-edition-a', 'product-edition-error-a');
        }

        softwareDownload.checkSystemBuilderAttestation();

        nodeId = 'SDS_LanguageSelectionByProductEdition_a';
        actionName = 'getskuinformationbyproductedition';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                sessionId: softwareDownload.getSession(),
                productEditionId: productEdition
            },
            callback: function (response) {

                // Manipulate DOM with result from 'query' in the parameter 'response'
                softwareDownload.cascade.populateLanguages($('#' + nodeId), actionName, response);


                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.navigation.showView('productEditionLanguage_a');
                $("#product-languages_a").focus();

                // If xbox icons being used, perform xbox behavior
                if (softwareDownload.xbox.xboxIconsPresent()) {
                    softwareDownload.xbox.resetToTwo();
                }
            },
            showProgress: true,
            target: $(this)
        });

        $('html,body').animate({
            scrollTop: $("#product-edition-a").offset().top
        });
        //For Xbox/devcenter pages using numbered icons
        //softwareDownload.xbox.resetToTwo();
    });

    $(document).on("click", "#submit-product-edition-b", function () {
        var productEdition = softwareDownload.getValueOrNull('#product-edition-b');
        if (productEdition == null) {
            softwareDownload.showError(true, '#productEdition-validation-b', '#product-edition-b', 'product-edition-error-b');
            return;
        } else {
            softwareDownload.showError(false, '#productEdition-validation-b', '#product-edition-b', 'product-edition-error-b');
        }

        softwareDownload.checkSystemBuilderAttestation();

        nodeId = 'SDS_LanguageSelectionByProductEdition_b';
        actionName = 'getskuinformationbyproductedition';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                sessionId: softwareDownload.getSession(),
                productEditionId: productEdition
            },
            callback: function (response) {

                // Manipulate DOM with result from 'query' in the parameter 'response'
                softwareDownload.cascade.populateLanguages($('#' + nodeId), actionName, response);

                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.navigation.showView('productEditionLanguage_b');
                $("#product-languages_b").focus();


                // If xbox icons being used, perform xbox behavior
                if (softwareDownload.xbox.xboxIconsPresent()) {
                    softwareDownload.xbox.resetToTwo();
                }
            },
            showProgress: true,
            target: $(this)
        });

        $('html,body').animate({
            scrollTop: $("#product-edition-b").offset().top
        });
        //For Xbox/devcenter pages using numbered icons
        //softwareDownload.xbox.resetToTwo();
    });


    $(document).on("click", "#submit-product-edition-arm", function () {
        var productEdition = softwareDownload.getValueOrNull('#product-edition-arm');
        if (productEdition == null) {
            softwareDownload.showError(true, '#productEdition-validation-arm', '#product-edition-arm', 'product-edition-error-arm');
            return;
        } else {
            softwareDownload.showError(false, '#productEdition-validation-arm', '#product-edition-arm', 'product-edition-error-arm');
        }

        softwareDownload.checkSystemBuilderAttestation();

        nodeId = 'SDS_LanguageSelectionByProductEdition_arm';
        actionName = 'getskuinformationbyproductedition';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                sessionId: softwareDownload.getSession(),
                productEditionId: productEdition
            },
            callback: function (response) {
                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.navigation.showView('productEditionLanguage');

                // If xbox icons being used, perform xbox behavior
                if (softwareDownload.xbox.xboxIconsPresent()) {
                    softwareDownload.xbox.resetToTwo();
                }
            },
            showProgress: true,
            target: $(this)
        });

        $('html,body').animate({
            scrollTop: $("#product-edition-arm").offset().top
        });

        //For Xbox/devcenter pages using numbered icons
        //softwareDownload.xbox.resetToTwo();
    });



    $(document).on("click", "#submit-product-edition2", function () {
        var productEdition = softwareDownload.getValueOrNull('#product-edition2');
        if (productEdition == null) {
            softwareDownload.showError(true, '#productEdition2-validation', '#product-edition2', 'product-edition2-error');
            return;
        } else {
            softwareDownload.showError(false, '#productEdition2-validation', '#product-edition2', 'product-edition2-error');
        }

        softwareDownload.checkSystemBuilderAttestation();

        nodeId = 'SDS_LanguageSelectionByProductEdition2';
        actionName = 'getskuinformationbyproductedition';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                sessionId: softwareDownload.getSession(),
                productEditionId: productEdition
            },
            callback: function (response) {
                softwareDownload.checkSystemBuilderAttestation();
                softwareDownload.navigation.showView('productEditionLanguage2');
            },
            showProgress: true,
            target: $(this)
        });

        $('html,body').animate({
            scrollTop: $("#product-edition2").offset().top
        });
    });

    $(document).on("click", ".submit-friendlyFileName", function () {

        var buttonData = JSON.parse(this.dataset.swdlDownload);

        nodeId = 'SoftwareDownload_DownloadLinkData';
        actionName = 'GetProductDownloadLinkForFriendlyFileName';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                action: actionName,
                sessionId: softwareDownload.getSession(),
                friendlyFileName: buttonData.friendlyFileName
            },
            callback: function (response) {

                // Manipulate DOM with result from 'query' in the parameter 'response'
                softwareDownload.cascade.downloadLinksForFriendlyName($('#' + nodeId), actionName, response);

                softwareDownload.parseErrorMessage();
                if (softwareDownload.productDownload != undefined && softwareDownload.productDownload.uri != "") {
                    window.location.href = softwareDownload.productDownload.uri;
                }
                
                softwareDownload.parseProductDownload('productDownload');
            },
            showProgress: true,
            target: $(this)
        });
    });

    $(document).on("click", ".submit-friendlyFileName1", function () {

        var buttonData = JSON.parse(this.dataset.swdlDownload);
        alert('in');
        alert('incheck');
        softwareDownload.renderContent1({
            id: 'SoftwareDownload_DownloadLinkData',
            query: {
                action: 'GetProductDownloadLinkForFriendlyFileName'
            },
            callback: function (response) {
                alert('callback');
                softwareDownload.parseErrorMessage();
                if (softwareDownload.productDownload != undefined && softwareDownload.productDownload.uri != "") {
                    window.location.href = softwareDownload.productDownload.uri;
                }
            },
            showProgress: true,
            target: $(this)
        });
    });
});

//Modal
$(function () {
    $(document).on("click", ".modal-dismiss", function () {
        $(this).parents(".modal").hide();
        $(document).unbind('keydown mousewheel DOMMouseScroll');

        softwareDownload.eventTarget.focus();
    });
})

//Feedback
$(function () {
    $(document).on("click", "#feedback-send-button", function (e) {

        e.preventDefault();

        var qr1 = softwareDownload.getValueOrNull('input:radio[name=feedback-question1-radio]:checked');
        var qr2 = softwareDownload.getValueOrNull('input:radio[name=feedback-question2-radio]:checked');
        var qr3 = $('#feedback-extra-comments').val();

        var isError = false;

        if (qr1 === null) {
            softwareDownload.showError(true, '#feedback-question1', '#feedback-question1', 'feedback-question1-error');
            isError = true;
        } else {
            softwareDownload.showError(false, '#feedback-question1', '#feedback-question1', 'feedback-question1-error');
        }

        if (qr2 === null) {
            softwareDownload.showError(true, '#feedback-question2', '#feedback-question2', 'feedback-question2-error');
            isError = true;
        } else {
            softwareDownload.showError(false, '#feedback-question2', '#feedback-question2', 'feedback-question2-error');
        }


        if (isError) {


            if (qr1 === null && qr2 === null) {
                $('#feedback-question1 ul li:nth-child(1) label input').focus()
            }
            if (qr1 === null) {
                $('#feedback-question1 ul li:nth-child(1) label input').focus()
            }
            if (qr2 === null && qr1 !== null) {
                $('#feedback-question2 ul li:nth-child(1) label input').focus()
            }

            return;

        }

        nodeId = 'SoftwareDownload_FeedbackSubmit';
        softwareDownload.renderContent({
            id: nodeId,
            query: {
                sessionId: softwareDownload.getSession(),
                qr1: qr1,
                qr2: qr2,
                qr3: qr3
            },
            callback: function (response) {
                $("#feedback-action").addClass("has-success");
                $("#668657eb-b1ac-4c09-9105-1529f3534c81 :input").prop("disabled", true);
                $("#feedback-send-button").remove();
            },
            showProgress: false,
            target: $(this)
        });
    });
});

(function (softwareDownload, $, undefined) {
    softwareDownload.AppInsights = softwareDownload.AppInsights || {};

    softwareDownload.AppInsights.getAppInsights = function () {            
        //Configure appinsights
        var _appInsights = window.appInsights ||function(config){
        function r(config){t[config]=function()
        {
            var i=arguments;t.queue.push(function(){t[config].apply(t,i)})}}
            var t={config:config},u=document,e=window,o="script",s=u.createElement(o),i,f;
            for(s.src=config.url||"//az416426.vo.msecnd.net/scripts/a/ai.0.js",
                u.getElementsByTagName(o)[0].parentNode.appendChild(s),
                t.cookie=u.cookie,t.queue=[],
                i=["Event","Exception","Metric","PageView","Trace"];i.length;)
                r("track"+i.pop());return r("setAuthenticatedUserContext"),
                r("clearAuthenticatedUserContext"),
                config.disableExceptionTracking||
                (i="onerror",r("_"+i),f=e[i],e[i]=function(config,r,u,e,o){var s=f&&f(config,r,u,e,o);return s!==!0&&t["_"+i](config,r,u,e,o),s}),t
        }({
            instrumentationKey:"4b6c76d0-4d71-4a6a-8a4a-870c27551af5"
        });
        window.appInsights = _appInsights;
        return _appInsights;
    }

    softwareDownload.AppInsights.getCustomEventProperties = function (categoryName, locale, sessionId, additionalData) {

        var customdata = "Not applicable"
        if (typeof additionalData !== 'undefined')
            customdata = additionalData;

        var now = new Date(); 
        var customEventProperties = {
            AzureDataCenter: "Not applicable",
            Category: categoryName, 
            CreatedDate: new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString(),
            Configuration: "Not applicable",
            requestId: sessionId,
            ServiceName: "Software Download",
            status: "Complete",
            tenantId: "Not applicable",
            contentOriginationCountry: "Not applicable",
            contentLanguage: locale,
            contentItemCollection: "Not applicable",
            processId: "Not applicable",
            payloadId: "Not applicable",
            customData: customdata,
            locale: locale,
            parentId: "Not applicable",
            CompletedDate: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString()
        };

        return customEventProperties;
    }

}(window.softwareDownload = window.softwareDownload || {}, jQuery));

(function (softwareDownload, $, undefined) {
    softwareDownload.redirection = softwareDownload.redirection || {};

    var invalidOsRedirection = {
        "windows8": "windows8ISO",
        "windows10": "windows10ISO",
        "vlacademicwindows10": "vlacademicwindows10iso"
    };

    var validOsRedirection = {
        "windows8ISO": "windows8",
        "windows10ISO": "windows10",
        "vlacademicwindows10iso": "vlacademicwindows10"
    };

    var simpleRedirection = {};

    var validOs = [
        "Windows 11",
        "Windows 10",
        "Windows 8.1",
        "Windows 8",
        "Windows 7"
    ];

    softwareDownload.redirection.isRedirecting = false;

    softwareDownload.redirection.redirect = function () {
        var currentPage = getCurrentPage(window.location.pathname);
        redirectBySite(currentPage);

        redirectByOs(currentPage);
    }

    //TODO: Reused acrossed different scripts. Consolidate in one.
    function getCurrentPage(pathname) {
        var segments = pathname.split("/");
        for (var i = segments.length - 1; i >= 0; i--) {
            if (segments[i] !== '') {
                return segments[i];
            }
        }

        return '';
    }

    function redirectBySite(currentPage) {
        redirect(currentPage, simpleRedirection);
    }

    function redirectByOs(currentPage) {
        var osAttributes = softwareDownload.userAttributes.getOs();
        var os = osAttributes.name + " " + osAttributes.version;

        console.log('Redirect to OS Pages!!!');
        console.log('Device ' + os.toString());

        if (validOs.indexOf(os) == -1) {
            redirect(currentPage, invalidOsRedirection);
        } else {
            redirect(currentPage, validOsRedirection);
        }
    }

    function redirect(currentPage, redirection) {
        var redirectionPage = getRedirectionPage(currentPage, redirection);



        if (redirectionPage != null) {
            var regularExpression = new RegExp(currentPage, 'i');

            var newLocation = window.location.href.replace(regularExpression, redirectionPage);
            window.location.replace(newLocation);
            softwareDownload.redirection.isRedirecting = true;
        }
    }

    function getRedirectionPage(currentPage, redirection) {
        for (var property in redirection) {
            if (redirection.hasOwnProperty(property)) {
                if (property.toLowerCase() === currentPage.toLowerCase()) {
                    return redirection[property];
                }
            }
        }

        return null;
    }

}(window.softwareDownload = window.softwareDownload || {}, jQuery));
(function(softwareDownload, $, undefined){

    softwareDownload.xbox = softwareDownload.xbox || {};

//     var _configurations = [];
// 
//     var _defaultConfiguration = {
//         version: "",
//         orgId: "",
//         locales: [],
//         pages: []
//     };

    softwareDownload.xbox.resetToOne = function () {

        softwareDownload.xbox.unCheckOne();
        softwareDownload.xbox.unCheckTwo();
        softwareDownload.xbox.unCheckThree();
        
		softwareDownload.xbox.showConfirmProductEdition();
		softwareDownload.xbox.showConfirmSku3();
    }

    softwareDownload.xbox.resetToTwo = function () {

        softwareDownload.xbox.checkOne();
        softwareDownload.xbox.unCheckTwo();
        softwareDownload.xbox.unCheckThree();
		
		softwareDownload.xbox.hideConfirmProductEdition();
		softwareDownload.xbox.showConfirmSku3();
    }
    
    softwareDownload.xbox.resetToThree = function () {

        softwareDownload.xbox.checkOne();
        softwareDownload.xbox.checkTwo();
        softwareDownload.xbox.unCheckThree();
		
		softwareDownload.xbox.hideConfirmProductEdition();
		softwareDownload.xbox.hideConfirmSku3();
        
        // For some reason the sku fragment gets hidden, force it to show
        $('#SDS_LanguageSelectionByProductEdition').parent().parent().css('display','block')
    }    
    
    softwareDownload.xbox.hideConfirmProductEdition = function (/*configuration*/) {

        if ($('#xbox_one_check').val() == null || $('#xbox_one_number').val() == null)
            return;
        
        $('#submit-product-edition').addClass('x-hidden');  
		
    }

    softwareDownload.xbox.showConfirmProductEdition = function (/*configuration*/) {

        if ($('#xbox_one_check').val() == null || $('#xbox_one_number').val() == null)
            return;
        
        $('#submit-product-edition').removeClass('x-hidden');  
		
    }

    softwareDownload.xbox.hideConfirmSku3 = function (/*configuration*/) {

        if ($('#xbox_one_check').val() == null || $('#xbox_one_number').val() == null)
            return;
        
        $('#submit-sku3').addClass('x-hidden');  
		
    }

    softwareDownload.xbox.showConfirmSku3 = function (/*configuration*/) {

        if ($('#xbox_one_check').val() == null || $('#xbox_one_number').val() == null)
            return;
        
        $('#submit-sku3').removeClass('x-hidden');  
		
    }

    softwareDownload.xbox.checkOne = function (/*configuration*/) {

        if ($('#xbox_one_check').val() == null || $('#xbox_one_number').val() == null)
            return;
            
		$('#xbox_one_check').removeClass('x-hidden');$('#xbox_one_number').addClass('x-hidden');
		
    }

    softwareDownload.xbox.unCheckOne = function () {

        if ($('#xbox_one_check').val() == null || $('#xbox_one_number').val() == null)
            return;
            
		$('#xbox_one_check').addClass('x-hidden');$('#xbox_one_number').removeClass('x-hidden');
		
    }
	
    softwareDownload.xbox.checkTwo = function () {

        if ($('#xbox_two_check').val() == null || $('#xbox_two_number').val() == null)
            return;
            
		$('#xbox_two_check').removeClass('x-hidden');$('#xbox_two_number').addClass('x-hidden');
		
    }

    softwareDownload.xbox.unCheckTwo = function () {

        if ($('#xbox_two_check').val() == null || $('#xbox_two_number').val() == null)
            return;            

		$('#xbox_two_check').addClass('x-hidden');$('#xbox_two_number').removeClass('x-hidden');
		
    }
	
    softwareDownload.xbox.checkThree = function () {

        if ($('#xbox_three_check').val() == null || $('#xbox_three_number').val() == null)
            return;            

		$('#xbox_three_check').removeClass('x-hidden');$('#xbox_three_number').addClass('x-hidden');
		
    }

    softwareDownload.xbox.unCheckThree = function () {

        if ($('#xbox_three_check').val() == null || $('#xbox_three_number').val() == null)
            return;            

		$('#xbox_three_check').addClass('x-hidden');$('#xbox_three_number').removeClass('x-hidden');
		
    }
    
    softwareDownload.xbox.xboxIconsPresent = function () {

        return ($('#xbox_one_check').val() != null && $('#xbox_one_number').val() != null);
        		
    }	
	
}(window.softwareDownload = window.softwareDownload || {}, jQuery));
