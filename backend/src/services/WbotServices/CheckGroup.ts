import { isJidGroup } from "@whiskeysockets/baileys";

const checker = async (idGroup: string) => {
  const validGroup = await isJidGroup(`${idGroup}@g.us`);
  return validGroup;
};

const checkGroup = async (
  numberGroup: string
): Promise<any> => {
  let isGroupExit = await checker(numberGroup);

  if (!isGroupExit) {
    throw new Error("ERR_CHECK_GROUPID");
  }

  return isGroupExit;
};

export default checkGroup;
