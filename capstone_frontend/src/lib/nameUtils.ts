/**
 * Name formatting utilities
 * Handles proper display of names with middle initials
 */

/**
 * Formats a full name with middle initial
 * @param firstName - First name
 * @param middleName - Middle name (will be converted to initial)
 * @param lastName - Last name
 * @returns Formatted name with middle initial (e.g., "Aeron M. Bagunu")
 */
export function formatNameWithMiddleInitial(
  firstName: string,
  middleName: string | null | undefined,
  lastName: string
): string {
  const parts = [
    firstName,
    middleName ? `${middleName.charAt(0).toUpperCase()}.` : '',
    lastName
  ].filter(Boolean);
  
  return parts.join(' ');
}

/**
 * Formats a user's display name with middle initial
 * Handles user objects from API
 */
export function formatUserDisplayName(user: {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
}): string {
  return formatNameWithMiddleInitial(
    user.first_name,
    user.middle_name,
    user.last_name
  );
}

/**
 * Gets the middle initial from a middle name
 * @param middleName - Middle name
 * @returns Middle initial with period (e.g., "M.") or empty string
 */
export function getMiddleInitial(middleName: string | null | undefined): string {
  return middleName ? `${middleName.charAt(0).toUpperCase()}.` : '';
}
