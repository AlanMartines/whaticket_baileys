import GetWhatsApp from "../../helpers/GetWhatsApp";
import { getWbot } from "../../libs/wbot";

interface IOnWhatsapp {
  jid: string;
  exists: boolean;
}

const checker = async (number: string, wbot: any) => {
  const [validNumber] = await wbot.onWhatsApp(`${number}@s.whatsapp.net`);
  return validNumber;
};

const CheckNumberStatus = async (
  number: string,
  whatsappId: number
): Promise<IOnWhatsapp> => {
  const Whatsapp = await GetWhatsApp(whatsappId);
  const wbot = getWbot(Whatsapp.id);
  const isNumberExit = await checker(number, wbot);

  return isNumberExit;
};

export default CheckNumberStatus;
