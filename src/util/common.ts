import { MessageConnection } from 'vscode-jsonrpc';
import { EventEmitter } from 'events';
import * as assert from 'assert';

export class Common {

    static async sendSimpleRequest(connection: MessageConnection, messageType: any, payload: any, timeout: number, timeoutMessage: string): Promise<any> {
        const timer = setTimeout(() => {
            return Promise.reject(timeoutMessage);
        }, timeout);

        return connection.sendRequest(messageType, payload).then(result => {
            clearTimeout(timer);
            return Promise.resolve(result);
        });
    }

    static async sendNotificationSync(connection: MessageConnection, messageType: any, payload: any,
        emitter: EventEmitter, eventId: string, timeout: number, timeoutMessage: string): Promise<any> {
        const timer = setTimeout(() => {
            return Promise.reject(timeoutMessage);
        }, timeout);

        return new Promise<any>(resolve => {
            const listener = ((params: any) => {
                let equal = true;
                for (const key in params) {
                    if (payload[key] && params[key]) {
                        try {
                            assert.deepEqual(payload[key], params[key]);
                        } catch (err) {
                            equal = false;
                            break;
                        }
                    }
                }

                if (equal) {
                    clearTimeout(timer);
                    emitter.removeListener(eventId, listener);
                    resolve(params);
                }
            });

            emitter.on(eventId, listener);
            connection.sendNotification(messageType, payload);
        });
    }
}

export namespace ErrorMessages {
    export const FINDBEANS_TIMEOUT = 'Failed to retrieve server beans in time';
    export const ADDPATH_TIMEOUT = 'Failed to add discovery path in time';
    export const REMOVEPATH_TIMEOUT = 'Failed to remove discovery path in time';
    export const GETPATHS_TIMEOUT = 'Failed to retrieve discovery paths in time';
    export const GETSERVERS_TIMEOUT = 'Failed to retrieve servers in time';
    export const GETREQUIREDATTRS_TIMEOUT = 'Failed to retrieve required server attributes in time';
    export const GETOPTIONALATTRS_TIMEOUT = 'Failed to retrieve optional server attributes in time';
    export const DELETESERVERSYNC_TIMEOUT = 'Failed to delete server in time';
    export const GETLAUNCHMODES_TIMEOUT = 'Failed to get launch modes in time';
    export const GETREQUIREDLAUNCHATTRS_TIMEOUT = 'Failed to get required launch attributes in time';
    export const GETOPTIONALLAUNCHATTRS_TIMEOUT = 'Failed to get optional launch attributes in time';
    export const GETLAUNCHCOMMAND_TIMEOUT = 'Failed to get launch command in time';
    export const SERVERSTARTINGBYCLIENT_TIMEOUT = 'Failed to notify of server starting in time';
    export const SERVERSTARTEDBYCLIENT_TIMEOUT = 'Failed to notify of server started in time';
    export const STARTSERVER_TIMEOUT = 'Failed to start server in time';
    export const STOPSERVER_TIMEOUT = 'Failed to stop server in time';
}