import getDataHelper from "../../lib/get-data";

export default async function getData(req, res) {
  try {
    const data = await getDataHelper();
    return res.status(200).json(data);
  } catch (error) {
    res.status(200).json(null);
  }
}
