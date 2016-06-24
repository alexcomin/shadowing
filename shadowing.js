function start() {
  var status = {
    'yes': 0,
    'no': 0,
    'alien': ""
  }
  
  const exec = require('child_process').exec;
  const netstat = exec('netstat -t', function (error, stdout, stderr) {
    shadowing(stdout);
  });
  
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
      if (ports[1] == "6081" || ports[1] == "6080") {
        status['yes'] += 1;
        status['alien'] = alien[0].split(".")[0];
      } else {
        status['no'] += 1;
      }
    }
    
    if (status['yes'] != 0) {
      writeFile('shadowingJs.log', date + " " + time, "Возможное соединение через VNC с машины", status['alien'])
      console.log(date, time,"Возможное соединение через VNC с машины", status['alien']);
    } else {
      writeFile('shadowingJs.log', date + " " + time, "Соединений через VNC нет", status['no'])
      console.log(date, time, "Соединений через VNC нет", status['no']);
    }
  }
}

start();

setInterval(function() {
  start();
}, 20000)
