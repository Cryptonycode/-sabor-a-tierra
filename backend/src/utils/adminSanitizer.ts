import { Admin, AdminPublic } from '../types/database';

export const sanitizeAdmin = (admin: Admin | AdminPublic): AdminPublic => {
  const { password_hash, ...sanitizedAdmin } = admin as Admin;
  return sanitizedAdmin;
};

export const sanitizeAdmins = (admins: Array<Admin | AdminPublic>): AdminPublic[] => {
  return admins.map(sanitizeAdmin);
};
