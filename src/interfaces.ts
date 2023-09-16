export interface Role {
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

export interface UserFunctions {
  memberId: number,
  functions: MemberServiceId[]
}

export interface Member {
  id: number,
  member_id: MemberServiceId,
  state: string,
  name: string,
  age: number,
  functions: [],
}

export type MemberServiceId = [number, string];