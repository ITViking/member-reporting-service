import express from "express";
import axios, { AxiosResponse } from "axios";
import FormData from "form-data";

const port = 5000;
const userCredentials = {
  password: "BsU^j5oYQNy43FCvPr8%",
  email: "philip.dein@proton.me"
};

export default async() => {
  const app = express();

  app.get("/health", (req, res) => {
    res.send("all good");
  });

  let sessionId: string;
  try {
    sessionId = await loginUser();
  } catch(error) {
    console.log("failed to login user for some reason", error);
    throw error;
  }
  await monthlyMemberCount(sessionId);

  return app;
}



// app.listen(port, () => {
//   return console.info(`Server is running on port http://localhost:${port}`);
// });


// Get all active members of a group (organization in Odoo)
// Count all members 24 and under (Disregard all leader-types for members under 25)
// Find all members without leadership functions and count them
async function loginUser(): Promise<string> {
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

async function monthlyMemberCount(sessionId: string) {
  const allMembers = await getAllMembers(sessionId);
  // const youngMembers = getYoungMembers();
  // const getOlderMembers = getOldMembers();
  // const numberOfYoungMembers: number = countMembers();
  // const numberOfOlderMember: number = countMembers();
  // const memberCount: number = numberOfOlderMember + numberOfYoungMembers;
  // return memberCount;
}

async function getAllMembers(sessionId: string) {
  const activeMembersQuery = {
    model: "member.profile",
    fields: [
      "name",
      "age",
      "state"
    ],
    domain: [
      [
        "state",
        "=",
        "active"
      ]
    ],
    context: {
      "domain": [
        [
          "state",
          "=",
          "active"
        ]
      ],
      lang: "da_DDS",
      tz: "Europe/Copenhagen",
      uid: 11552,
      search_default_state: "active",
      params: {
        action: 544
      },
      bin_size: true
    },
    offset: 0,
    sort: "state ASC, name ASC"
  };

  const result = await query(activeMembersQuery, sessionId)
  console.log(result.result.records);
}

async function query(params: object, sessionsId: string) {
  let response: AxiosResponse;
  try {
    response = await axios.post("https://medlem.dds.dk/web/dataset/search_read", {
      jsonrpc: "2.0",
      method: "call",
      params,
    }, { headers: {
      Cookie: `session_id=${sessionsId};frontend_lang=da_DDS`
    }});
  } catch(error) {
    //Probably will have to handle stored user not having access anymore at some point
    console.error("failed to get all members", error);
    throw error
  }

  return response.data;
}
