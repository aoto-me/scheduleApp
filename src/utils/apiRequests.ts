import axios from "axios";
import { ResponseData } from "../types";

export const fetchData = <T>(
  apiUrl: string | undefined,
  id: string,
  token: string,
  tableType: string,
  setData: (data: T[]) => void,
  setLoading: (loading: boolean) => void,
) => {
  if (!apiUrl) {
    console.error("APIが設定されていません");
    return;
  }
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append("userId", id);
  urlSearchParams.append("csrfToken", token);
  urlSearchParams.append("tableType", tableType);
  axios
    .post<{
      success: boolean;
      data?: T[];
      error?: string;
    }>(apiUrl, urlSearchParams, { withCredentials: true })
    .then((response) => {
      if (response.data.success) {
        setData(response.data.data as T[]);
      } else {
        console.error(response.data.error);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      setLoading(false);
    });
};

export const sendRequest = async (
  apiUrl: string | undefined,
  data: URLSearchParams,
) => {
  if (!apiUrl) {
    console.error("APIが設定されていません");
    return undefined;
  }
  try {
    const response = await axios.post<ResponseData>(apiUrl, data);
    if (response.data.success) {
      return response.data;
    }
    console.error(response.data.error);
  } catch (error) {
    console.error(error);
  }
  return undefined;
};
