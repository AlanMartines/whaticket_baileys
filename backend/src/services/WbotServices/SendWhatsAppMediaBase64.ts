import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import { decode } from "base64-arraybuffer";
import { verifyMediaMessage } from "./wbotMessageListener";

interface Request {
	ticket: Ticket;
	number?: string;
	body?: string;
	base64?: string;
	originalname?: string;
	caption?: string;
	gifPlayback?: boolean;
	buffer: ArrayBuffer;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string): Promise<string> => {
	const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
	return new Promise((resolve, reject) => {
		exec(
			`${ffmpegPath.path} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`,
			(error, _stdout, _stderr) => {
				if (error) reject(error);
				//fs.unlinkSync(outputAudio);
				resolve(outputAudio);
			}
		);
	});
};

const processAudioFile = async (audio: string): Promise<string> => {
	const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
	return new Promise((resolve, reject) => {
		exec(
			`${ffmpegPath.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`,
			(error, _stdout, _stderr) => {
				if (error) reject(error);
				//fs.unlinkSync(outputAudio);
				resolve(outputAudio);
			}
		);
	});
};

export const getMessageOptionsBase64 = async (
	base64,
	originalname,
	caption,
): Promise<any> => {
	const buffer = decode(base64);
	const base64File = base64.split(';base64,').pop();
	const pathMedia = `${publicFolder}/${new Date().getTime()}_${originalname}`;
	/*
	fs.writeFile(pathMedia, base64File, { encoding: 'base64' }, (err) => {
		if (err) {
			console.error(err);
		}
		console.log('File created:', originalname);
	});
	*/
	fs.writeFileSync(pathMedia, base64File, { encoding: 'base64' });
	const mimeType = mime.lookup(pathMedia);
	const typeMessage = mimeType.split("/")[0];
	try {
		if (!mimeType) {
			throw new Error("Invalid mimetype");
		}
		let options: AnyMessageContent;

		if (typeMessage === "video") {
			options = {
				video: fs.readFileSync(pathMedia),
				caption: caption,
				fileName: originalname,
				gifPlayback: true
			};
		} else if (typeMessage === "audio") {
			const typeAudio = originalname.includes("audio-record-site");
			const convert = await processAudio(pathMedia);
			if (typeAudio) {
				options = {
					audio: fs.readFileSync(convert),
					mimetype: typeAudio ? "audio/mp4" : mimeType,
					ptt: true
				};
				fs.unlinkSync(convert);
			} else {
				options = {
					audio: fs.readFileSync(convert),
					mimetype: typeAudio ? "audio/mp4" : mimeType,
					ptt: true
				};
				fs.unlinkSync(convert);
			}
		} else if (typeMessage === "document") {
			options = {
				document: fs.readFileSync(pathMedia),
				caption: caption,
				fileName: originalname,
				mimetype: mimeType
			};
			fs.unlinkSync(pathMedia);
		} else if (typeMessage === "application") {
			options = {
				document: fs.readFileSync(pathMedia),
				caption: caption,
				fileName: originalname,
				mimetype: mimeType
			};
			fs.unlinkSync(pathMedia);
		} else {
			options = {
				image: fs.readFileSync(pathMedia),
				caption: caption
			};
			fs.unlinkSync(pathMedia);
		}
		return options;
	} catch (e) {
		Sentry.captureException(e);
		console.log(e);
		return null;
	}
};

const SendWhatsAppMediaBase64 = async ({
	base64,
	originalname,
	caption,
	ticket
}: Request): Promise<WAMessage> => {
	try {
		const wbot = await GetTicketWbot(ticket);
		const buffer = decode(base64);
		const base64File = base64.split(';base64,').pop();
		const pathMedia = `${publicFolder}/${new Date().getTime()}_${originalname}`;
		/*
		fs.writeFile(pathMedia, base64File, { encoding: 'base64' }, (err) => {
			if (err) {
				console.error(err);
			}
			console.log('File created:', originalname);
		});
		*/
		fs.writeFileSync(pathMedia, base64File, { encoding: 'base64' });
		const mimeType = mime.lookup(pathMedia);
		const typeMessage = mimeType.split("/")[0];
		let options: AnyMessageContent;

		if (typeMessage === "video") {
			options = {
				video: fs.readFileSync(pathMedia),
				caption: caption,
				fileName: originalname,
				gifPlayback: true
			};
		} else if (typeMessage === "audio") {
			const typeAudio = originalname.includes("audio-record-site");
			if (typeAudio) {
				const convert = await processAudio(pathMedia);
				options = {
					audio: fs.readFileSync(convert),
					mimetype: typeAudio ? "audio/mp4" : mimeType,
					ptt: true
				};
				fs.unlinkSync(convert);
			} else {
				const convert = await processAudioFile(pathMedia);
				options = {
					audio: fs.readFileSync(convert),
					mimetype: typeAudio ? "audio/mp4" : mimeType
				};
				fs.unlinkSync(convert);
			}
		} else if (typeMessage === "document" || typeMessage === "text") {
			options = {
				document: fs.readFileSync(pathMedia),
				caption: caption,
				fileName: originalname,
				mimetype: mimeType
			};
			fs.unlinkSync(pathMedia);
		} else if (typeMessage === "application") {
			options = {
				document: fs.readFileSync(pathMedia),
				caption: caption,
				fileName: originalname,
				mimetype: mimeType
			};
			fs.unlinkSync(pathMedia);
		} else {
			options = {
				image: fs.readFileSync(pathMedia),
				caption: caption
			};
			fs.unlinkSync(pathMedia);
		}

		const sentMessage = await wbot.sendMessage(
			`${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
			{
				...options
			}
		);

		await ticket.update({ lastMessage: originalname });

		if (sentMessage.message?.documentMessage) {
			verifyMediaMessage(sentMessage, ticket, ticket.contact, ticket.companyId)
		}

		return sentMessage;
	} catch (err) {
		Sentry.captureException(err);
		console.log(err);
		throw new AppError("ERR_SENDING_WAPP_MSG");
	}
};

export default SendWhatsAppMediaBase64;
