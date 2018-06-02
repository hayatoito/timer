define(["../../node_modules/@polymer/polymer/polymer-element.js","../../node_modules/@polymer/paper-radio-group/paper-radio-group.js","../../node_modules/@polymer/paper-radio-button/paper-radio-button.js","../../node_modules/@polymer/paper-fab/paper-fab.js","../../node_modules/@polymer/paper-icon-button/paper-icon-button.js","../../node_modules/@polymer/iron-icons/iron-icons.js","../../node_modules/@polymer/iron-icons/av-icons.js"],function(_polymerElement){"use strict";var _Mathceil=Math.ceil;class Session{constructor({minutes,index,resolveUrl}){this.minutes=minutes;this.index=index;this.name=`session-${index}`;if(0===this.index%2){this.type="work"}else{this.type="break"}if("work"===this.type){this.message=`Time to work [#${this.index/2+1}] (${this.minutes} min)`;this.icon="./assets/cappuccino-1.png";this.audio="./assets/ringtone_playtime.mp3";this.title=`[#${this.index/2+1}] (${this.minutes} min)`;this.favicon=this.icon}else{this.message=`Time to break (${this.minutes} min)`;this.icon="./assets/cappuccino-2.png";this.audio="./assets/ringtone_twinkle.mp3";this.title=`[break] (${this.minutes} min)`;this.favicon=this.icon}}}class Util{static favicon(){return document.querySelector("link[rel=\"shortcut icon\"]")}static setFavicon(icon){if(Util.favicon()){Util.favicon().setAttribute("href",icon)}}static setTitle(title){const e=document.querySelector("title");if(e){e.innerText=title}}static ceilBySecond(ms){return 1e3*_Mathceil(ms/1e3)}static zfill(num){if(10>num){return`0${num}`}return num}static formatTime(remaining){const seconds=_Mathceil(remaining/1e3);return{mm:Math.floor(seconds/60),ss:Util.zfill(seconds%60)}}static notificationPermissionAllowed(){return window.Notification&&"granted"===window.Notification.permission}}class MyTimer extends _polymerElement.PolymerElement{static get template(){return _polymerElement.html`
      <style>
        #time {
          font-weight: 200;
          margin-left: 0.5em;
          margin-bottom: 0.2em;
          letter-spacing: 0.05em;
          color: #333;
          font-size: 72px;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        paper-radio-group {
          margin-top: 0.4em;
          margin-left: 0.8em;
        }
        paper-radio-button {
          margin: -0.4em;
        }
      </style>
    <style is="custom-style">
      paper-radio-button.work {
        --paper-radio-button-checked-color: var(--paper-pink-500);
        --paper-radio-button-checked-ink-color: var(--paper-pink-500);
        --paper-radio-button-unchecked-color: var(--paper-pink-100);
        --paper-radio-button-unchecked-ink-color: var(--paper-pink-900);
      }
      paper-radio-button.break {
        --paper-radio-button-checked-color: var(--paper-grey-500);
        --paper-radio-button-checked-ink-color: var(--paper-grey-500);
        --paper-radio-button-unchecked-color: var(--paper-grey-300);
        --paper-radio-button-unchecked-ink-color: var(--paper-grey-900);
        --paper-radio-button-label-color: var(--paper-grey-500);
      }
      .flex-horizontal {
        @apply --layout-horizontal;
        @apply --layout-center-justified;
      }
    </style>
    <div id="time"  class="flex-horizontal">
      <span>[[timeMM]] [[timeSS]]</span>
      <span><paper-icon-button on-click="reset" icon="av:replay" title="reset"></paper-icon-button></span>
    </div>
    <div class="flex-horizontal">
      <paper-fab icon="[[startOrPauseIcon]]" on-click="startOrPause"></paper-fab>
    </div>
    <div  class="flex-horizontal">
      <paper-radio-group selected="[[currentSession.name]]">
        <template is="dom-repeat" items="[[sessions]]">
          <paper-radio-button name$="[[item.name]]" class$="{{item.type}}" on-click="selectSession"></paper-radio-button>
        </template>
      </paper-radio-group>
    </div>
    `}static get properties(){return{durations:{type:Array,value:[25,5,25,5,25,5,25,20],observer:"_durationsChanged"},mute:{type:Boolean,value:!1},repeat:{type:Boolean,value:!1},autostart:{type:Boolean,value:!1}}}connectedCallback(){super.connectedCallback();this.timeMM="25";this.timeSS="00";this.startOrPauseIcon="av:play-arrow";this.sessionTimer=null;this.refreshTimer=null;this.initSessions();this.audio=null;this.notification=null;this.finished=!1}initSessions(){this.sessions=this.durations.map((minutes,index)=>new Session({minutes,index}));this.currentSession=this.sessions[0];this.reset();this.startTime=null;if(this.autostart){this.start()}}_durationsChanged(){this.initSessions();this.reset()}sessionMinutes(){return this.currentSession.minutes}isSessionBeginning(){return this.remaining===1e3*(60*this.sessionMinutes())}startOrPause(){if(this.isTimerRunning()){this.pauseTimer()}else{if(this.isSessionBeginning()){this.notifySessionStart(this.currentSession)}this.start()}}start(){console.assert(null==this.sessionTimer);console.assert(null==this.refreshTimer);this.requestNotificationPermission();this.startTime=Date.now();this.sessionTimer=window.setTimeout(()=>this.sessionEnd(),this.remaining);this.refreshTimer=window.setInterval(()=>this.refresh(),100);this.startOrPauseIcon="av:pause"}refresh(){this.draw()}pauseTimer(){this.closeNotification();this.stopUpdate();const passed=Date.now()-this.startTime;this.remaining=Util.ceilBySecond(this.remaining-passed);this.startOrPauseIcon="av:play-arrow";this.draw()}isTimerRunning(){return null!=this.sessionTimer}reset(){this.closeNotification();this.startOrPauseIcon="av:play-arrow";this.resetTime()}resetTime(){this.stopUpdate();this.remaining=1e3*(60*this.sessionMinutes());this.draw()}stopUpdate(){if(this.sessionTimer){window.clearTimeout(this.sessionTimer);this.sessionTimer=null}if(this.refreshTimer){window.clearInterval(this.refreshTimer);this.refreshTimer=null}}sessionEnd(){if(this.currentSession.index+1===this.sessions.length){this.notifyAllSessionEnded();this.stopUpdate();Util.setFavicon("./assets/chocolate-heart.png");this.currentSession=this.sessions[0];this.resetTime();this.startOrPauseIcon="av:play-arrow";if(this.repeat){this.start()}}else{this.currentSession=this.sessions[this.currentSession.index+1];this.notifySessionStart(this.currentSession);this.resetTime();this.start()}}selectSession(e){this.currentSession=e.model.item;this.reset()}isSessionRunning(){return this.isTimerRunning()||this.remaining!==1e3*(60*this.sessionMinutes())}draw(){const remaining=this.isTimerRunning()?this.remaining-(Date.now()-this.startTime):this.remaining,{mm,ss}=Util.formatTime(remaining);this.timeMM=mm;this.timeSS=ss;if(this.isSessionRunning()){Util.setFavicon(this.currentSession.favicon)}else{Util.setFavicon("./assets/chocolate-heart.png")}const sign=this.isSessionRunning()&&!this.isTimerRunning()?"\u275A\u275A ":"";Util.setTitle(`${sign}${mm}:${ss} ${this.currentSession.title}`)}notifySessionStart(session){this.notify(session)}notifyAllSessionEnded(){this.notify({message:"All sessions Done",icon:"./assets/chocolate-heart.png",audio:"./assets/sweetest_tone_ever.mp3"})}requestNotificationPermission(){if(this.mute){return}if(Util.notificationPermissionAllowed()){return}window.Notification.requestPermission(permission=>{if(!("permission"in window.Notification)){window.Notification.permission=permission}if(Util.notificationPermissionAllowed()){console.debug("Notification Permission is granted.")}else{console.debug("Notification Permission is denied.")}})}notify({message,icon,audio}){if(this.mute){return}if(!Util.notificationPermissionAllowed()){return}this.closeNotification();try{const notification=new window.Notification(message,{icon});setTimeout(()=>{notification.close()},1e3*16);this.notification=notification;if(audio){const thisAudio=new window.Audio(audio);this.audio=thisAudio;this.audio.play();notification.onclick=()=>thisAudio.pause()}}catch(e){console.log("new window.Notification(...) or new window.Audio(...) is not supported?",e)}}closeNotification(){if(!window.Notification){return}if(this.audio){this.audio.pause();this.audio=null}if(this.notification){this.notification.close();this.notification=null}}}window.customElements.define("my-timer",MyTimer)});