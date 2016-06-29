function start() {
  var status = {
    'vns': 0,
    'ssh': 0,
    'no': 0,
    'alienVNS': "",
    'alienSHH': "",
  }

  const exec = require('child_process').exec;
  const netstat = exec('netstat -t', function (error, stdout, stderr) {
    shadowing(stdout);
  });

  var my = {
    'pts': []
  };

  function kill(pid, who) {
    const exec = require('child_process').exec;
    const netstat = exec('sudo kill '+ pid, function (error, stdout, stderr) {
      console.log(date, time, "kill process " + pid, who.split("@")[0]);
      writeFile('shadowingJs.log', date + " " + time, "kill process " + pid,
      who.split("@")[0]);
    });
  }

  function final(array) {
    if (array[array.length -1].search(/\(:/i) == 0) {
      return 0
    } else {
      my.pts.push(array[1])
    }
  }

  function working2(text) {
    var text = text.split('\n').slice(0, -1);
    for (line in text) {
      var dict = text[line].split(' ');
      var lines = dict.filter(function(notUndefined) {
        return notUndefined
      });
      for (pts = 0; pts < my.pts.length; pts++) {
        if (lines[lines.length -1].match(my.pts[pts])) {
          kill(lines[1], lines[lines.length -1])
        }
      }
    }
  }

  function working(text) {
    var text = text.split('\n').slice(0, -1);
    for (line in text) {
      var dict = text[line].split(' ');
      var lines = dict.filter(function(notUndefined) {
        return notUndefined
      });
      final(lines)
    }
    if (my.pts != "") {
      searchSsh('ps aux')
    }
  }

  function whoIsIt(command) {
    const exec = require('child_process').exec;
    const consoleCommands = exec(command, function (error, stdout, stderr) {
      working(stdout)
    });
  }

  function searchSsh(command) {
    const exec = require('child_process').exec;
    const consoleCommands = exec(command, function (error, stdout, stderr) {
      working2(stdout);
    });
  }

  function correctionTime(argument) {
    if (argument >= 10) {
      return argument
    } else {
      return "0" + argument
    }
  }

  var date = [correctionTime(new Date().getDate()),
              correctionTime(new Date().getMonth() + 1),
              correctionTime(new Date().getFullYear())].join("/")

  var time = [correctionTime(new Date().getHours()),
              correctionTime(new Date().getMinutes()),
              correctionTime(new Date().getSeconds())].join(":");

  function writeFile(nameFile, arg1, arg2, arg3) {
    var fs = require("fs");
    fs.appendFile(nameFile, arg1 + " " + arg2 + " " + arg3 + "\n" ,  "utf8")
  }

  function shadowing(netstat) {
    var result = netstat.split('\n');
    result = result.slice(2, -1)
    for (i in result) {
      var newArray = result[i].split(' ');
      var lines = newArray.filter(function(notUndefined) {
        return notUndefined
      });
      var ports = lines[3].split(":");
      var alien = lines[4].split(":");
      if (ports[1] == "ssh") {
        status['ssh'] += 1;
        status['alienSSH'] = alien[0]
      }
      if (ports[1] == "6081" || ports[1] == "6080" ||
          ports[1] == "5901" || ports[1] == "5900") {
        status['vns'] += 1;
        status['alienVNC'] = alien[0].split(".")[0];
      } else {
        status['no'] += 1;
      }
    }

    if (status['vns'] != 0) {
      if (status['ssh'] !=0) {
      writeFile('shadowingJs.log', date + " " + time, "Connect via VNC with",
      status['alienVNC'] + ", Сonnect via SSH with ip "+status['alienSSH'])
      console.log(date, time,"Connect via VNC with", status['alienVNC'] +
      ", Сonnect via SSH with ip "+status['alienSSH']);
      whoIsIt('who')
      } else {
        writeFile('shadowingJs.log', date + " " + time, "Connect via VNC with",
        status['alienVNC'] + ", No connections SSH");
        console.log(date, time,"Connect via VNC with", status['alienVNC'] +
        ", No connections SSH");
      }
    } else {
      if (status['ssh'] !=0) {
      writeFile('shadowingJs.log', date + " " + time, "No connections VNC,",
      "Сonnect via SSH with ip " + status['alienSSH'] + ", TCP connect " + status['no'])
      console.log(date, time, "No connections VNC,",
      "Сonnect via SSH with ip " + status['alienSSH'] + ", TCP connect " + status['no']);
      whoIsIt('who');
      } else {
        writeFile('shadowingJs.log', date + " " + time, "No connections VNC,",
        "No connections SSH" + ", TCP connect " + status['no']);
        console.log(date, time, "No connections VNC,",
        "No connections SSH" + ", TCP connect " + status['no']);
      }
    }
  }
}

start();

setInterval(function() {
  start();
}, 20000)
