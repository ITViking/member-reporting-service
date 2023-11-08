export type Role = {
  id: number,
  organization_id: MemberServiceId,
  member_id: MemberServiceId,
  function_type_id: MemberServiceId,
  active: boolean,
  member_name: string
  member_number: string,
  leader_function: boolean,
  board_function: boolean
}

export type UserFunctions = {
  memberId: number,
  functions: MemberServiceId[]
}

export type Member = {
  id: number,
  member_id: MemberServiceId,
  state: string,
  name: string,
  age: number,
  functions: [],
}

export type MemberServiceId = [number, string];
