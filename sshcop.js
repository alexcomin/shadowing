const { exec } = require('child_process');

const whiteList = ['127.0.0.1']
let activeSessions = {}

class Cop {
    execute(command) {
        return new Promise(resolve => {
            exec(command, (err, stdout, stderr) => {
                resolve(stdout)
            })
        })
    }

    parse(string) {
        let data = string.split('\n')
        let result = []
        data.forEach(elem => {
            result.push(elem.split(' ').filter(word => word))
        });
        return result.slice(0, -1)
    }

    alien(arr) {
        let alien = {}
        for (let i = 0; i < arr.length; i++) {
            if(arr[i].slice(-1)[0].match(/([\d]{1,3}\.){1,3}([\d]{1,3})/) != null) {
                alien[arr[i][1]] = {name: arr[i][0], ip: arr[i][4].replace(/[()]/g, '')}
            }
        }
        return alien
    }

    async searchPid(object) {
        let id = Object.keys(object)
        for (let i = 0; i < id.length; i++) {
            let string = await this.execute(`ps aux | grep ${id[i]}`)
            let a = string.split('\n')
            for (let j in a) {
                if (a[j].match(/sshd:/) != null) {
                    object[id[i]]['pid'] = a[j].split(' ').filter(value => value)[1]
                }
            }
        }
        return object
    }

    async killPid(object) {
        for (let i in object) {
            if (!!~whiteList.indexOf(object[i].ip)) {
                if (i in activeSessions && activeSessions[i] == 1) {
                    continue
                } else {
                    activeSessions[i] = 1
                    await this.execute(`sendmess "Connection User ${object[i].name} ip(${object[i].ip})"`)
                }
            } else {
                await this.execute(`kill ${object[i].pid}`)
                await this.execute(`sendmess "Kill User ${object[i].name} ip(${object[i].ip}) pid(${object[i].pid})"`)
            }
            
        }
    }

    async run(command) {
        let result = await this.execute('who')
        let alien = this.alien(this.parse(result))
        let modPid = await this.searchPid(alien)
        if (Object.keys(modPid).length != 0) {
            this.killPid(modPid) 
        } else {
            activeSessions = {}
        }
    }
}

setInterval(() => {
    let cop = new Cop()
    cop.run()
}, 5000)