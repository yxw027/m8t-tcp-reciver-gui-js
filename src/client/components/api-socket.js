import axios from 'axios';

export default class ApiSocket {
    constructor() {
        this.instance = axios.create({
            baseURL: DEVELOPMENT ? `http://${REMOTE_API_URL}` : API_URL,
            timeout: 12000,
            method: 'post'
            //maxContentLength: 40000
        });
        this.headers = {
            json: {
                'Content-Type': 'application/json'
            }
        };
        this.types = {
            query: 'query',
            mutation: 'mutation',
            action: 'action'
        };
        this.components = {
            receiver: 'receiver',
            wifi: 'wifi',
            server: 'server',
            ntrip: 'ntrip'
        };

        console.log({ baseUrl: this.instance.baseURL });
    }

    setNtripClient = (enable, options) => {
        return this.action({
            component: this.components.ntrip,
            cmd: enable ? 'start' : 'stop',
            ...options
        });
    };

    getNtripState = async () => {
        return this.query({
            component: this.components.ntrip,
            type: this.types.query,
            cmd: 'state'
        });
    };

    getWifiList = () => {
        return this.query({
            component: this.components.wifi,
            type: this.types.query,
            cmd: 'scan'
        });
    };

    getWifiInfo = () => {
        return this.query({
            component: this.components.wifi,
            type: this.types.query,
            cmd: 'info'
        });
    };

    //connectWiFiSTA = (ssid, password) => {
    //    return new Promise(async (reslove, reject) => {
    //        try {
    //            const resp = await this.instance({
    //                method: 'post',
    //                //url: '/service',
    //                headers: this.headers.json,
    //                //baseURL: 'http://192.168.1.62',
    //                data: {
    //                    type: this.types.action,
    //                    component: this.components.wifi,
    //                    cmd: 'connect',
    //                    ssid,
    //                    password,
    //                    id: Date.now()
    //                }
    //            });
    //            reslove(resp);
    //        } catch (err) {
    //            reject(err);
    //        }
    //    });
    //};

    connectWiFiSTA = (ssid, password) => {
        return this.action({
            component: this.components.wifi,
            cmd: 'connect',
            ssid,
            password
        });
    };

    getReceiverState = () => {
        return this.query({
            component: this.components.receiver,
            type: this.types.query,
            cmd: 'state'
        });
    };

    setReceive = (enable, writeToSd = null, sendToTcp = null) => {
        const options = {
            component: this.components.receiver,
            cmd: enable ? 'start' : 'stop'
        };
        if (enable) {
            if (writeToSd != null) {
                options.writeToSd = writeToSd;
            }

            if (sendToTcp != null) {
                options.sendToTcp = sendToTcp;
            }
        }

        return this.action(options);
    };

    getServerInfo = async () => {
        return this.query({
            component: this.components.server,
            type: this.types.query,
            cmd: 'info'
        });
    };

    query = options => {
        return new Promise(async (reslove, reject) => {
            const {
                component,
                type = this.types.query,
                cmd,
                ...args
            } = options;
            try {
                const resp = await this.instance({
                    method: 'post',
                    headers: this.headers.json,
                    data: {
                        type,
                        component,
                        cmd,
                        id: Date.now(),
                        ...args
                    }
                });
                if (resp.status === 200) {
                    const {
                        value,
                        req_id,
                        resp_id,
                        error,
                        ...other
                    } = resp.data;
                    reslove({
                        data: value,
                        req_id,
                        resp_id,
                        error,
                        ...other
                    });
                } else {
                    reject({
                        error: {
                            message: `Error response status: ${resp.status}`,
                            resp
                        }
                    });
                }
            } catch (err) {
                reject(err);
            }
        });
    };

    action = options => {
        options.type = this.types.action;
        return this.query(options);
    };

    WiFiModes = {
        WIFI_STA: 'WIFI_STA',
        WIFI_AP_STA: 'WIFI_AP_STA',
        WIFI_STA: 'WIFI_STA',
        unknown: 'unknown'
    };
}
