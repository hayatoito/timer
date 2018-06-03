define(["exports"],function(_exports){"use strict";Object.defineProperty(_exports,"__esModule",{value:!0});_exports.setTimerAttributesFromURL=function(element){function get(name){const found=new RegExp("[?&]"+encodeURIComponent(name)+"=([^&]*)").exec(window.location.search);if(found){return decodeURIComponent(found[1])}else{return null}}function hide(selector){const es=document.querySelectorAll(selector);for(var i=0;i<es.length;++i){es.item(i).style.display="none"}}const t=get("t");if(t){if(t.startsWith("[")){element.setAttribute("durations",t)}else{element.setAttribute("durations","["+t+"]")}}if(get("mute")){element.setAttribute("mute","true")}if(get("repeat")){element.setAttribute("repeat","true")}if(get("autostart")){element.setAttribute("autostart","true")}if(get("zen")){hide("nav");hide("footer");hide("#timer-footer");hide("hr")}}});