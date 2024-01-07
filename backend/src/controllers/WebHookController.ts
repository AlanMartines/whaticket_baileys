import { WASocket, downloadMediaMessage } from "@whiskeysockets/baileys";
import axios from 'axios';
import * as requestPromise from 'request-promise';
import https from 'https';
import moment from "moment";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

const webhook_api = process.env.WH_API || null;
const webhook_painel = process.env.WH_PAINEL || null;

const tokenAdmin = process.env.TOKEN_ADMIN || null;
const apiUrlAdmin = process.env.API_URL_ADMIN || null;

type Session = WASocket & {
	id?: number;
};

const convertBytes = async (bytes: number): Promise<string> => {
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	if (bytes === 0) {
		return "n/a";
	}
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
	if (i === 0) {
		return bytes + " " + sizes[i];
	}
	return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

function convertHMS(value: string | number): string {
	const sec = parseInt(value.toString(), 10); // convert value to number if it's string
	let hours: string | number = Math.floor(sec / 3600); // get hours
	let minutes: string | number = Math.floor((sec - (hours * 3600)) / 60); // get minutes
	let seconds: string | number = sec - (hours * 3600) - (minutes * 60); // get seconds
	// add 0 if value < 10; Example: 2 => 02
	if (hours < 10) { hours = "0" + hours; }
	if (minutes < 10) { minutes = "0" + minutes; }
	if (seconds < 10) { seconds = "0" + seconds; }
	return hours + ':' + minutes + ':' + seconds; // Return is HH:MM:SS
}

export const wh_status = async (
	wbot: Session,
	whatsapp: Whatsapp,
	events: any
): Promise<any> => {
	try {
		//
		const resWhatsapp = await Whatsapp.findOne({ where: { id: whatsapp.id } });
		//
		let name = resWhatsapp?.name;
		let token = resWhatsapp?.token.trim();
		let wh_status = resWhatsapp?.wh_status;
		let webhook = webhook_api ? webhook_api : resWhatsapp?.webhook_cli;
		//
		const message = events;
		logger?.warn(`SessionName: ${name}`);
		//logger?.info(`Messages update: ${JSON.stringify(message, null, 2)}`);
		// logic of your application...
		let phone = await wbot?.user?.id.split(":")[0];
		let onAck = message[0]?.update?.status;
		//logger?.info(`onAck: ${onAck}`);
		let status: string;
		switch (onAck) {
			case 5:
				status = 'PLAYED'
				break;
			case 4:
				status = 'READ'
				break;
			case 3:
				status = 'RECEIVED'
				break;
			case 2:
				status = 'SENT'
				break;
			case 1:
				status = 'PENDING'
				break;
			case 0:
				status = 'ERROR'
				break;
		}
		logger?.warn(`Listen to ack ${onAck}, status ${status}`);
		//
		let response = {
			"SessionName": name,
			"token": token,
			"wook": 'MESSAGE_STATUS',
			"status": status,
			"id": message[0]?.key?.id,
			"from": message[0]?.key?.fromMe == true ? phone : message[0]?.key?.remoteJid?.split(':')[0].split('@')[0],
			"to": message[0]?.key?.fromMe == false ? phone : message[0]?.key?.remoteJid?.split(':')[0].split('@')[0],
			"dateTime": moment(new Date())?.format('YYYY-MM-DD HH:mm:ss')
		}
		//
		if (wh_status && webhook) {
			//
			if (response) {
				let dataJson = JSON.stringify(response, null, 2);
				await axios.post(webhook, dataJson, {
					httpsAgent: new https.Agent({
						rejectUnauthorized: false,
						keepAlive: true
					}),
					headers: {
						'Content-type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then((response) => {
					logger.warn('Webhooks status')
				}).catch(error => {
					logger?.error(`Error status: ${error.message}`);
				});
			}
			//
		} else {
			logger.warn('Webhooks status disable');
		}
	} catch (error) {
		console.log(error);
		logger?.error(`Error status: ${error.message}`);
	};
}

export const wh_messages = async (
	wbot: Session,
	whatsapp: Whatsapp,
	events: any
): Promise<any> => {
	try {
		//
		const resWhatsapp = await Whatsapp.findOne({ where: { id: whatsapp.id } });
		//
		let name = resWhatsapp?.name;
		let token = resWhatsapp?.token.trim();
		let wh_message = resWhatsapp?.wh_message;
		let webhook = webhook_api ? webhook_api : resWhatsapp?.webhook_cli;
		//
		const m = events;
		logger?.warn(`SessionName: ${name}`);
		//
		const msg = m?.messages[0];
		//logger?.info(`receiveMessage\n ${JSON.stringify(msg, null, 2)}`);
		//
		var type = null;
		var response = null;
		//
		if (msg?.key?.remoteJid != 'status@broadcast') {
			//
			logger?.warn(`Type: ${m.type}`);
			//
			if (msg?.message?.locationMessage) {
				type = 'location';
			} else if (msg?.message?.liveLocationMessage) {
				type = 'liveLocation';
			} else if (msg?.message?.imageMessage) {
				type = 'image';
			} else if (msg?.message?.documentMessage) {
				type = 'document';
			} else if (msg?.message?.audioMessage) {
				type = 'audio';
			} else if (msg?.message?.contactMessage) {
				type = 'vcard';
			} else if (msg?.message?.conversation) {
				type = 'text';
			} else if (msg?.message?.extendedTextMessage) {
				type = 'extended';
			} else if (msg?.message?.videoMessage) {
				type = 'video';
			} else if (msg?.message?.viewOnceMessageV2?.message?.videoMessage) {
				type = 'videoV2';
			} else if (msg?.message?.stickerMessage) {
				type = 'sticker';
			} else if (msg?.message?.viewOnceMessage?.message?.buttonsMessage) {
				type = 'button';
			} else if (msg?.message?.buttonsResponseMessage) {
				type = 'buttonsResponse';
			} else if (msg?.message?.templateMessage) {
				type = 'templateMessage';
			} else if (msg?.message?.templateButtonReplyMessage) {
				type = 'templateResponse';
			} else if (msg?.message?.viewOnceMessage?.message?.listMessage) {
				type = 'listMessage';
			} else if (msg?.message?.listResponseMessage) {
				type = 'listResponseMessage';
			} else if (msg?.message?.protocolMessage?.historySyncNotification) {
				type = 'historySync';
			} else if (msg?.message?.reactionMessage) {
				type = 'reactionMessage';
			} else {
				type = undefined;
			}
			//
			logger?.warn(`Type message: ${type}`);
			let phone = await wbot?.user?.id.split(":")[0];
			//
			switch (type) {
				case 'text':
					logger?.info('Message text');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'text',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"content": msg?.message?.conversation,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'image':
					logger?.info('Message image');
					//
					//@ts-ignore
					var buffer = await downloadMediaMessage(msg, 'buffer');
					var string64 = buffer.toString('base64');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'image',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"caption": msg?.message?.imageMessage?.caption != undefined ? msg?.message?.imageMessage?.caption : null,
						"mimetype": msg?.message?.imageMessage?.mimetype != undefined ? msg?.message?.imageMessage?.mimetype : null,
						"fileLength": await convertBytes(msg?.message?.audioMessage?.fileLength),
						"base64": string64,
						"height": msg?.message?.imageMessage?.height != undefined ? msg?.message?.imageMessage?.height : null,
						"width": msg?.message?.imageMessage?.width != undefined ? msg?.message?.imageMessage?.width : null,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					//
					break;
				case 'sticker':
					logger?.info('Message sticker');
					//
					//@ts-ignore
					var buffer = await downloadMediaMessage(msg, 'buffer');
					var string64 = buffer.toString('base64');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'image',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"caption": msg?.message?.stickerMessage?.caption != undefined ? msg?.message?.stickerMessage?.caption : null,
						"mimetype": msg?.message?.stickerMessage?.mimetype != undefined ? msg?.message?.stickerMessage?.mimetype : null,
						"isAnimated": msg?.message?.stickerMessage?.isAnimated,
						"base64": string64,
						"height": msg?.message?.stickerMessage?.height != undefined ? msg?.message?.stickerMessage?.height : null,
						"width": msg?.message?.stickerMessage?.width != undefined ? msg?.message?.stickerMessage?.width : null,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					//
					break;
				case 'audio':
					logger?.info('Message audio');
					//
					//@ts-ignore
					var buffer = await downloadMediaMessage(msg, 'buffer');
					var string64 = buffer.toString('base64');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'audio',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"mimetype": msg?.message?.audioMessage?.mimetype != undefined ? msg?.message?.audioMessage?.mimetype : null,
						"fileLength": await convertBytes(msg?.message?.audioMessage?.fileLength),
						"time": convertHMS(msg?.message?.audioMessage?.seconds),
						"base64": string64,
						"ptt": msg?.message?.audioMessage?.ptt,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					//
					break;
				case 'video':
					logger?.info('Message video');
					//
					//@ts-ignore
					var buffer = await downloadMediaMessage(msg, 'buffer');
					var string64 = buffer.toString('base64');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'video',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"caption": msg?.message?.videoMessage?.caption != undefined ? msg?.message?.videoMessage?.caption : null,
						"mimetype": msg?.message?.videoMessage?.mimetype != undefined ? msg?.message?.videoMessage?.mimetype : null,
						"fileLength": await convertBytes(msg?.message?.videoMessage?.fileLength),
						"base64": string64,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					//
					break;
				case 'videoV2':
					logger?.info('Message type: video');
					//
					//@ts-ignore
					var buffer = await downloadMediaMessage(msg, 'buffer');
					var string64 = buffer.toString('base64');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"status": msg?.key?.fromMe == true ? 'SEND' : 'RECEIVED',
						"type": 'video',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"caption": msg?.message?.viewOnceMessageV2?.message?.videoMessage?.caption ? msg?.message?.viewOnceMessageV2?.message?.videoMessage?.caption : '',
						"mimetype": msg?.message?.viewOnceMessageV2?.message?.videoMessage?.mimetype ? msg?.message?.viewOnceMessageV2?.message?.videoMessage?.mimetype : null,
						"fileLength": msg?.message?.viewOnceMessageV2?.message?.videoMessage?.fileLength ? await convertBytes(msg?.message?.viewOnceMessageV2?.message?.videoMessage?.fileLength) : null,
						"seconds": msg?.message?.viewOnceMessageV2?.message?.videoMessage?.seconds ? msg?.message?.viewOnceMessageV2?.message?.videoMessage?.seconds : 0,
						"base64": string64,
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					//
					break;
				case 'location':
					logger?.info('Message location');
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'location',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"loc": msg?.message?.locationMessage?.degreesLatitude,
						"lat": msg?.message?.locationMessage?.degreesLongitude,
						"url": "https://maps.google.com/maps?q=" + msg?.message?.locationMessage?.degreesLatitude + "," + msg?.message?.locationMessage?.degreesLongitude,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'liveLocation':
					logger?.info('Message liveLocation');
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'liveLocation',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"loc": msg?.message?.liveLocationMessage?.degreesLatitude,
						"lat": msg?.message?.liveLocationMessage?.degreesLongitude,
						"caption": msg?.message?.liveLocationMessage?.caption,
						"url": "https://maps.google.com/maps?q=" + msg?.message?.liveLocationMessage?.degreesLatitude + "," + msg?.message?.liveLocationMessage?.degreesLongitude,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'document':
					logger?.info('Message document');
					//
					//@ts-ignore
					var buffer = await downloadMediaMessage(msg, 'buffer');
					var string64 = buffer.toString('base64');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'document',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"caption": msg?.message?.documentMessage?.caption != undefined ? msg?.message?.documentMessage?.caption : null,
						"mimetype": msg?.message?.documentMessage?.mimetype != undefined ? msg?.message?.documentMessage?.mimetype : null,
						"base64": string64,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					//
					break;
				case 'vcard':
					logger?.info('Message vcard');
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'vcard',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"displayName": msg?.message?.contactMessage?.displayName,
						"vcard": msg?.message?.contactMessage?.vcard,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'button':
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'button',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"buttonsMessage": msg?.message?.viewOnceMessage?.message?.buttonsMessage,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'buttonsResponse':
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'buttonsResponse',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"selectedButtonId": msg?.message?.buttonsResponseMessage.selectedButtonId,
						"selectedDisplayText": msg?.message?.buttonsResponseMessage.selectedDisplayText,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'templateMessage':
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'templateMessage',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"templateMessage": msg?.message?.templateMessage?.hydratedTemplate?.hydratedButtons,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'templateResponse':
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'templateResponse',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"selectedId": msg?.message?.templateButtonReplyMessage?.selectedId,
						"selectedDisplayText": msg?.message?.templateButtonReplyMessage?.selectedDisplayText,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'listMessage':
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'listMessage',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"listMessage": msg?.message?.viewOnceMessage?.message?.listMessage,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'listResponseMessage':
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'listResponseMessage',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"listResponseMessage": msg?.message?.listResponseMessage,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'extended':
					logger?.info('Message extended');
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'extended',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"isGroup": msg?.key?.remoteJid?.split('@')[1] == 'g.us' ? true : false,
						"matchedText": msg?.message?.extendedTextMessage?.matchedText,
						"canonicalUrl": msg?.message?.extendedTextMessage?.canonicalUrl,
						"description": msg?.message?.extendedTextMessage?.description,
						"title": msg?.message?.extendedTextMessage?.title,
						"content": msg?.message?.extendedTextMessage?.text,
						"quotedMessage": msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation,
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					break;
				case 'historySync':
					logger?.info('Message historySync');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'historySync',
						"fromMe": msg?.key?.fromMe,
						"id": msg?.key?.id,
						"name": msg?.pushName || msg?.verifiedBizName || null,
						"from": msg?.key?.fromMe == true ? phone : msg?.key?.remoteJid?.split('@')[0],
						"to": msg?.key?.fromMe == false ? phone : msg?.key?.remoteJid?.split('@')[0],
						"status": msg?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.messageTimestamp * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					//
					break;
				case 'reactionMessage':
					logger?.info('Message reactionMessage');
					//
					response = {
						"SessionName": name,
						"token": token,
						"wook": msg?.message?.reactionMessage?.key?.fromMe == true ? 'SEND_MESSAGE' : 'RECEIVE_MESSAGE',
						"type": 'reactionMessage',
						"fromMe": msg?.message?.reactionMessage?.key?.fromMe,
						"id": msg?.message?.reactionMessage?.key?.id,
						"from": msg?.message?.reactionMessage?.key?.fromMe == true ? phone : msg?.message?.reactionMessage?.key?.remoteJid?.split('@')[0],
						"to": msg?.message?.reactionMessage?.key?.fromMe == false ? phone : msg?.message?.reactionMessage?.key?.remoteJid?.split('@')[0],
						"content": msg?.message?.reactionMessage?.text,
						"status": msg?.message?.reactionMessage?.key?.fromMe == true ? 'SENT' : 'RECEIVED',
						"datetime": moment(msg?.message?.reactionMessage?.senderTimestampMs * 1000)?.format('YYYY-MM-DD HH:mm:ss')
					}
					//
					break;
				default:
					//
					response = null;
					logger?.info(`Desculpe, estamos sem nenhuma resposta no momento.`);
					if (!msg?.message?.senderKeyDistributionMessage && !msg?.message?.protocolMessage) {
						logger?.error(`${JSON.stringify(msg?.message, undefined, 2)}`);
					}
				//
			}
			if (wh_message && webhook) {
				//
				if (response) {
					let dataJson = JSON.stringify(response, null, 2);
					await axios.post(webhook, dataJson, {
						httpsAgent: new https.Agent({
							rejectUnauthorized: false,
							keepAlive: true
						}),
						headers: {
							'Content-type': 'application/json; charset=utf-8',
							'Accept': 'application/json; charset=utf-8'
						}
					}).then(response => {
						logger.warn('Webhooks message')
					}).catch(error => {
						logger?.error(`Error message: ${error.message}`);
					});
				}
				//
			} else {
				logger.warn('Webhooks message disable');
			}
		}
	} catch (error) {
		logger?.error(`Error message: ${error.message}`);
	};
};

export const wh_connect = async (
	wbot: Session,
	whatsapp: Whatsapp
): Promise<any> => {
	try {
		//
		const resWhatsapp = await Whatsapp.findOne({ where: { id: whatsapp.id } });
		//
		let name = resWhatsapp?.name;
		let token = resWhatsapp?.token.trim();
		let wh_connect = resWhatsapp?.wh_connect;
		let webhook = webhook_api ? webhook_api : resWhatsapp?.webhook_cli;
		let phone = await wbot?.user?.id?.split(":")[0];
		//
		let response = {
			"SessionName": name,
			"token": token,
			"wook": 'STATUS_CONNECT',
			'status': resWhatsapp?.status,
			'number': phone
		}
		//
		if (wh_connect && webhook) {
			//
			if (response) {
				let dataJson = JSON.stringify(response, null, 2);
				await axios.post(webhook, dataJson, {
					httpsAgent: new https.Agent({
						rejectUnauthorized: false,
						keepAlive: true
					}),
					headers: {
						'Content-type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(response => {
					logger.warn('Webhooks connect')
				}).catch(error => {
					logger?.error(`Error connect: ${error.message}`);
				});
			}
			//
		} else {
			logger.warn('Webhooks connect disable');
		}
	} catch (error) {
		logger?.error(`Error connect: ${error.message}`);
	};
};

export const wh_qrcode = async (
	whatsapp: Whatsapp,
	qrcode: string
): Promise<any> => {
	try {
		//
		const resWhatsapp = await Whatsapp.findOne({ where: { id: whatsapp.id } });
		//
		let name = resWhatsapp?.name;
		let token = resWhatsapp?.token.trim();
		let wh_qrcode = resWhatsapp?.wh_qrcode;
		let webhook = webhook_api ? webhook_api : resWhatsapp?.webhook_cli;
		//
		let response = {
			"SessionName": name,
			"token": token,
			"state": "QRCODE",
			"status": "qrRead",
			"qrcode": qrcode
		}
		//
		if (wh_qrcode && webhook) {
			//
			if (response) {
				let dataJson = JSON.stringify(response, null, 2);
				await axios.post(webhook, dataJson, {
					httpsAgent: new https.Agent({
						rejectUnauthorized: false,
						keepAlive: true
					}),
					headers: {
						'Content-type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(response => {
					logger.warn('Webhooks qrcode')
				}).catch(error => {
					logger?.error(`Error qrcode: ${error.message}`);
				});
			}
			//
		} else {
			logger.warn('Webhooks qrcode disable');
		}
	} catch (error) {
		logger?.error(`Error qrcode: ${error.message}`);
	};
};

export const profilePictureUrl = async (
	wbot: Session,
	whatsapp: Whatsapp
): Promise<any> => {
	try {
		//
		const resWhatsapp = await Whatsapp.findOne({ where: { id: whatsapp.id } });
		//
		let name = resWhatsapp?.name;
		let token = resWhatsapp?.token.trim();
		//
		let phone = await wbot?.user?.id?.split(":")[0];
		const ppUrl = await wbot?.profilePictureUrl(`${phone}@s.whatsapp.net`, 'image').then(async (result) => {
			//
			return result;
			//
		}).catch(async (erro) => {
			logger.error(`Error profilePictureUrl in Full-Res image: ${erro?.message}`);
			//
			return await wbot?.profilePictureUrl(`${phone}@s.whatsapp.net`).then(async (result) => {
				//
				return result;
				//
			}).catch((erro) => {
				logger.error(`Error profilePictureUrl: ${erro?.message}`);
				//
				return 'https://w7.pngwing.com/pngs/178/595/png-transparent-user-profile-computer-icons-login-user-avatars-thumbnail.png';
				//
			});
		});
		//
		let response = {
			"SessionName": name,
			"token": token,
			"wook": "profilePicture",
			"ppUrl": ppUrl,
			"phone": phone
		}
		//
		if (webhook_painel) {
			//
			if (response) {
				let urlPainelWh = `${webhook_painel}/whaticketapi/whaticketapi.php`
				let dataJson = JSON.stringify(response, null, 2);
				await axios.post(urlPainelWh, dataJson, {
					httpsAgent: new https.Agent({
						rejectUnauthorized: false,
						keepAlive: true
					}),
					headers: {
						'Content-type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(response => {
					logger.warn('Webhooks profilePictureUrl')
				}).catch(error => {
					logger?.error(`Error profilePictureUrl: ${error.message}`);
				});
			}
			//
		} else {
			logger.warn('Webhooks profilePictureUrl disable');
		}
	} catch (error) {
		logger?.error(`Error profilePictureUrl: ${error.message}`);
	};
};

export const updateStatus = async (
	wbot: Session,
	whatsapp: Whatsapp,
	state: string,
	status: string,
): Promise<any> => {
	try {
		//
		const resWhatsapp = await Whatsapp.findOne({ where: { id: whatsapp.id } });
		//
		let name = resWhatsapp?.name;
		let token = resWhatsapp?.token.trim();
		let phone = await wbot?.user?.id?.split(":")[0];
		//
		let response = {
			"SessionName": name,
			"token": token,
			"wook": "updateStatus",
			"state": state,
			"status": status,
			"phone": phone
		}
		//
		if (webhook_painel) {
			//
			if (response) {
				let urlPainelWh = `${webhook_painel}/whaticketapi/whaticketapi.php`
				let dataJson = JSON.stringify(response, null, 2);
				await axios.post(urlPainelWh, dataJson, {
					httpsAgent: new https.Agent({
						rejectUnauthorized: false,
						keepAlive: true
					}),
					headers: {
						'Content-type': 'application/json; charset=utf-8',
						'Accept': 'application/json; charset=utf-8'
					}
				}).then(response => {
					logger.warn('Webhooks updateStatus')
				}).catch(error => {
					logger?.error(`Error updateStatus: ${error.message}`);
				});
			}
			//
		} else {
			logger.warn('Webhooks updateStatus disable');
		}
	} catch (error) {
		logger?.error(`Error updateStatus: ${error.message}`);
	};
};

export const validateOffLine = async (
	phoneNotify: any,
	responseType: string,
): Promise<any> => {
	//
	const resType = {
		sendVoiceBase64: "sendVoiceBase64",
		sendText: "sendText",
		sendTextMassa: "sendTextMassa",
		sendFileBase64: "sendFileBase64",
		sendFileBase64Massa: "sendFileBase64Massa",
		sendTextGrupo: "sendTextGrupo",
		sendFileBase64Grupo: "sendFileBase64Grupo",
		getAllGroups: "getAllGroups",
		createGroup: "createGroup",
		joinGroup: "joinGroup",
		checkNumberStatus: "checkNumberStatus",
		connectionClosed: "ConnectionClosed",
	};
	//
	if (phoneNotify && responseType) {
		//
		try {
			//
			let resBody: object = {};
			switch (responseType) {
				case resType.sendVoiceBase64:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos enviar sue áudio.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.sendText:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos enviar sua mensagem de texto.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.sendTextMassa:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": '*Connect Zap*\nOlá! Não conseguimos enviar sua mensagem de texto.\nNenhuma conta WhatsApp está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão.'
					}
					//
					break;
				case resType.sendFileBase64:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos enviar seu arquivo.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.sendFileBase64Massa:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": '*Connect Zap*\nOlá! Não conseguimos enviar seu arquivo.\nNenhuma conta WhatsApp está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão.'
					}
					//
					break;
				case resType.sendTextGrupo:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos enviar sua mensagem de texto.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.sendFileBase64Grupo:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos enviar seu arquivo.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.getAllGroups:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos obter a lista de grupos.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.createGroup:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos criar o grupo.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.joinGroup:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos entra no grupo.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.checkNumberStatus:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos verificar o numero.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				case resType.connectionClosed:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos enviar sua mensagem.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
					//
					break;
				default:
					//
					resBody = {
						"SessionName": `${tokenAdmin}`,
						"phonefull": `${phoneNotify}`,
						"msg": "*Connect Zap*\nOlá! Não conseguimos enviar sua mensagem.\nSua conta WhatsApp não está conectada na plataforma da Connect Zap.\nPor favor, acesse\nhttps://painel.connectzap.com.br,\nfaça o login e realize a conexão."
					}
				//
			}
			//
			if (apiUrlAdmin) {
				//
				if (resBody) {
					let urlPainelWh = `${apiUrlAdmin}/sistema/sendText`;
					let dataJson = JSON.stringify(resBody, null, 2);
					//
					await axios.post(urlPainelWh, dataJson, {
						httpsAgent: new https.Agent({
							rejectUnauthorized: false,
							keepAlive: true
						}),
						headers: {
							'Content-type': 'application/json; charset=utf-8',
							'Accept': 'application/json; charset=utf-8'
						}
					}).then(async (response) => {
						logger.warn('Webhooks notfyWaStatus')
					}).catch(async (error) => {
						logger?.error(`Error notfyWaStatus: ${error.message}`);
						//logger?.warn(`${JSON.stringify(error.response?.data, null, 2)}`);
					});
					//
					
					//
					// var options = {
					// 	'method': 'POST',
					// 	"rejectUnauthorized": false,
					// 	'json': true,
					// 	'url': `${apiUrlAdmin}/sistema/sendText`,
					// 	body: resBody
					// };
					// //
					// await requestPromise.post(options).then(async (result) => {
					// 	logger.warn('Webhooks notfyWaStatus')
					// }).catch(async (error) => {
					// 	logger?.error(`Error notfyWaStatus: ${error.message}`);
					// 	//logger?.warn(`${JSON.stringify(error.response?.data, null, 2)}`);
					// });
					// //
					
					//
				}
				//
			} else {
				logger.warn('Webhooks notfyWaStatus disable');
			}
		} catch (error) {
			logger?.error(`Error notfyWaStatus: ${error.message}`);
		};
		//
	} else {
		logger.warn('Phone company and response type not set notfyWaStatus');
	}
};