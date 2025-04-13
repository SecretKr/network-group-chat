import Cookies from "js-cookie";

export interface UserData {
  success: boolean;
  _id: string;
  name: string;
  token: string;
}

export const saveUserToCookie = (user: UserData) => {
  Cookies.set("userData", JSON.stringify(user), { expires: 7 });
};

export const getUserFromCookie = (): UserData | null => {
  const saved = Cookies.get("userData");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch (err) {
    Cookies.remove("userData");
    console.error("Failed to parse userData from cookie:", err);
    return null;
  }
};

export const removeUserCookie = () => {
  Cookies.remove("userData");
};
