import axios, { AxiosResponse } from "axios";
import FormData from "form-data";

const userCredentials = {
  password: "BsU^j5oYQNy43FCvPr8%",
  email: "philip.dein@proton.me"
};

export async function loginUser(): Promise<string> {
  const { csrfToken, sessionId } = await getCsrfTokenAndSessionId();
  const session = authenticate(userCredentials, csrfToken, sessionId);
  return session;
}

async function authenticate(credentials, csrfToken, sessionId) {
  const formData = new FormData();
  formData.append("login", credentials.email);
  formData.append("password", credentials.password);
  formData.append("csrf_token", csrfToken);

  let response: AxiosResponse;
  try {
    response = await axios.post("https://medlem.dds.dk/web/login", formData, { headers: {
      ...formData.getHeaders(),
      Cookie: `session_id=${sessionId};frontend_lang=da_DDS`
    }});
  } catch(error) {
    //handle wrong creds being used
    console.error("failed to login to ms", error);
    throw error;
  }
  return getSessionId(response.headers);
}

async function getCsrfTokenAndSessionId() {
  let response: AxiosResponse;
  try {
    response = await axios.get("https://medlem.dds.dk/web/login");
  } catch(error) {
    console.log("error getting CSRF prevention token", error);
    throw new Error("failed to get CSRF prevention token");
  }
  const csrfToken:string = response.data.match(/<input[^>]+name="csrf_token"[^>]+value="([^"]+)"[^>]+>/i)[1];
  const sessionId:string = getSessionId(response.headers);

  return {
    csrfToken,
    sessionId
  };
}

function getSessionId(headers) {
  const setCookie = headers["set-cookie"].find((cookie) => cookie.startsWith("session_id="));
  const [ _, sessionId ] = setCookie.match(/^session_id=([^;]+);/i);
  return sessionId;
}
