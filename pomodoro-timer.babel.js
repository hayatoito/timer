class Session {

  constructor({ minutes, index, resolveUrl }) {
    this.minutes = minutes;
    this.index = index;
    this.name = `session-${index}`;
    if (this.index % 2 === 0) {
      this.type = 'work';
    } else {
      this.type = 'break';
    }
    if (this.type === 'work') {
      this.message = `Time to work [#${(this.index / 2) + 1}] (${this.minutes} min)`;
      this.icon = resolveUrl('./assets/cappuccino-1.png');
      this.audio = resolveUrl('./assets/ringtone_playtime.mp3');
      this.title = `[#${(this.index / 2) + 1}] (${this.minutes} min)`;
      this.favicon = this.icon;
    } else {
      this.message = `Time to break (${this.minutes} min)`;
      this.icon = resolveUrl('./assets/cappuccino-2.png');
      this.audio = resolveUrl('./assets/ringtone_twinkle.mp3');
      this.title = `[break] (${this.minutes} min)`;
      this.favicon = this.icon;
    }
  }
}

class Util {
  static favicon() {
    return document.querySelector('link[rel="shortcut icon"]');
  }

  static setFavicon(icon) {
    if (Util.favicon()) {
      Util.favicon().setAttribute('href', icon);
    }
  }

  static setTitle(title) {
    const e = document.querySelector('title');
    if (e) {
      e.innerText = title;
    }
  }

  static ceilBySecond(ms) {
    return Math.ceil(ms / 1000) * 1000;
  }

  static zfill(num) {
    if (num < 10) {
      return `0${num}`;
    }
    return num;
  }

  static formatTime(remaining) {
    const seconds = Math.ceil(remaining / 1000);
    return {
      mm: Math.floor(seconds / 60),
      ss: Util.zfill(seconds % 60),
    };
  }

  static notificationPermissionAllowed() {
    return window.Notification && window.Notification.permission === 'granted';
  }
}

class PomodoroTimer {

  beforeRegister() {
    this.is = 'pomodoro-timer';
    this.properties = {
      durations: {
        type: Array,
        value: [25, 5, 25, 5, 25, 5, 25, 20],
        observer: '_durationsChanged',
      },
      mute: {
        type: Boolean,
        value: false,
      },
      repeat: {
        type: Boolean,
        value: false,
      },
      autostart: {
        type: Boolean,
        value: false,
      },
    };
  }

  attached() {
    this.timeMM = '25';
    this.timeSS = '00';
    this.startOrPauseIcon = 'av:play-arrow';
    this.sessionTimer = null;
    this.refreshTimer = null;
    this.initSessions();
    this.audio = null;
    this.notification = null;
    this.finished = false;
  }

  initSessions() {
    this.sessions = this.durations.map((minutes, index) =>
      new Session({
        minutes,
        index,
        // resolveUrl: (url) => this.resolveUrl(url)});
        // Work around: After valcunize, this.resolveURL(), utility function provided by Polymer,
        // returns thw unexpected url, such as http://xxx:port/path
        resolveUrl: url => url,
      }));
    this.currentSession = this.sessions[0];
    this.reset();
    this.startTime = null;
    if (this.autostart) {
      this.start();
    }
  }

  _durationsChanged(_newValue, _oldValue) {
    this.initSessions();
    this.reset();
  }

  sessionMinutes() {
    return this.currentSession.minutes;
  }

  isSessionBeginning() {
    return this.remaining === this.sessionMinutes() * 60 * 1000;
  }

  startOrPause() {
    if (this.isTimerRunning()) {
      this.pauseTimer();
    } else {
      if (this.isSessionBeginning()) {
        this.notifySessionStart(this.currentSession);
      }
      this.start();
    }
  }

  start() {
    console.assert(this.sessionTimer == null);
    console.assert(this.refreshTimer == null);
    this.requestNotificationPermission();
    this.startTime = Date.now();
    // See http://stackoverflow.com/questions/591269/settimeout-and-this-in-javascript
    this.sessionTimer = window.setTimeout(() => this.sessionEnd(),
                                          this.remaining);
    // window.requestAnnimationFrame(..) cat not be used here because we are
    // also updating the title and favicon.
    this.refreshTimer = window.setInterval(() => this.refresh(),
                                         100);
    this.startOrPauseIcon = 'av:pause';
  }

  refresh() {
    this.draw();
  }

  pauseTimer() {
    this.closeNotification();
    this.stopUpdate();
    const passed = Date.now() - this.startTime;
    this.remaining = Util.ceilBySecond(this.remaining - passed);
    this.startOrPauseIcon = 'av:play-arrow';
    this.draw();
  }

  isTimerRunning() {
    return this.sessionTimer != null;
  }

  reset() {
    this.closeNotification();
    this.startOrPauseIcon = 'av:play-arrow';
    this.resetTime();
  }

  resetTime() {
    this.stopUpdate();
    this.remaining = this.sessionMinutes() * 60 * 1000;
    this.draw();
  }

  stopUpdate() {
    if (this.sessionTimer) {
      window.clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  sessionEnd() {
    if (this.currentSession.index + 1 === this.sessions.length) {
      this.notifyAllSessionEnded();
      this.stopUpdate();
      // TODO: Use resolveUrl.
      Util.setFavicon('./assets/chocolate-heart.png');
      this.currentSession = this.sessions[0];
      this.resetTime();
      this.startOrPauseIcon = 'av:play-arrow';
      if (this.repeat) {
        this.start();
      }
    } else {
      this.currentSession = this.sessions[this.currentSession.index + 1];
      this.notifySessionStart(this.currentSession);
      this.resetTime();
      this.start();
    }
  }

  selectSession(e) {
    this.currentSession = e.model.item;
    this.reset();
  }

  isSessionRunning() {
    return this.isTimerRunning() || this.remaining !== this.sessionMinutes() * 60 * 1000;
  }

  draw() {
    const remaining = this.isTimerRunning() ?
          (this.remaining - (Date.now() - this.startTime)) : this.remaining;
    const { mm, ss } = Util.formatTime(remaining);
    this.timeMM = mm;
    this.timeSS = ss;
    if (this.isSessionRunning()) {
      Util.setFavicon(this.currentSession.favicon);
    } else {
      Util.setFavicon('./assets/chocolate-heart.png');
    }
    const sign = (this.isSessionRunning() && !this.isTimerRunning()) ? '❚❚ ' : '';
    Util.setTitle(`${sign}${mm}:${ss} ${this.currentSession.title}`);
  }

  notifySessionStart(session) {
    this.notify(session);
  }

  notifyAllSessionEnded() {
    this.notify({
      message: 'All sessions Done',
      // icon: this.resolveUrl('./chocolate-heart.png'),
      // audio: this.resolveUrl('./sweetest_tone_ever.mp3')});
      icon: './assets/chocolate-heart.png',
      audio: './assets/sweetest_tone_ever.mp3',
    });
  }

  requestNotificationPermission() {
    if (this.mute) {
      return;
    }
    if (Util.notificationPermissionAllowed()) {
      return;
    }
    window.Notification.requestPermission((permission) => {
      if (!('permission' in window.Notification)) {
        window.Notification.permission = permission;
      }
      if (Util.notificationPermissionAllowed()) {
        console.debug('Notification Permission is granted.');
      } else {
        console.debug('Notification Permission is denied.');
      }
    });
  }

  notify({ message, icon, audio }) {
    if (this.mute) {
      return;
    }
    if (!Util.notificationPermissionAllowed()) {
      return;
    }
    this.closeNotification();
    try {
      const notification = new window.Notification(message, { icon });
      setTimeout(() => { notification.close(); }, 16 * 1000);
      this.notification = notification;
      if (audio) {
        const thisAudio = new window.Audio(audio);
        this.audio = thisAudio;
        this.audio.play();
        notification.onclick = () => thisAudio.pause();
      }
    } catch (e) {
      console.log('new window.Notification(...) or new window.Audio(...) is not supported?', e);
    }
  }

  closeNotification() {
    if (!window.Notification) {
      return;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.notification) {
      this.notification.close();
      this.notification = null;
    }
  }
}

/* eslint new-cap: "off" */
Polymer(PomodoroTimer);
