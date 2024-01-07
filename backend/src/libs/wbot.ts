import * as Sentry from "@sentry/node";
import { toDataURL } from "qrcode";
import makeWASocket, {
  AuthenticationState,
  DisconnectReason,
  WASocket,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import P from "pino";

import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger";
import { useMultiFileAuthState } from "../helpers/useMultiFileAuthState";
import { Boom } from "@hapi/boom";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import { cacheLayer } from "./cache";
import { release } from "os";
import { wh_qrcode, wh_connect } from "../controllers/WebHookController";

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

type Session = WASocket & {
  id?: number;
};

const sessions: Session[] = [];

const retriesQrCodeMap = new Map<number, number>();

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout();
        sessions[sessionIndex].ws.close();
      }

      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      (async () => {
        const io = getIO();

        const whatsappUpdate = await Whatsapp.findOne({
          where: { id: whatsapp.id }
        });

        if (!whatsappUpdate) return;

        const { id, name, provider } = whatsappUpdate;

        const { version, isLatest } = await fetchLatestBaileysVersion();

        logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
        logger.info(`Starting session ${name}`);
        let retriesQrCode = 0;

        let wsocket: Session = null;

        const { state, saveCreds } = await useMultiFileAuthState(whatsapp);
				
        wsocket = makeWASocket({
          logger: loggerBaileys,
          printQRInTerminal: false,
          auth: {
            creds: state.creds,
						//@ts-ignore
            keys: makeCacheableSignalKeyStore(state.keys, logger),
          },
          version,
					browser: ['ConnectZap - API', 'Chrome', release()],
          shouldIgnoreJid: jid => isJidBroadcast(jid),
          patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
              message.buttonsMessage
              || message.templateMessage
              || message.listMessage
            );
            if (requiresPatch) {
              message = {
                viewOnceMessageV2: {
                  message: {
                    messageContextInfo: {
                      deviceListMetadataVersion: 2,
                      deviceListMetadata: {},
                    },
                    ...message,
                  },
                },
              };
            }

            return message;
          }
        });

				/*
        wsocket = makeWASocket({
          logger: loggerBaileys,
          printQRInTerminal: false,
          auth: state as AuthenticationState,
          version,
					browser: ['ConnectZap - API', 'Chrome', release()],
          shouldIgnoreJid: jid => isJidBroadcast(jid),
          patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
              message.buttonsMessage
              || message.templateMessage
              || message.listMessage
            );
            if (requiresPatch) {
              message = {
                viewOnceMessageV2: {
                  message: {
                    messageContextInfo: {
                      deviceListMetadataVersion: 2,
                      deviceListMetadata: {},
                    },
                    ...message,
                  },
                },
              };
            }

            return message;
          }
        });
				*/
				
        wsocket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {

            logger.info(`Socket ${name} Connection Update ${connection || ""} \n${JSON.stringify(lastDisconnect, undefined,2) || ""}`);

            if (connection === "close") {
							//
							const resDisconnectReason = {
								loggedOut: 401,
								bannedTimetamp: 402,
								bannedTemporary: 403,
								timedOut: 408,
								connectionLost: 408,
								multideviceMismatch: 411,
								connectionClosed: 428,
								connectionReplaced: 440,
								badSession: 500,
								restartRequired: 515,
							};
							//
							const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
							switch (statusCode) {
								case resDisconnectReason.loggedOut:
									// Device Logged Out, Deleting Session
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection loggedOut');
									//

									//
									break;
								case resDisconnectReason.timedOut:
									//
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection timedOut');
									//

									//
									break;
								case resDisconnectReason.bannedTemporary:
									//
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection bannedTemporary');
									//

									//
									break;
								case resDisconnectReason.bannedTimetamp:
									//
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection bannedTimetamp');
									//

									//
									break;
								case resDisconnectReason.connectionLost:
									//
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection connectionLost');
									//

									//
									break;
								case resDisconnectReason.multideviceMismatch:
									//
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection multideviceMismatch');
									//

									//
									break;
								case resDisconnectReason.connectionClosed:
									//
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection connectionClosed');
									//

									//
									break;
								case resDisconnectReason.connectionReplaced:
									//
									// Connection Replaced, Another New Session Opened, Please Close Current Session First
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection connectionReplaced');
									//

									//
									break;
								case resDisconnectReason.badSession:
									//
									// Bad session file, delete and run again
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection badSession');
									//

									//
									break;
								case resDisconnectReason.restartRequired:
									//
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn('Connection restartRequired');
									//
									break;
								default:
									// code block
									logger.warn(`SessionName: ${whatsapp.name}`);
									logger.warn(`Connection lastDisconnect: ${lastDisconnect?.error}`);
									//
							}
							//
              if ((lastDisconnect?.error as Boom)?.output?.statusCode === 403) {
                await whatsapp.update({ status: "PENDING", session: "" });
								await wh_connect(wsocket, whatsapp);
                await DeleteBaileysService(whatsapp.id);
                await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
              }
              if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                removeWbot(id, false);
                setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.companyId), 2000);
              } else {
                await whatsapp.update({ status: "PENDING", session: "" });
								await wh_connect(wsocket, whatsapp);
                await DeleteBaileysService(whatsapp.id);
                await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
                removeWbot(id, false);
                setTimeout(() => StartWhatsAppSession(whatsapp, whatsapp.companyId), 2000);
              }
            }

            if (connection === "open") {
              await whatsapp.update({
                status: "CONNECTED",
                qrcode: "",
                retries: 0,
                userConn: wsocket?.user?.id?.split(":")[0]
              });
							await wh_connect(wsocket, whatsapp);
              io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });

              const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
              if (sessionIndex === -1) {
                wsocket.id = whatsapp.id;
                sessions.push(wsocket);
              }

              resolve(wsocket);
            }

            if (qr !== undefined) {
              if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
                await whatsappUpdate.update({
                  status: "DISCONNECTED",
                  qrcode: ""
                });
								await wh_connect(wsocket, whatsapp);
								//
                await DeleteBaileysService(whatsappUpdate.id);
                await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsappUpdate
                });
                wsocket.ev.removeAllListeners("connection.update");
                wsocket.ws.close();
                wsocket = null;
                retriesQrCodeMap.delete(id);
              } else {
                logger.info(`Session QRCode Generate ${name}`);
                retriesQrCodeMap.set(id, (retriesQrCode += 1));
								//
								const readQRCode = await toDataURL(qr);
								await wh_qrcode(whatsapp, readQRCode);
								//
                await whatsapp.update({
                  qrcode: qr,
                  status: "qrcode",
                  retries: 0
                });
                const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);

                if (sessionIndex === -1) {
                  wsocket.id = whatsapp.id;
                  sessions.push(wsocket);
                }

                io.emit(`company-${whatsapp.companyId}-whatsappSession`, {
                  action: "update",
                  session: whatsapp
                });
              }
            }
          }
        );
        wsocket.ev.on("creds.update", saveCreds);
				//
				// ===============================================================================================//
				//


				//
				// ===============================================================================================//
				//
      })();
    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      reject(error);
    }
  });
};
