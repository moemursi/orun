(function () {
    
  class Recognition {
    constructor() {
      this.active = false;
    }
  
    init() {
      let rec = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition || window.oSpeechRecognition;
      rec = (this.recognition = new rec());
      rec.continuous = true;
      rec.onresult = this.onResult;
      rec.onstart = () => this.active = true;
      rec.onend = () => this.active = false;
    }
  
    pause() {
      return this.recognition.pause();
    }
  
    resume() {
      return this.recognition.resume();
    }
  
    start() {
      if ((this.recognition == null)) {
        this.init();
      }
      return this.recognition.start();
    }
  
    stop() {
      return this.recognition.stop();
    }
  
    toggle() {
      if (this.active) {
        return this.stop();
      } else {
        return this.start();
      }
    }
  
    onResult(event) {
      return console.log(event);
    }
  }
  
  
  class VoiceCommand extends Recognition {
    constructor() {
      super();
      this.onResult = this.onResult.bind(this);
      this.commands = [];
    }
  
    onResult(event) {
      // Do command here
      const res = event.results[event.results.length-1];
      let cmd = res[0].transcript;
      if (cmd) {
        cmd = cmd.trim();
        console.log('do cmd', cmd);
        for (let obj of Array.from(this.commands)) {
          if (obj.name.toLocaleLowerCase() === cmd.toLocaleLowerCase()) {
            window.location.href = obj.href;
            break;
          }
        }
      }
    }
  
    addCommands(cmds) {
      return this.commands = this.commands.concat(cmds);
    }
  }
  
  
  Katrid.Speech = {
    Recognition,
    VoiceCommand
  };
  
  // Auto initialize voice command
  Katrid.Speech.voiceCommand = new VoiceCommand();
  if (Katrid.Settings.Speech.enabled) {
    Katrid.Speech.voiceCommand.start();
  }

}).call(this);