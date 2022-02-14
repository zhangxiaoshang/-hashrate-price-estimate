import getDataHelper from "../../lib/get-data";

export default async function getData(req, res) {
  const data = await getDataHelper();
  return res.status(200).json(data);
}
