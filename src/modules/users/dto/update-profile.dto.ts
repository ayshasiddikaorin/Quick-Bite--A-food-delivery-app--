/** Fields a user is allowed to change via PATCH /auth/me */
export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  avatar?: string;
}
