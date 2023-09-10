import axios, { AxiosResponse } from "axios";
import { UserFunctions, Role, MemberServiceId } from "./interfaces";

export async function monthlyMemberCount(sessionId: string) {
  const allMembers = await getAllMembers(sessionId);
  let membersWithFunctions;
  const functions = await getPersonnel(sessionId);
  // membersWithFunctions = await assignMembersTheirFunctions(allMembers, functions);
  // const youngMembers = getYoungMembers();
  // const getOlderMembers = getOldMembers();
  // const numberOfYoungMembers: number = countMembers();
  // const numberOfOlderMember: number = countMembers();
  // const memberCount: number = numberOfOlderMember + numberOfYoungMembers;
  // return memberCount;
}

async function getPersonnel(sessionId: string) {
  const activePersonnelQuery = {
    model: "member.function",
    domain: [
        [
            "is_in_my_organizations",
            "=",
            true
        ],
        [
            "active",
            "=",
            true
        ],
        [
          "function_type_id",
          ">",
          1
        ]
    ],
    fields: [
        "member_name",
        "organization_id",
        "member_number",
        "member_id",
        "function_type_id",
        "active",
        "leader_function",
        "board_function"
    ],
    limit: 1000,
    sort: "",
    context: {
        "lang": "da_DDS",
        "tz": "Europe/Copenhagen",
        "uid": 11552,
        "show_org_path": true,
        "limit_orgs": true
    }
  }
  const result = await query(activePersonnelQuery, sessionId);
  return groupFunctionsByMember(result.result.records);
}

function groupFunctionsByMember(functions: Role[]) {
  const functionsGroupedByUser = {};
  for(let { member_id, function_type_id} of functions) {
    if(!functionsGroupedByUser[member_id[0]]) {
      functionsGroupedByUser[member_id[0]] = [function_type_id];
      continue;
    }
    const membersFunctions = functionsGroupedByUser[member_id[0]];
    functionsGroupedByUser[member_id[0]] = membersFunctions.concat([function_type_id]);
  }
  return functionsGroupedByUser;
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
  // console.log(result.result.records);
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


