import Setting from "../models/setting.modal"

export const getApiShipping = async () => {
  const setting = await Setting.findOne({
    key: "apiShipping"
  });
  return setting ? setting.data : null;
}
