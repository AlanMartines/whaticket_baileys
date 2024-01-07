import { isJidGroup } from "@whiskeysockets/baileys";

const checker = async (idGroup: string) => {
  const validGroup = await isJidGroup(`${idGroup}@g.us`);
  return validGroup;
};

const checkGroup = async (
  numberGroup: string
): Promise<any> => {
  let isGroupExit = await checker(numberGroup);

  return isGroupExit;
};

export default checkGroup;
