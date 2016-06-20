import os
from time import sleep
from datetime import datetime

def write_file(name_file, arg1, arg2, arg3):
    with open(name_file, 'a') as writes_file:
        writes_file.write(arg1 + " " + arg2 + " " + arg3 + '\n');

def shadowing():
    result_netstat = os.popen('netstat -t').read();
    global time_now;
    time_now = datetime.strftime(datetime.now(), "%d/%m/%y %H:%M:%S");
    crate_array = result_netstat.split("\n");
    crate_array.remove(crate_array[len(crate_array) -1]);
    for number in range(2):
        crate_array.remove(crate_array[0]);
    for i in crate_array:
        new_array = i.split(" ");
        lines = list(filter(bool, map(str.rstrip, new_array)));
        ports = lines[3].split(":");
        alien = lines[4].split(":");
        if (ports[1] in ["6081", "6080"]):
            status['yes'] += 1;
            status['alien'] = alien[0].split(".")[0];
        else:
            status['no'] += 1;

while True:
    status = {
        'yes': 0,
        'no': 0,
        'alien': ""
    }

    time_now = "";
    shadowing();

    if (status['yes'] != 0):
        write_file('shadowing.log', time_now,"Возможное соединение через VNC с машины", status['alien']);
        print(time_now,"Возможное соединение через VNC с машины", status['alien']);
    else:
        write_file('shadowing.log', time_now, "Соединений через VNC нет", str(status['no']));
        print(time_now, "Соединений через VNC нет", status['no']);
    sleep(15.0);