import express from "express";
import axios, { AxiosResponse } from "axios";

const app = express();
const port = 5000;

const token = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJhYWMxYmYxNmE2NzUzZThkN2U4MmNhMzQ3NzU4YmNlZWMyMjdlNDgxIiwiZ3JvdXBIYXNEYXRhUHJvY2Vzc2luZ0FncmVlbWVudCI6ZmFsc2UsImlhdCI6MTY5MzE2MjY3NH0.-6tRmBS3tpL_yKKNLFf3O8arSbMgqr1AU4PWVfaWgJUYh6U5oq3l4ZS-4U0Ou1DFZrOeAlI_JU_HtTBFCM5mFg";

app.get("/health", (req, res) => {
  res.send("all good");
});

app.listen(port, () => {
  return console.info(`Server is running on port http://localhost:${port}`);
});


// Get all active members of a group (organization in Odoo)
// Count all members 24 and under (Disregard all leader-types for members under 25)
// Find all members without leadership functions and count them

monthlyMemberCount(token)
  .then(() => {
    console.log("now what");
  })
  .catch(console.error)

async function monthlyMemberCount(token: string) {
  const allMembers = await getAllMembers(token);
  // const youngMembers = getYoungMembers();
  // const getOlderMembers = getOldMembers();
  // const numberOfYoungMembers: number = countMembers();
  // const numberOfOlderMember: number = countMembers();
  // const memberCount: number = numberOfOlderMember + numberOfYoungMembers;
  // return memberCount;
}

async function getAllMembers(token: string) {
  const data = {
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

  const config = {
    Headers: {
      Authorization: `Bearer ${token}`,
      Cookie: "session_id=2ed1542c44e42fa0dcc2745d458a97b1b2a3001e; HttpOnly;"
    },
    
    data: data
  };
  let response: AxiosResponse;
  try {
    response = await axios.post("https://ms-proxy-api.deranged.dk/query", config, { withCredentials: true });
  } catch(error) {
    //Probably will have to handle stored user not having access anymore at some point
    throw error
  }
  console.log(response.data);
}
